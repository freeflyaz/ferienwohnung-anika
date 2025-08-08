#!/usr/bin/env python3
"""
Convert scraper metadata to an APARTMENTS entry snippet for app.js

Usage:
  python scripts/meta_to_apartment_json.py --meta assets/seestadel/metadata.json --id seestadel --name "Seestadel – Seestraße"

Prints a JSON object you can paste into APARTMENTS in app.js.
"""
import argparse
import json
import os
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--meta", required=True, help="Path to metadata.json produced by the scraper")
    parser.add_argument("--id", required=True, help="Apartment id (slug)")
    parser.add_argument("--name", required=True, help="Apartment display name")
    parser.add_argument("--short", default="", help="Short line like 'Sleeps 2 · 40 m²'")
    parser.add_argument("--price", type=float, default=120.0, help="Price per night (EUR)")
    parser.add_argument("--cleaning", type=float, default=45.0, help="Cleaning fee (EUR)")
    parser.add_argument("--min_nights", type=int, default=3, help="Minimum nights")
    parser.add_argument("--max_guests", type=int, default=2, help="Max guests")
    args = parser.parse_args()

    meta_path = Path(args.meta)
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    images = meta.get("images", [])
    base_dir = meta_path.parent

    photos = []
    for it in images:
        file_path = Path(it.get("file", ""))
        try:
            rel = os.path.relpath(file_path, start=Path.cwd())
        except Exception:
            rel = str(file_path)
        photos.append({
            "src": rel.replace("\\", "/"),
            "alt": args.name
        })

    apartment = {
        "id": args.id,
        "name": args.name,
        "short": args.short,
        "pricePerNight": args.price,
        "cleaningFee": args.cleaning,
        "minNights": args.min_nights,
        "maxGuests": args.max_guests,
        "photos": photos,
        "blockedDates": [],
        "description": meta.get("description"),
        "source": meta.get("source_url"),
    }

    print(json.dumps(apartment, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
