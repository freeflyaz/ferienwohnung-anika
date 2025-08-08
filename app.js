/*
  Haus Säuling – Booking & UI Script (vanilla JS)
  - Apartments config
  - Gallery rendering + lightbox
  - Booking date picker (flatpickr) with disabled dates per apartment
  - Price calculation and mailto request
*/

const CONTACT_EMAIL = "ferienwohnung-anika@t-online.de";

// Apartments configuration – three available apartments
const APARTMENTS = [
  {
    id: "seestadel",
    name: "Seestadel – Seestraße",
    short: "Sleeps 3 · 46 m²",
    pricePerNight: 125,
    pricePerNightLowSeason: 99,
    cleaningFee: 45,
    minNights: 3,
    maxGuests: 3,
    bedrooms: 1,
    sqm: 46,
    photos: [
      { src: "assets/seestadel/img-01.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-02.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-03.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-04.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-05.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-06.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-07.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-08.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-09.jpg", alt: "Seestadel – Seestraße" },
      { src: "assets/seestadel/img-10.jpg", alt: "Seestadel – Seestraße" }
    ],
    blockedDates: [],
    description: "Ferienwohnung \"Seestadel\" (46 sqm) im 1.Stock für 1-3 Personen - 1 Schlafzimmer + Ausziehcouch im Wohnzimmer. Hauptsaison €125/Nacht, Nebensaison €99/Nacht für 1-3 Personen.",
    source: "https://ferienwohnung-anika.de/Unsere-Wohnungen/Seestadel-in-der-Seestrasse",
  },
  {
    id: "dorfstadel",
    name: "Dorfstadel",
    short: "Sleeps 5 · 100 m²",
    pricePerNight: 100,
    pricePerNightLowSeason: 90,
    cleaningFee: 45,
    minNights: 3,
    maxGuests: 5,
    bedrooms: 2,
    sqm: 100,
    photos: [
      { src: "assets/dorfstadel/img-01.jpg", alt: "Dorfstadel – exterior" },
      { src: "assets/dorfstadel/img-02.jpg", alt: "Dorfstadel – living room" },
      { src: "assets/dorfstadel/img-03.jpg", alt: "Dorfstadel – bedroom 1" },
      { src: "assets/dorfstadel/img-04.jpg", alt: "Dorfstadel – bedroom 2" },
      { src: "assets/dorfstadel/img-05.jpg", alt: "Dorfstadel – kitchen" },
      { src: "assets/dorfstadel/img-06.jpg", alt: "Dorfstadel – bathroom" },
      { src: "assets/dorfstadel/img-07.jpg", alt: "Dorfstadel – dining area" },
      { src: "assets/dorfstadel/img-08.jpg", alt: "Dorfstadel – view" },
      { src: "assets/dorfstadel/img-09.jpg", alt: "Dorfstadel – detail" },
      { src: "assets/dorfstadel/img-10.jpg", alt: "Dorfstadel – balcony" }
    ],
    blockedDates: [],
    description: "Geräumige Ferienwohnung \"Dorfstadel\" (100 sqm) für 1-5 Personen mit 2 Schlafzimmern. Hauptsaison €100/Nacht, Nebensaison €90/Nacht.",
    source: "https://ferienwohnung-anika.de/Unsere-Wohnungen/Dorfstadel-im-Mitteldorf",
  },
  {
    id: "bergwiesenstadel",
    name: "Bergwiesenstadel",
    short: "Sleeps 5 · 100 m²",
    pricePerNight: 115,
    pricePerNightLowSeason: 95,
    cleaningFee: 45,
    minNights: 3,
    maxGuests: 5,
    bedrooms: 2,
    sqm: 100,
    photos: [
      { src: "assets/bergwiesenstadel/img-01.jpg", alt: "Bergwiesenstadel – exterior" },
      { src: "assets/bergwiesenstadel/img-02.jpg", alt: "Bergwiesenstadel – living room" },
      { src: "assets/bergwiesenstadel/img-03.jpg", alt: "Bergwiesenstadel – bedroom 1" },
      { src: "assets/bergwiesenstadel/img-04.jpg", alt: "Bergwiesenstadel – bedroom 2" },
      { src: "assets/bergwiesenstadel/img-05.jpg", alt: "Bergwiesenstadel – kitchen" },
      { src: "assets/bergwiesenstadel/img-06.jpg", alt: "Bergwiesenstadel – bathroom" },
      { src: "assets/bergwiesenstadel/img-07.jpg", alt: "Bergwiesenstadel – dining area" },
      { src: "assets/bergwiesenstadel/img-08.jpg", alt: "Bergwiesenstadel – terrace" },
      { src: "assets/bergwiesenstadel/img-09.jpg", alt: "Bergwiesenstadel – view" },
      { src: "assets/bergwiesenstadel/img-10.jpg", alt: "Bergwiesenstadel – detail" }
    ],
    blockedDates: [],
    description: "Moderne Ferienwohnung \"Bergwiesenstadel\" (100 sqm) für 1-5 Personen mit 2 Schlafzimmern. Hauptsaison €115/Nacht, Nebensaison €95/Nacht.",
    source: "https://ferienwohnung-anika.de/Unsere-Wohnungen/Bergwiesenstadel-im-Mitteldorf",
  }
];

