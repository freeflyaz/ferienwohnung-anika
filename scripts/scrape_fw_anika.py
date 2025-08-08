#!/usr/bin/env python3
"""
Scrape apartment page from ferienwohnung-anika.de and download images + extract text.

Usage:
  python scripts/scrape_fw_anika.py \
    --url "https://ferienwohnung-anika.de/Unsere-Wohnungen/Seestadel-in-der-Seestrasse" \
    --out "assets/seestadel"

Outputs:
  - Saves images into assets/<name>/ with sequential filenames
  - Writes a metadata JSON (title, description, images) next to the folder

Notes:
  - For personal migration/backup. Respect robots.txt and TOS. Do not abuse.
"""
import argparse
import json
import os
import re
import sys
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
}

IMG_EXT_ALLOW = {".jpg", ".jpeg", ".png", ".webp"}


def sanitize_filename(name: str) -> str:
    name = name.strip().lower()
    name = re.sub(r"[^a-z0-9-_]+", "-", name)
    name = re.sub(r"-+", "-", name).strip("-")
    return name or "images"


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def choose_best_src(img_tag, base_url: str) -> str | None:
    # Prefer data-src/data-original, then srcset highest-res, then src
    candidate = img_tag.get("data-src") or img_tag.get("data-original")
    if candidate:
        return urljoin(base_url, candidate)

    srcset = img_tag.get("srcset")
    if srcset:
        variants = []
        for part in srcset.split(","):
            part = part.strip()
            if not part:
                continue
            bits = part.split()
            url = bits[0]
            scale = 1
            if len(bits) > 1 and bits[1].endswith("w"):
                try:
                    scale = int(bits[1][:-1])
                except Exception:
                    scale = 1
            variants.append((scale, url))
        if variants:
            variants.sort(key=lambda x: x[0], reverse=True)
            return urljoin(base_url, variants[0][1])

    src = img_tag.get("src")
    if src:
        return urljoin(base_url, src)

    return None


def is_likely_content_image(url: str) -> bool:
    """Lightweight negative filter to skip obvious non-content images.

    Do NOT require an image extension here, because many sites serve images
    via extension-less URLs or query-based CDNs. We'll validate by
    Content-Type during download.
    """
    path = urlparse(url).path.lower()
    if any(t in path for t in ["icon", "logo", "sprite", "placeholder", "tracking", "pixel"]):
        return False
    return True


def extract_style_background_urls(style_value: str) -> list[str]:
    """Extract URLs from CSS background-image declarations in a style attribute."""
    if not style_value:
        return []
    urls: list[str] = []
    try:
        # Match url("..."), url('...'), url(...)
        for match in re.finditer(r"url\(([^)]+)\)", style_value, re.IGNORECASE):
            raw = match.group(1).strip().strip('"\'')
            if raw:
                urls.append(raw)
    except Exception:
        pass
    return urls


def src_from_source_tag(source_tag, base_url: str) -> list[str]:
    """Collect candidate URLs from <source> tags (e.g., within <picture>)."""
    results: list[str] = []
    srcset = source_tag.get("srcset")
    if srcset:
        for part in srcset.split(","):
            part = part.strip()
            if not part:
                continue
            url = part.split()[0]
            if url:
                results.append(urljoin(base_url, url))
    src = source_tag.get("src")
    if src:
        results.append(urljoin(base_url, src))
    return results


def iter_candidate_image_urls(soup: BeautifulSoup, base_url: str) -> list[str]:
    """Collect candidate image URLs from various elements on the page."""
    candidates: list[str] = []

    # 1) <img>
    for img in soup.find_all("img"):
        best = choose_best_src(img, base_url)
        if best:
            candidates.append(best)

    # 2) <source> (inside <picture> or media)
    for source in soup.find_all("source"):
        candidates.extend(src_from_source_tag(source, base_url))

    # 3) Inline styles with background-image
    for any_tag in soup.find_all(style=True):
        for raw in extract_style_background_urls(any_tag.get("style")):
            candidates.append(urljoin(base_url, raw))

    # 4) <a href="..."> that points to an image-like URL
    for a in soup.find_all("a"):
        href = a.get("href")
        if not href:
            continue
        full = urljoin(base_url, href)
        path = urlparse(full).path.lower()
        ext = os.path.splitext(path)[1]
        if ext in IMG_EXT_ALLOW:
            candidates.append(full)

    # Deduplicate while preserving order
    seen: set[str] = set()
    ordered: list[str] = []
    for u in candidates:
        if u and u not in seen:
            seen.add(u)
            ordered.append(u)
    return ordered


