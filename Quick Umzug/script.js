/* ===== YOUR CONTACT CONFIG ===== */
const PHONE_DISPLAY = "+49 30 123 456 789"; // shown on the site
const PHONE_INTL = "+4930123456789"; // for tel: links
const PHONE_WHATSAPP = "4930123456789"; // no + for wa.me
const EMAIL_TO = "majdalanini5@gmail.com";

/* Header shadow */
const header = document.querySelector("header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
document.addEventListener("scroll", onScroll);
onScroll();

/* Mobile menu */
document.querySelector(".menu-toggle").addEventListener("click", () => {
  const ul = document.querySelector("nav ul");
  const visible = getComputedStyle(ul).display !== "none";
  ul.style.display = visible ? "none" : "flex";
  ul.style.flexDirection = "column";
  ul.style.position = "absolute";
  ul.style.right = "1rem";
  ul.style.top = "64px";
  ul.style.background = "var(--card)";
  ul.style.padding = "14px";
  ul.style.borderRadius = "12px";
  ul.style.boxShadow = "var(--shadow)";
});

/* Call buttons (tel:) */
document
  .querySelectorAll("[data-call]")
  .forEach((el) => el.setAttribute("href", `tel:${PHONE_INTL}`));
document.getElementById("heroNumber").textContent = PHONE_DISPLAY;
document.getElementById("phoneLink").textContent = PHONE_DISPLAY;

/* WhatsApp links */
const waTextDefault = {
  en: "Hello, I am interested in your moving service in Berlin.",
  de: "Hallo, ich interessiere mich für Ihren Umzugsservice in Berlin.",
};
function buildWA(text) {
  return `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
function setWA(lang) {
  const txt = waTextDefault[lang] || waTextDefault.en;
  ["waHero", "waLink"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = buildWA(txt);
  });
}

/* Contact email link */
document.getElementById("mailLink").href = `mailto:${EMAIL_TO}`;
document.getElementById("y").textContent = new Date().getFullYear();

/* Reviews with per-review delete */
const REV_KEY = "ut_reviews_v6",
  CLIENT_ID_KEY = "ut_client_id";
let CLIENT_ID = localStorage.getItem(CLIENT_ID_KEY);
if (!CLIENT_ID) {
  CLIENT_ID =
    crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
  localStorage.setItem(CLIENT_ID_KEY, CLIENT_ID);
}

const reviewFormEl = document.getElementById("reviewForm");
const reviewsListEl = document.getElementById("reviewsList");
const revRatingInput = document.getElementById("revRating");
const revText = document.getElementById("revText");
const revName = document.getElementById("revName");
const avgNumEl = document.getElementById("avgNum");
const revCountEl = document.getElementById("revCount");
const avgStarsEl = document.getElementById("avgStars");
const clearBtn = document.getElementById("clearReviews");

const loadReviews = () => {
  try {
    return JSON.parse(localStorage.getItem(REV_KEY)) || [];
  } catch {
    return [];
  }
};
const saveReviews = (arr) => localStorage.setItem(REV_KEY, JSON.stringify(arr));

function buildStars(container, count = 0, onSelect) {
  container.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement("span");
    s.className = "star" + (i <= count ? " active" : "");
    s.textContent = "★";
    s.setAttribute("role", "radio");
    s.setAttribute("aria-checked", i === count ? "true" : "false");
    s.setAttribute("tabindex", "0");
    s.addEventListener("mouseenter", () => highlight(container, i));
    s.addEventListener("mouseleave", () => highlight(container, count));
    s.addEventListener("click", () => {
      count = i;
      highlight(container, count);
      onSelect && onSelect(count);
    });
    s.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        count = i;
        highlight(container, count);
        onSelect && onSelect(count);
      }
      if (e.key === "ArrowRight") {
        count = Math.min(5, count + 1);
        highlight(container, count);
        onSelect && onSelect(count);
      }
      if (e.key === "ArrowLeft") {
        count = Math.max(1, count - 1);
        highlight(container, count);
        onSelect && onSelect(count);
      }
    });
    container.appendChild(s);
  }
}
function highlight(container, n) {
  [...container.children].forEach((el, idx) => {
    el.classList.toggle("active", idx < n);
    el.setAttribute("aria-checked", idx + 1 === n ? "true" : "false");
  });
}
function starStrip(n) {
  let out = "";
  for (let i = 1; i <= 5; i++)
    out += `<span class="star ${i <= n ? "active" : ""}">★</span>`;
  return `<div class="stars" aria-hidden="true" style="gap:6px">${out}</div>`;
}

function renderReviews() {
  const lang = getLang(),
    dict = I18N[lang],
    data = loadReviews();
  const avg = data.length
    ? data.reduce((a, b) => a + b.rating, 0) / data.length
    : 0;
  avgNumEl.textContent = avg.toFixed(1);
  revCountEl.textContent = data.length;
  avgStarsEl.innerHTML = starStrip(Math.round(avg));
  reviewsListEl.innerHTML = "";
  if (!data.length) {
    const empty = document.createElement("div");
    empty.className = "card empty";
    empty.textContent =
      lang === "de"
        ? "Noch keine Bewertungen — seien Sie die/der Erste!"
        : "No reviews yet — be the first!";
    reviewsListEl.appendChild(empty);
    return;
  }
  data
    .slice()
    .reverse()
    .forEach((r) => {
      const isMine = r.clientId === CLIENT_ID;
      const card = document.createElement("div");
      card.className = "review-card card";
      card.innerHTML = `
        <div class="del-row">
          ${starStrip(r.rating)}
          ${
            isMine
              ? `<button class="del-btn" data-id="${r.id}" data-i18n="review_delete">${dict.review_delete}</button>`
              : ""
          }
        </div>
        <p>${escapeHtml(r.text)}</p>
        <div class="meta">${escapeHtml(
          r.name || (lang === "de" ? "Anonym" : "Anonymous")
        )} · ${new Date(r.ts).toLocaleDateString()}</div>`;
      reviewsListEl.appendChild(card);
    });
}
const escapeHtml = (str) =>
  (str || "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[
        m
      ])
  );
reviewsListEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".del-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  const msg =
    getLang() === "de"
      ? "Diese Bewertung löschen? (Nur in diesem Browser)"
      : "Delete this review? (This only removes it from this browser)";
  if (!confirm(msg)) return;
  const arr = loadReviews();
  const idx = arr.findIndex((x) => x.id === id && x.clientId === CLIENT_ID);
  if (idx > -1) {
    arr.splice(idx, 1);
    saveReviews(arr);
    renderReviews();
  }
});

const writerStars = document.getElementById("revStars");
buildStars(writerStars, 0, (val) => {
  revRatingInput.value = val;
});
reviewFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const rating = Number(revRatingInput.value || 0),
    text = (revText.value || "").trim();
  if (!rating) {
    alert(
      getLang() === "de"
        ? "Bitte Sterne auswählen."
        : "Please select a star rating."
    );
    return;
  }
  if (text.length < 10) {
    alert(
      getLang() === "de"
        ? "Bitte mindestens 10 Zeichen schreiben."
        : "Please write at least 10 characters."
    );
    return;
  }
  const id =
    crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
  const entry = {
    id,
    clientId: CLIENT_ID,
    rating,
    text,
    name: (revName.value || "").trim(),
    ts: Date.now(),
  };
  const arr = loadReviews();
  arr.push(entry);
  saveReviews(arr);
  reviewFormEl.reset();
  revRatingInput.value = "";
  buildStars(writerStars, 0, (val) => {
    revRatingInput.value = val;
  });
  renderReviews();
  writerStars.scrollIntoView({ behavior: "smooth", block: "start" });
});
clearBtn.addEventListener("click", () => {
  if (
    confirm(
      getLang() === "de"
        ? "Nur lokal: Alle gespeicherten Bewertungen löschen?"
        : "Local only: Delete all saved reviews?"
    )
  ) {
    localStorage.removeItem(REV_KEY);
    renderReviews();
  }
});

/* i18n */
const I18N = {
  en: {
    brand: "UmzugTransport",
    nav_services: "Services",
    nav_pricing: "Pricing",
    nav_reviews: "Reviews",
    nav_booking: "Booking",
    nav_contact: "Contact",
    cta_call: "Call",
    hero_title: "Moving Service in Berlin – Fast, Reliable & Fair",
    hero_subtitle:
      "Transparent prices, insured & professional — we make your move stress-free.",
    hero_whatsapp: "WhatsApp Chat",
    hp_insured: "• Insured & Reliable",
    hp_experience: "15+ Years Experience",
    hp_fair: "Fair Pricing",
    services_title: "Our Services",
    services_sub: "Everything you need for a smooth move.",
    svc_local_title: "Local Moves (Berlin)",
    svc_local_desc: "City moves within Berlin — fast & careful.",
    svc_furniture_title: "Furniture Assembly",
    svc_furniture_desc: "Professional disassembly & re-assembly.",
    svc_van_title: "Van + Driver",
    svc_van_desc: "Small transports, helpers on request.",
    svc_clear_title: "Clearance & Disposal",
    svc_clear_desc: "Eco-friendly, transparent billing.",
    svc_survey_title: "Survey & Advice",
    svc_survey_desc: "Free estimate by phone or on-site.",
    pricing_title: "Transparent Pricing",
    pricing_sub: "Fair and honest — no hidden fees.",
    price_local_title: "Local Move (Berlin)",
    price_local_desc: "incl. 2 movers + van",
    price_helper_title: "Extra Helper",
    price_helper_desc: "additional helper per hour",
    price_assembly_title: "Assembly/Disassembly",
    price_assembly_desc: "per item (simple)",
    price_clear_title: "Clearance/Disposal",
    price_clear_desc: "to recycling center",
    from: "from",
    per_hour: "/hour",
    flat: "flat",
    per_m3: "per m³",
    pricing_note:
      "All prices include insurance & VAT. Final cost depends on distance, floors & volume.",
    gal_team:
      "Our experienced team<br><span class='tiny'>Professional & reliable</span>",
    reviews_title: "Reviews",
    reviews_sub: "Your opinion matters — rate our service.",
    reviews_count_word: "reviews",
    review_form_title: "Leave a review",
    review_form_tip: "Select stars and write a short comment.",
    review_rating_label: "Your rating",
    review_name_label: "Your name (optional)",
    review_comment_label: "Your comment",
    review_submit: "Submit review",
    review_clear: "Clear local reviews",
    review_note: "Note: Stored locally in your browser (MVP).",
    review_recent: "Recent reviews",
    review_sort: "Newest first",
    review_delete: "Delete",
    booking_title: "Booking",
    booking_sub: "Send the basics — we’ll reply with a quote quickly.",
    f_name: "Name*",
    f_phone: "Phone*",
    f_date: "Moving date*",
    f_size: "Home size",
    f_from: "From (address)",
    f_to: "To (address)",
    f_message: "Message",
    ph_fullname: "John Doe",
    ph_phone: "+49 ...",
    ph_from: "Street, ZIP City, floor",
    ph_to: "Street, ZIP City, floor",
    ph_message: "Special items (elevator, piano, no-parking zone, boxes)…",
    ph_name: "John D.",
    ph_comment: "How was your experience? (min 10 characters)",
    opt_choose: "Please choose",
    opt_1: "1 room",
    opt_2: "2 rooms",
    opt_3: "3 rooms",
    opt_4: "4 rooms",
    opt_5: "5+ rooms",
    cta_email: "Send by Email",
    contact_title: "Contact",
    contact_sub: "Questions? Call or message us on WhatsApp.",
    contact_direct: "Direct contact",
    contact_phone: "Phone:",
    contact_email: "Email:",
    contact_email_send: "Send email",
    contact_whatsapp: "Start chat",
    hours: "Office hours: Mon–Sat 08:00–20:00",
    rights: "All rights reserved.",
    legal: "Imprint · Privacy · Terms",
    mail_subject: "Moving Request via Website",
    mail_subject_prefix: "New Moving Request",
    mail_prices_note:
      "Pricing info: Local from €80/h (2 movers + van), Extra helper +€25/h, Assembly from €30, Clearance from €50/m³",
  },
  de: {
    brand: "UmzugTransport",
    nav_services: "Services",
    nav_pricing: "Preise",
    nav_reviews: "Bewertungen",
    nav_booking: "Terminbuchung",
    nav_contact: "Kontakt",
    cta_call: "Anrufen",
    hero_title: "Umzugsservice in Berlin – Schnell, Zuverlässig & Fair",
    hero_subtitle:
      "Transparente Preise, versichert & professionell – wir machen Ihren Umzug stressfrei.",
    hero_whatsapp: "WhatsApp Chat",
    hp_insured: "• Versichert & Zuverlässig",
    hp_experience: "15+ Jahre Erfahrung",
    hp_fair: "Faire Preise",
    services_title: "Unsere Services",
    services_sub: "Alles für einen reibungslosen Umzug.",
    svc_local_title: "Lokale Umzüge (Berlin)",
    svc_local_desc: "Stadtumzüge innerhalb Berlins – schnell & sorgfältig.",
    svc_furniture_title: "Möbelmontage",
    svc_furniture_desc: "Fachgerechter Ab- & Aufbau.",
    svc_van_title: "Transporter + Fahrer",
    svc_van_desc: "Kleintransporte, Helfer auf Wunsch.",
    svc_clear_title: "Entrümpelung & Entsorgung",
    svc_clear_desc: "Umweltgerecht & transparent.",
    svc_survey_title: "Besichtigung & Beratung",
    svc_survey_desc: "Kostenlose Einschätzung per Telefon oder vor Ort.",
    pricing_title: "Transparente Preise",
    pricing_sub: "Fair und ehrlich – ohne versteckte Kosten.",
    price_local_title: "Lokaler Umzug (Berlin)",
    price_local_desc: "inkl. 2 Umzugshelfer + Transporter",
    price_helper_title: "Extra Umzugshelfer",
    price_helper_desc: "zusätzlicher Helfer pro Stunde",
    price_assembly_title: "Montage/Demontage",
    price_assembly_desc: "pro Teil (einfach)",
    price_clear_title: "Entrümpelung/Entsorgung",
    price_clear_desc: "zum Recyclinghof",
    from: "ab",
    per_hour: "/Stunde",
    flat: "pauschal",
    per_m3: "pro m³",
    pricing_note:
      "Alle Preise inkl. Versicherung & MwSt. Endpreis abhängig von Entfernung, Stockwerk & Volumen.",
    gal_team:
      "Unser erfahrenes Team<br><span class='tiny'>Professionell & zuverlässig</span>",
    reviews_title: "Bewertungen",
    reviews_sub: "Ihre Meinung zählt – bewerten Sie unseren Service.",
    reviews_count_word: "Bewertungen",
    review_form_title: "Bewertung abgeben",
    review_form_tip: "Sterne wählen und kurz kommentieren.",
    review_rating_label: "Ihre Bewertung",
    review_name_label: "Ihr Name (optional)",
    review_comment_label: "Ihr Kommentar",
    review_submit: "Bewertung senden",
    review_clear: "Lokale Bewertungen löschen",
    review_note: "Hinweis: lokal im Browser gespeichert (MVP).",
    review_recent: "Neueste Bewertungen",
    review_sort: "Neu zuerst",
    review_delete: "Löschen",
    booking_title: "Terminbuchung",
    booking_sub:
      "Schicken Sie uns die Eckdaten – wir melden uns mit einem Angebot.",
    f_name: "Name*",
    f_phone: "Telefonnummer*",
    f_date: "Umzugsdatum*",
    f_size: "Wohnungsgröße",
    f_from: "Von (Adresse)",
    f_to: "Nach (Adresse)",
    f_message: "Nachricht",
    ph_fullname: "Max Mustermann",
    ph_phone: "+49 ...",
    ph_from: "Straße, PLZ Ort, Etage",
    ph_to: "Straße, PLZ Ort, Etage",
    ph_message: "Besonderheiten (Aufzug, Klavier, Halteverbot, Kartons)…",
    ph_name: "Max M.",
    ph_comment: "Wie war Ihre Erfahrung? (mind. 10 Zeichen)",
    opt_choose: "Bitte auswählen",
    opt_1: "1 Zimmer",
    opt_2: "2 Zimmer",
    opt_3: "3 Zimmer",
    opt_4: "4 Zimmer",
    opt_5: "5+ Zimmer",
    cta_email: "Per E-Mail senden",
    contact_title: "Kontakt",
    contact_sub: "Fragen? Rufen Sie an oder schreiben Sie per WhatsApp.",
    contact_direct: "Direkter Kontakt",
    contact_phone: "Telefon:",
    contact_email: "E-Mail:",
    contact_email_send: "E-Mail senden",
    contact_whatsapp: "Chat starten",
    hours: "Bürozeiten: Mo–Sa 08:00–20:00",
    rights: "Alle Rechte vorbehalten.",
    legal: "Impressum · Datenschutz · AGB",
    mail_subject: "Umzugsanfrage über Website",
    mail_subject_prefix: "Neue Umzugsanfrage",
    mail_prices_note:
      "Preise (Info): Lokal ab 80€/Std (2 Helfer + Transporter), Extra Helfer +25€/Std, Montage ab 30€, Entrümpelung ab 50€/m³",
  },
};

function getLang() {
  return localStorage.getItem("lang") || "en";
}
function setLang(lang) {
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
  document.getElementById("langEn").classList.toggle("active", lang === "en");
  document.getElementById("langDe").classList.toggle("active", lang === "de");
  const dict = I18N[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) {
      if (el.innerHTML.includes("<br")) el.innerHTML = dict[key];
      else el.textContent = dict[key];
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });
  setWA(lang);
  renderReviews();
}
document
  .getElementById("langEn")
  .addEventListener("click", () => setLang("en"));
document
  .getElementById("langDe")
  .addEventListener("click", () => setLang("de"));

/* Theme toggle */
function getTheme() {
  return (
    localStorage.getItem("theme") ||
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
}
function setTheme(theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute(
    "data-theme",
    theme === "dark" ? "dark" : ""
  );
  document.getElementById("themeToggle").textContent =
    theme === "dark" ? "☀️" : "🌙";
}
document
  .getElementById("themeToggle")
  .addEventListener("click", () =>
    setTheme(getTheme() === "dark" ? "light" : "dark")
  );

/* Init */
setTheme(getTheme());
setLang(getLang());

/* EmailJS */
const EMAILJS_SERVICE_ID = "service_iz6367l"; // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = "template_uhzwn5s"; // e.g. 'template_def456'
const EMAILJS_PUBLIC_KEY = "HFvMFCxcbakdDWWdO"; // e.g. 'XyZ...'
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const SEND_LABELS = {
  en: {
    sending: "Sending…",
    sent: "Sent!",
    error: "Couldn’t send. Please try again.",
  },
  de: {
    sending: "Senden…",
    sent: "Gesendet!",
    error: "Senden fehlgeschlagen. Bitte erneut versuchen.",
  },
};
const quoteForm = document.getElementById("quoteForm"),
  sendBtn = document.getElementById("mailSend");
quoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!quoteForm.reportValidity()) return;
  const lang = getLang(),
    t = SEND_LABELS[lang] || SEND_LABELS.en,
    prev = sendBtn.textContent;
  sendBtn.disabled = true;
  sendBtn.textContent = t.sending;
  try {
    await emailjs.sendForm(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      "#quoteForm"
    );
    sendBtn.textContent = t.sent;
    quoteForm.reset();
    setTimeout(() => {
      sendBtn.textContent = prev;
      sendBtn.disabled = false;
    }, 1200);
  } catch (err) {
    console.error("EmailJS error", err);
    alert(t.error);
    sendBtn.textContent = prev;
    sendBtn.disabled = false;
  }
});