// Additional surrounding/area images – use local photos for demo
const AREA_PHOTOS = [
  { src: "assets/seestadel/img-01.jpg", alt: "Seestadel – view" },
  { src: "assets/seestadel/img-02.jpg", alt: "Seestadel – balcony" },
  { src: "assets/seestadel/img-08.jpg", alt: "Seestadel – living room" },
  { src: "assets/seestadel/img-09.jpg", alt: "Seestadel – bathroom" },
];

// ------- Helpers -------
function formatCurrency(euros) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(euros);
}

function parseRange(dates) {
  if (!dates || dates.length < 2) return { checkIn: null, checkOut: null, nights: 0 };
  const [a, b] = dates;
  const checkIn = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const checkOut = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const nights = Math.max(0, Math.round((checkOut - checkIn) / msPerDay));
  return { checkIn, checkOut, nights };
}

function formatDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "–";
  const fmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${fmt.format(checkIn)} → ${fmt.format(checkOut)}`;
}

function truncate(text, max) {
  if (!text) return "";
  const clean = String(text).trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

function getApartmentById(id) {
  return APARTMENTS.find((a) => a.id === id) || APARTMENTS[0];
}

function computePrice(apartment, nights) {
  if (nights <= 0) return { nightly: apartment.pricePerNight, cleaning: apartment.cleaningFee, subtotal: 0, total: 0 };
  const nightly = apartment.pricePerNight;
  const cleaning = apartment.cleaningFee;
  const subtotal = nightly * nights + cleaning;
  const total = subtotal; // extend here if taxes/discounts apply
  return { nightly, cleaning, subtotal, total };
}

// ------- UI Rendering -------
function renderApartments() {
  const container = document.getElementById("apartmentCards");
  container.innerHTML = APARTMENTS.map((a) => `
    <article class="card">
      <img class="card-media" src="${a.photos[0]?.src || AREA_PHOTOS[0].src}" alt="${a.photos[0]?.alt || a.name}" loading="lazy"/>
      <div class="card-body">
        <h3 class="card-title">${a.name}</h3>
        <p class="card-meta">${a.short}</p>
        
        <div class="card-details">
          <div class="card-detail-item">
            <span>📏</span>
            <span><strong>Size:</strong> ${a.sqm} m²</span>
          </div>
          <div class="card-detail-item">
            <span>👥</span>
            <span><strong>Sleeps:</strong> Up to ${a.maxGuests} guests</span>
          </div>
          <div class="card-detail-item">
            <span>🏠</span>
            <span><strong>Type:</strong> ${a.bedrooms} bedroom${a.bedrooms > 1 ? 's' : ''} + living room</span>
          </div>
          <div class="card-detail-item">
            <span>💰</span>
            <span><strong>Price:</strong> €${a.pricePerNightLowSeason || a.pricePerNight}–${a.pricePerNight}/night</span>
          </div>
        </div>
        
        <p class="card-price">From ${formatCurrency(a.pricePerNight)} / night</p>
        <p class="card-meta">Minimum stay: ${a.minNights} nights • Includes cleaning</p>
        
        <div class="card-actions">
          <a class="btn btn-primary" href="#booking" data-apartment="${a.id}">Book now</a>
          <a class="btn btn-light" href="#gallery" data-gallery-filter="${a.id}">View photos</a>
        </div>
      </div>
    </article>
  `).join("");

  // Wire buttons to preselect apartment
  container.querySelectorAll('[data-apartment]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-apartment');
      const select = document.getElementById('apartmentSelect');
      select.value = id;
      select.dispatchEvent(new Event('change'));
    });
  });
}

function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  const all = [
    ...APARTMENTS.flatMap(a => a.photos.map(p => ({...p, apartmentId: a.id, caption: `${a.name}`}))),
    ...AREA_PHOTOS
  ];

  grid.innerHTML = all.map((p, i) => `
    <a href="${p.src}" data-index="${i}" data-caption="${p.caption || ''}">
      <img src="${p.src}" alt="${p.alt || 'Photo'}" loading="lazy" />
    </a>
  `).join("");

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  grid.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      const caption = a.getAttribute('data-caption') || '';
      lightboxImg.src = href;
      lightboxCaption.textContent = caption;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  });
}

function populateApartmentSelect() {
  const select = document.getElementById('apartmentSelect');
  select.innerHTML = APARTMENTS.map(a => `<option value="${a.id}">${a.name} — up to ${a.maxGuests} guests</option>`).join('');
}

// ------- Booking Calendar -------
let picker = null;

function setDisabledDatesFor(apartment) {
  if (!picker) return;
  const disabled = (apartment.blockedDates || []).map(d => new Date(d));
  picker.set('disable', disabled);
  picker.set('minDate', new Date());
}

function initCalendar() {
  const input = document.getElementById('dateRange');
  const help = document.getElementById('dateHelp');
  const select = document.getElementById('apartmentSelect');

  picker = flatpickr(input, {
    mode: 'range',
    dateFormat: 'd.m.Y',
    minDate: 'today',
    showMonths: window.matchMedia('(min-width: 900px)').matches ? 2 : 1,
    disableMobile: true,
    onReady: () => {
      const apt = getApartmentById(select.value);
      setDisabledDatesFor(apt);
      help.textContent = `Min ${apt.minNights} nights · Changeover flexible`;
    },
    onChange: (selectedDates) => {
      updateSummary();
    },
  });
}

// ------- Summary & Mailto -------
function updateSummary() {
  const select = document.getElementById('apartmentSelect');
  const adults = Number(document.getElementById('adults').value || '0');
  const children = Number(document.getElementById('children').value || '0');
  const apt = getApartmentById(select.value);

  const dates = picker?.selectedDates || [];
  const { checkIn, checkOut, nights } = parseRange(dates);

  // enforce min nights visually (we don't block, but inform)
  const help = document.getElementById('dateHelp');
  help.textContent = `Min ${apt.minNights} nights · Changeover flexible` + (nights > 0 && nights < apt.minNights ? ` · Please extend stay` : '');

  const { nightly, cleaning, subtotal, total } = computePrice(apt, nights);

  document.getElementById('summaryApartment').textContent = apt.name;
  document.getElementById('summaryDates').textContent = formatDateRange(checkIn, checkOut);
  document.getElementById('summaryNights').textContent = `${nights}`;
  document.getElementById('summaryGuests').textContent = `${adults + children}`;
  document.getElementById('summaryRate').textContent = formatCurrency(nightly);
  document.getElementById('summaryCleaning').textContent = formatCurrency(cleaning);
  document.getElementById('summarySubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('summaryTotal').textContent = formatCurrency(total);
}

function handleApartmentChange() {
  const select = document.getElementById('apartmentSelect');
  const apt = getApartmentById(select.value);
  setDisabledDatesFor(apt);
  updateSummary();
}

function handleRequestBooking() {
  const select = document.getElementById('apartmentSelect');
  const adults = Number(document.getElementById('adults').value || '0');
  const children = Number(document.getElementById('children').value || '0');
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const message = document.getElementById('message').value.trim();

  const apt = getApartmentById(select.value);
  const { checkIn, checkOut, nights } = parseRange(picker?.selectedDates || []);

  if (!name || !email || nights <= 0) {
    alert('Please select valid dates and enter your name and email.');
    return;
  }
  if (nights < apt.minNights) {
    const proceed = confirm(`The minimum stay for ${apt.name} is ${apt.minNights} nights. Continue anyway?`);
    if (!proceed) return;
  }

  const { nightly, cleaning, subtotal, total } = computePrice(apt, nights);
  const body = encodeURIComponent(
`Booking request – Haus Säuling\n\n` +
`Name: ${name}\n` +
`Email: ${email}\n` +
`Phone: ${phone || '-'}\n` +
`Apartment: ${apt.name}\n` +
`Guests: ${adults} adults, ${children} children\n` +
`Dates: ${formatDateRange(checkIn, checkOut)} (${nights} nights)\n\n` +
`Price summary:\n` +
`  Nightly rate: ${formatCurrency(nightly)}\n` +
`  Cleaning: ${formatCurrency(cleaning)}\n` +
`  Subtotal: ${formatCurrency(subtotal)}\n` +
`  Total: ${formatCurrency(total)}\n\n` +
(message ? `Message:\n${message}\n\n` : '') +
`Sent from Haus Säuling website.`
  );

  const subject = encodeURIComponent(`Booking request – ${apt.name} (${formatDateRange(checkIn, checkOut)})`);
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  window.location.href = mailto;
}

// ------- Init -------
function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('contactEmail').href = `mailto:${CONTACT_EMAIL}`;
  document.getElementById('contactEmail').textContent = CONTACT_EMAIL;

  renderApartments();
  populateApartmentSelect();
  renderGallery();
  initCalendar();
  updateSummary();

  document.getElementById('apartmentSelect').addEventListener('change', handleApartmentChange);
  document.getElementById('adults').addEventListener('input', updateSummary);
  document.getElementById('children').addEventListener('input', updateSummary);
  document.getElementById('requestBtn').addEventListener('click', handleRequestBooking);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