def _group_best_variants(candidates: list[str]) -> list[str]:
    """For known CDN patterns (e.g., cm4all picture-N), keep the highest-res only.

    Example: https://.../.foo.jpeg/picture-200, /picture-800, /picture-1600 -> keep 1600.
    """
    best_by_base: dict[str, tuple[int, str]] = {}
    matched_urls: set[str] = set()
    pattern = re.compile(r"^(?P<base>.+?)/picture-(?P<size>\d+)(?:\b|$)")

    for url in candidates:
        m = pattern.match(url)
        if not m:
            continue
        matched_urls.add(url)
        base = m.group("base")
        size = int(m.group("size"))
        current = best_by_base.get(base)
        if current is None or size > current[0]:
            best_by_base[base] = (size, url)

    grouped = [v[1] for v in best_by_base.values()]
    # Preserve original order as much as possible: iterate candidates and pick chosen ones
    chosen_set = set(grouped)
    ordered_grouped: list[str] = []
    seen: set[str] = set()
    for url in candidates:
        if url in chosen_set and url not in seen:
            ordered_grouped.append(url)
            seen.add(url)
    # Append others (non-matching pattern) in original order
    for url in candidates:
        if url in matched_urls:
            continue
        if url not in chosen_set and url not in seen:
            ordered_grouped.append(url)
            seen.add(url)
    return ordered_grouped


def extract_text(soup: BeautifulSoup) -> dict:
    # Try to find main heading and a descriptive section
    title = None
    for sel in ["article h1", "main h1", "h1", ".content h1"]:
        node = soup.select_one(sel)
        if node and node.get_text(strip=True):
            title = node.get_text(strip=True)
            break

    # Description: first long paragraph under main content
    description = None
    for sel in ["article", "main", ".content", "#content", "body"]:
        area = soup.select_one(sel)
        if not area:
            continue
        paras = [p.get_text(" ", strip=True) for p in area.select("p")]
        paras = [p for p in paras if len(p) > 80]
        if paras:
            description = paras[0]
            break

    return {"title": title, "description": description}


def scrape(url: str, out_dir: str) -> dict:
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # Gather images from multiple sources
    candidates = [u for u in iter_candidate_image_urls(soup, url) if is_likely_content_image(u)]
    ordered = _group_best_variants(candidates)

    # Download
    ensure_dir(out_dir)
    downloaded = []
    # Build per-request headers including Referer to improve compatibility
    download_headers = dict(HEADERS)
    download_headers["Referer"] = url

    for idx, img_url in enumerate(ordered, start=1):
        try:
            r = requests.get(img_url, headers=download_headers, timeout=30)
            r.raise_for_status()
            # Validate content-type is an image
            ct = r.headers.get("content-type", "").lower()
            path_lower = urlparse(img_url).path.lower()
            has_ext_in_path = bool(re.search(r"\.(jpe?g|png|webp)(?:$|[/?])", path_lower))
            if not ct.startswith("image/") and not any(x in ct for x in ["jpeg", "jpg", "png", "webp"]) and not has_ext_in_path:
                # Skip non-image responses only if we cannot infer image type from URL either
                continue

            # pick extension from path or content-type
            ext = os.path.splitext(urlparse(img_url).path)[1].lower()
            if ext not in IMG_EXT_ALLOW:
                if "png" in ct:
                    ext = ".png"
                elif "webp" in ct:
                    ext = ".webp"
                elif "jpeg" in ct or "jpg" in ct:
                    ext = ".jpg"
                else:
                    # Try from URL if content-type unhelpful
                    if has_ext_in_path:
                        m = re.search(r"\.(jpe?g|png|webp)(?:$|[/?])", path_lower)
                        sub = m.group(1) if m else "jpg"
                        ext = ".jpg" if sub.startswith("jp") else f".{sub}"
                    else:
                        ext = ".jpg"
            fname = f"img-{idx:02d}{ext}"
            fpath = os.path.join(out_dir, fname)
            with open(fpath, "wb") as f:
                f.write(r.content)
            downloaded.append({"file": fpath, "source": img_url})
        except Exception as e:
            print(f"warn: failed {img_url}: {e}", file=sys.stderr)

    # Text
    text = extract_text(soup)

    meta = {
        "source_url": url,
        "title": text.get("title"),
        "description": text.get("description"),
        "images": downloaded,
    }

    # Write metadata JSON next to out_dir
    meta_path = os.path.join(out_dir, "metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"Found {len(ordered)} candidates; saved {len(downloaded)} images to {out_dir}")
    print(f"Metadata: {meta_path}")
    return meta


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True, help="Apartment page URL")
    parser.add_argument("--out", required=True, help="Output directory for assets")
    args = parser.parse_args()

    out_dir = args.out
    ensure_dir(out_dir)

    scrape(args.url, out_dir)


if __name__ == "__main__":
    main()
