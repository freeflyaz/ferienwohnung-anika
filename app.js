/*
  Haus Säuling – Booking & UI Script (vanilla JS)
  - Apartments config
  - Gallery rendering + lightbox
  - Booking date picker (flatpickr) with disabled dates per apartment
  - Price calculation and mailto request
*/

const CONTACT_EMAIL = "ferienwohnung-anika@t-online.de";

// Global gallery filter state
let pendingGalleryFilter = null;

// Current language
let currentLanguage = localStorage.getItem('language') || 'en';

// Translations
const translations = {
  en: {
    // Navigation
    'nav.apartments': 'Apartments',
    'nav.gallery': 'Gallery',
    'nav.booking': 'Booking',
    'nav.contact': 'Contact',
    'nav.bookNow': 'Book now',
    
    // Hero
    'hero.title': 'Alpine stays at Haus Säuling',
    'hero.subtitle': 'Bright, modern Ferienwohnungen in the heart of the Allgäu.',
    'hero.viewApartments': 'View apartments',
    'hero.checkAvailability': 'Check availability',
    
    // Features
    'features.location': 'Allgäu location',
    'features.locationDesc': 'Trails, lakes and castles within easy reach.',
    'features.comfort': 'Modern comfort',
    'features.comfortDesc': 'Fresh interiors, fully equipped kitchenettes.',
    'features.wifi': 'Fast Wi‑Fi',
    'features.wifiDesc': 'Stay connected while you unwind.',
    'features.access': 'Easy access',
    'features.accessDesc': 'On‑site parking and self check‑in.',
    
    // Sections
    'section.apartments': 'Apartments',
    'section.apartmentsDesc': 'Choose the perfect base for hiking, biking and lake days.',
    'section.whatsIncluded': 'What\'s Included',
    'section.whatsIncludedDesc': 'All apartments feature modern amenities for a comfortable stay.',
    'section.gallery': 'Gallery',
    'section.galleryDesc': 'Photos from our apartments and the beautiful Allgäu surroundings.',
    'section.booking': 'Booking',
    'section.bookingDesc': 'Select your dates to request a stay. You\'ll receive a personal confirmation.',
    'section.contact': 'Contact',
    'section.contactDesc': 'Christine & Roland Pfeiffer – get in touch to book your stay.',
    
    // Apartment details
    'apartment.size': 'Size',
    'apartment.sleeps': 'Sleeps',
    'apartment.type': 'Type',
    'apartment.price': 'Price',
    'apartment.bedroom': 'bedroom',
    'apartment.bedrooms': 'bedrooms',
    'apartment.livingRoom': 'living room',
    'apartment.upToGuests': 'Up to {{count}} guests',
    'apartment.perNight': '/night',
    'apartment.from': 'From',
    'apartment.minimumStay': 'Minimum stay',
    'apartment.nights': 'nights',
    'apartment.includesCleaning': 'Includes cleaning',
    'apartment.bookNow': 'Book now',
    'apartment.viewPhotos': 'View photos',
    
    // Gallery filters
    'gallery.allPhotos': 'All Photos',
    'gallery.surroundings': 'Surroundings',
    
    // Form
    'form.apartment': 'Apartment',
    'form.dates': 'Dates',
    'form.checkIn': 'Check‑in',
    'form.checkOut': 'Check‑out',
    'form.adults': 'Adults',
    'form.children': 'Children',
    'form.name': 'Name',
    'form.email': 'Email',
    'form.phone': 'Phone (optional)',
    'form.message': 'Message (optional)',
    'form.messagePlaceholder': 'Any questions or requests?',
    'form.requestBooking': 'Request booking',
    'form.noPayment': 'No payment now. We will confirm availability by email.',
    
    // Booking summary
    'summary.yourStay': 'Your stay',
    'summary.apartment': 'Apartment',
    'summary.dates': 'Dates',
    'summary.nights': 'Nights',
    'summary.guests': 'Guests',
    'summary.nightlyRate': 'Nightly rate',
    'summary.cleaning': 'Cleaning',
    'summary.subtotal': 'Subtotal',
    'summary.total': 'Total',
    'summary.taxNote': 'Incl. VAT where applicable; excludes local tourist tax.',
    
    // Contact
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.address': 'Address',
    'contact.website': 'Website',
    'contact.providedBy': 'Contact details provided by the owner.',
    
    // What's included
    'included.bedrooms': 'Comfortable Bedrooms',
    'included.bedroomsDesc': 'All apartments include comfortable bedrooms with quality linens and sleeping arrangements for the specified number of guests.',
    'included.kitchen': 'Fully Equipped Kitchen',
    'included.kitchenDesc': 'Each apartment features a complete kitchen with modern appliances, cookware, and all essentials for preparing meals during your stay.',
    'included.cleaning': 'Cleaning Service',
    'included.cleaningDesc': 'Professional cleaning is included with every booking. The cleaning fee covers thorough preparation before your arrival and cleaning after your departure.',
    'included.wifi': 'Free Wi-Fi & Utilities',
    'included.wifiDesc': 'High-speed internet access is included, along with all utilities (electricity, water, heating). Stay connected while enjoying the alpine atmosphere.',
    'included.parking': 'Parking Available',
    'included.parkingDesc': 'Free on-site parking is available for all guests. The property offers convenient parking spaces close to the apartments.',
    'included.support': 'Local Support',
    'included.supportDesc': 'Your hosts Christine & Roland Pfeiffer are available to assist with any questions or needs during your stay. Local expertise and recommendations included.',
    'included.pricing': 'Pricing Information',
    'included.pricingDesc': 'Prices vary by season (high season: peak months, low season: off-peak). Additional fees: €15/night per extra person, €10/night surcharge for stays under 5 nights. Tourist tax: €1.90/adult, €0.95/child per night. Washing machine/dryer available for €5.00 per cycle.',
    
    // Footer
    'footer.impressum': 'Impressum',
    'footer.privacy': 'Privacy',
    'footer.photoCredit': 'Photography via Unsplash placeholders. Replace with your own images.'
  },
  de: {
    // Navigation
    'nav.apartments': 'Ferienwohnungen',
    'nav.gallery': 'Galerie',
    'nav.booking': 'Buchung',
    'nav.contact': 'Kontakt',
    'nav.bookNow': 'Jetzt buchen',
    
    // Hero
    'hero.title': 'Alpine Auszeit im Haus Säuling',
    'hero.subtitle': 'Helle, moderne Ferienwohnungen im Herzen des Allgäus.',
    'hero.viewApartments': 'Wohnungen ansehen',
    'hero.checkAvailability': 'Verfügbarkeit prüfen',
    
    // Features
    'features.location': 'Allgäu Lage',
    'features.locationDesc': 'Wanderwege, Seen und Schlösser in Reichweite.',
    'features.comfort': 'Moderner Komfort',
    'features.comfortDesc': 'Frische Einrichtung, voll ausgestattete Küchen.',
    'features.wifi': 'Schnelles WLAN',
    'features.wifiDesc': 'Bleiben Sie verbunden während Sie entspannen.',
    'features.access': 'Einfacher Zugang',
    'features.accessDesc': 'Parkplatz vor Ort und Self Check-in.',
    
    // Sections
    'section.apartments': 'Ferienwohnungen',
    'section.apartmentsDesc': 'Wählen Sie die perfekte Basis für Wandern, Radfahren und Seetage.',
    'section.whatsIncluded': 'Ausstattung',
    'section.whatsIncludedDesc': 'Alle Wohnungen verfügen über moderne Annehmlichkeiten für einen komfortablen Aufenthalt.',
    'section.gallery': 'Galerie',
    'section.galleryDesc': 'Fotos von unseren Wohnungen und der schönen Allgäuer Umgebung.',
    'section.booking': 'Buchung',
    'section.bookingDesc': 'Wählen Sie Ihre Daten für eine Buchungsanfrage. Sie erhalten eine persönliche Bestätigung.',
    'section.contact': 'Kontakt',
    'section.contactDesc': 'Christine & Roland Pfeiffer – kontaktieren Sie uns für Ihre Buchung.',
    
    // Apartment details
    'apartment.size': 'Größe',
    'apartment.sleeps': 'Personen',
    'apartment.type': 'Typ',
    'apartment.price': 'Preis',
    'apartment.bedroom': 'Schlafzimmer',
    'apartment.bedrooms': 'Schlafzimmer',
    'apartment.livingRoom': 'Wohnzimmer',
    'apartment.upToGuests': 'Bis zu {{count}} Gäste',
    'apartment.perNight': '/Nacht',
    'apartment.from': 'Ab',
    'apartment.minimumStay': 'Mindestaufenthalt',
    'apartment.nights': 'Nächte',
    'apartment.includesCleaning': 'Inkl. Endreinigung',
    'apartment.bookNow': 'Jetzt buchen',
    'apartment.viewPhotos': 'Fotos ansehen',
    
    // Gallery filters
    'gallery.allPhotos': 'Alle Fotos',
    'gallery.surroundings': 'Umgebung',
    
    // Form
    'form.apartment': 'Ferienwohnung',
    'form.dates': 'Zeitraum',
    'form.checkIn': 'Anreise',
    'form.checkOut': 'Abreise',
    'form.adults': 'Erwachsene',
    'form.children': 'Kinder',
    'form.name': 'Name',
    'form.email': 'E-Mail',
    'form.phone': 'Telefon (optional)',
    'form.message': 'Nachricht (optional)',
    'form.messagePlaceholder': 'Haben Sie Fragen oder besondere Wünsche?',
    'form.requestBooking': 'Buchung anfragen',
    'form.noPayment': 'Keine Zahlung jetzt. Wir bestätigen die Verfügbarkeit per E-Mail.',
    
    // Booking summary
    'summary.yourStay': 'Ihr Aufenthalt',
    'summary.apartment': 'Wohnung',
    'summary.dates': 'Zeitraum',
    'summary.nights': 'Nächte',
    'summary.guests': 'Gäste',
    'summary.nightlyRate': 'Preis pro Nacht',
    'summary.cleaning': 'Endreinigung',
    'summary.subtotal': 'Zwischensumme',
    'summary.total': 'Gesamt',
    'summary.taxNote': 'Inkl. MwSt.; zzgl. Kurtaxe.',
    
    // Contact
    'contact.email': 'E-Mail',
    'contact.phone': 'Telefon',
    'contact.address': 'Adresse',
    'contact.website': 'Webseite',
    'contact.providedBy': 'Kontaktdaten vom Eigentümer bereitgestellt.',
    
    // What's included
    'included.bedrooms': 'Komfortable Schlafzimmer',
    'included.bedroomsDesc': 'Alle Wohnungen verfügen über komfortable Schlafzimmer mit hochwertiger Bettwäsche und Schlafmöglichkeiten für die angegebene Anzahl von Gästen.',
    'included.kitchen': 'Voll ausgestattete Küche',
    'included.kitchenDesc': 'Jede Wohnung verfügt über eine komplette Küche mit modernen Geräten, Kochgeschirr und allem Notwendigen für die Zubereitung von Mahlzeiten während Ihres Aufenthalts.',
    'included.cleaning': 'Reinigungsservice',
    'included.cleaningDesc': 'Professionelle Reinigung ist bei jeder Buchung inbegriffen. Die Reinigungsgebühr deckt die gründliche Vorbereitung vor Ihrer Ankunft und die Reinigung nach Ihrer Abreise ab.',
    'included.wifi': 'Kostenloses WLAN & Nebenkosten',
    'included.wifiDesc': 'Highspeed-Internetzugang ist ebenso inbegriffen wie alle Nebenkosten (Strom, Wasser, Heizung). Bleiben Sie verbunden, während Sie die alpine Atmosphäre genießen.',
    'included.parking': 'Parkplatz vorhanden',
    'included.parkingDesc': 'Kostenlose Parkplätze vor Ort stehen allen Gästen zur Verfügung. Die Unterkunft bietet bequeme Parkplätze in der Nähe der Wohnungen.',
    'included.support': 'Lokale Unterstützung',
    'included.supportDesc': 'Ihre Gastgeber Christine & Roland Pfeiffer stehen Ihnen bei Fragen oder Bedürfnissen während Ihres Aufenthalts zur Verfügung. Lokale Expertise und Empfehlungen inklusive.',
    'included.pricing': 'Preisinformationen',
    'included.pricingDesc': 'Die Preise variieren je nach Saison (Hauptsaison: Spitzenmonate, Nebensaison: Nebenmonate). Zusätzliche Gebühren: 15 €/Nacht pro zusätzlicher Person, 10 €/Nacht Aufschlag für Aufenthalte unter 5 Nächten. Kurtaxe: 1,90 €/Erwachsener, 0,95 €/Kind pro Nacht. Waschmaschine/Trockner für 5,00 € pro Waschgang verfügbar.',
    
    // Footer
    'footer.impressum': 'Impressum',
    'footer.privacy': 'Datenschutz',
    'footer.photoCredit': 'Fotografie über Unsplash-Platzhalter. Ersetzen Sie diese durch Ihre eigenen Bilder.'
  }
};

// Translation function
function t(key, params = {}) {
  let translation = translations[currentLanguage][key] || translations['en'][key] || key;
  
  // Replace parameters like {{count}}
  Object.keys(params).forEach(param => {
    translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
  });
  
  return translation;
}

// Update all translations on the page
function updateTranslations() {
  // Update HTML lang attribute
  document.documentElement.lang = currentLanguage;
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = t(key);
  });
  
  // Update dynamic content
  updateDynamicTranslations();
}

// Update dynamic content translations
function updateDynamicTranslations() {
  // Re-render apartments with translations
  renderApartments();
  
  // Re-render gallery with translations
  renderGallery();
  
  // Update booking form elements
  updateBookingTranslations();
  
  // Update summary
  updateSummary();
}

// Update booking form translations
function updateBookingTranslations() {
  // This will be called when form elements need translation updates
  const dateHelp = document.getElementById('dateHelp');
  if (dateHelp) {
    const apt = getApartmentById(document.getElementById('apartmentSelect').value);
    dateHelp.textContent = `${t('apartment.minimumStay')} ${apt.minNights} ${t('apartment.nights')}`;
  }
}

// Function to apply gallery filter
function applyGalleryFilter(apartmentId) {
  const filterBtn = document.querySelector(`[data-filter="${apartmentId}"]`);
  if (filterBtn) {
    filterBtn.click();
    // Smooth scroll to gallery
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

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
        <p class="card-meta">${t('apartment.sleeps')}: ${a.maxGuests} · ${a.sqm} m²</p>
        
        <div class="card-details">
          <div class="card-detail-item">
            <span>📏</span>
            <span><strong>${t('apartment.size')}:</strong> ${a.sqm} m²</span>
          </div>
          <div class="card-detail-item">
            <span>👥</span>
            <span><strong>${t('apartment.sleeps')}:</strong> ${t('apartment.upToGuests', {count: a.maxGuests})}</span>
          </div>
          <div class="card-detail-item">
            <span>🏠</span>
            <span><strong>${t('apartment.type')}:</strong> ${a.bedrooms} ${t(a.bedrooms > 1 ? 'apartment.bedrooms' : 'apartment.bedroom')} + ${t('apartment.livingRoom')}</span>
          </div>
          <div class="card-detail-item">
            <span>💰</span>
            <span><strong>${t('apartment.price')}:</strong> €${a.pricePerNightLowSeason || a.pricePerNight}–${a.pricePerNight}${t('apartment.perNight')}</span>
          </div>
        </div>
        
        <p class="card-price">${t('apartment.from')} ${formatCurrency(a.pricePerNightLowSeason || a.pricePerNight)} ${t('apartment.perNight')}</p>
        <p class="card-meta">${t('apartment.minimumStay')}: ${a.minNights} ${t('apartment.nights')} • ${t('apartment.includesCleaning')}</p>
        
        <div class="card-actions">
          <a class="btn btn-primary" href="#booking" data-apartment="${a.id}">${t('apartment.bookNow')}</a>
          <button class="btn btn-light" data-gallery-filter="${a.id}">${t('apartment.viewPhotos')}</button>
        </div>
      </div>
    </article>
  `).join("");

  // Wire booking buttons to preselect apartment
  container.querySelectorAll('[data-apartment]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-apartment');
      const select = document.getElementById('apartmentSelect');
      select.value = id;
      select.dispatchEvent(new Event('change'));
    });
  });

  // Wire gallery filter buttons to filter photos
  container.querySelectorAll('[data-gallery-filter]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const apartmentId = e.currentTarget.getAttribute('data-gallery-filter');
      
      // Use setTimeout to ensure gallery is rendered
      setTimeout(() => {
        applyGalleryFilter(apartmentId);
      }, 100);
    });
  });
}

function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  const allPhotos = [
    ...APARTMENTS.flatMap(a => a.photos.map(p => ({...p, apartmentId: a.id, apartmentName: a.name}))),
    ...AREA_PHOTOS.map(p => ({...p, apartmentId: 'area', apartmentName: t('gallery.surroundings')}))
  ];

  // Function to render photos based on filter
  function renderPhotos(filter = 'all') {
    const filteredPhotos = filter === 'all' 
      ? allPhotos 
      : allPhotos.filter(p => p.apartmentId === filter);
    
    grid.innerHTML = filteredPhotos.map((p, i) => `
      <a href="${p.src}" data-index="${i}" data-caption="${p.apartmentName}" class="gallery-item" data-apartment="${p.apartmentId}">
        <img src="${p.src}" alt="${p.alt || 'Photo'}" loading="lazy" />
        ${p.apartmentName ? `<span class="gallery-badge">${p.apartmentName}</span>` : ''}
      </a>
    `).join("");
    
    // Re-attach lightbox handlers
    attachLightboxHandlers();
  }

  // Initial render
  renderPhotos('all');

  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filter = e.target.getAttribute('data-filter');
      
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Render filtered photos
      renderPhotos(filter);
    });
  });

  function attachLightboxHandlers() {
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
  }

  // Set up lightbox close handlers (only once)
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  
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

  // Initialize language
  initializeLanguage();

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

// Initialize language system
function initializeLanguage() {
  // Set initial language from localStorage or default
  currentLanguage = localStorage.getItem('language') || 'en';
  
  // Update language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLanguage);
  });
  
  // Add click handlers to language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newLang = e.target.getAttribute('data-lang');
      if (newLang !== currentLanguage) {
        currentLanguage = newLang;
        localStorage.setItem('language', currentLanguage);
        
        // Update active states
        document.querySelectorAll('.lang-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-lang') === currentLanguage);
        });
        
        // Update all translations
        updateTranslations();
      }
    });
  });
  
  // Initial translation update
  updateTranslations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
