// ------------------ MAIN APP SCRIPT ------------------
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// i18n dictionary
const dict = {
  en:{
    'nav.home':'Home','nav.services':'Services','nav.gallery':'Gallery','nav.reviews':'Reviews','nav.contact':'Contact',
    'hero.badge':'Trusted by 1,000+ Berliners',
    'hero.title':'Stress-free moving & transport — fast, careful, insured.',
    'hero.sub':'From studio flats to full houses, we pack, protect, and deliver on time. Get a free quote today.',
    'cta.quote':'Get a quote','cta.call':'Call now',
    'home.cards.0.t':'Professional Crew','home.cards.0.d':'Friendly workers trained to protect your furniture and floors.',
    'home.cards.1.t':'Flat, Fair Pricing','home.cards.1.d':'No surprises. Clear prices with everything included.',
    'home.cards.2.t':'Fully Insured','home.cards.2.d':'Your belongings are covered from A to B.',
    'services.title':'Our Services','services.sub':'Tailored to your move — choose what you need.',
    'services.items.0.t':'Apartment & House Moves','services.items.0.d':'Packing, loading, transport, unloading — end-to-end.',
    'services.items.1.t':'Furniture Assembly','services.items.1.d':' We bring tools and protect floors.',
    'services.items.2.t':'Office Relocation','services.items.2.d':'Minimal downtime, careful handling of electronics.',
    'services.items.3.t':'Disposal & Recycling','services.items.3.d':'Old furniture removal with proper recycling.',
    'gallery.title':'Gallery','gallery.sub':'Recent jobs and our protective packing.',
    'reviews.title':'Customer Reviews','reviews.sub':'Leave your review — it helps others choose with confidence.','reviews.avg':'Average rating',
    'form.name':'Your name','form.rating':'Your rating','form.comment':'Comment','form.submit':'Submit review',
    'contact.title':'Contact','contact.sub':'Quick quote? Send us photos on WhatsApp or call us now.',
    'contact.whatsapp.t':'WhatsApp','contact.whatsapp.d':'Message us with your moving list and photos.','contact.whatsapp.btn':'Chat on WhatsApp',
    'contact.phone.t':'Phone','contact.phone.d':'We speak English & German.','contact.phone.btn':'Call +49 176 5799 0309',
    'footer.rights':'All rights reserved.'
  },
  de:{
    'nav.home':'Start','nav.services':'Leistungen','nav.gallery':'Galerie','nav.reviews':'Bewertungen','nav.contact':'Kontakt',
    'hero.badge':'Vertraut von über 1.000 Berliner:innen',
    'hero.title':'Stressfreier Umzug & Transport – schnell, sorgfältig, versichert.',
    'hero.sub':'Vom Studio bis zum Haus: Wir verpacken, schützen und liefern pünktlich. Holen Sie sich jetzt ein Angebot.',
    'cta.quote':'Angebot anfragen','cta.call':'Jetzt anrufen',
    'home.cards.0.t':'Professionelles Team','home.cards.0.d':'Freundliche UmzugsArbeiter, die Möbel und Böden schützen.',
    'home.cards.1.t':'Faire Festpreise','home.cards.1.d':'Keine Überraschungen. Klare Preise mit allem inklusive.',
    'home.cards.2.t':'Voll versichert','home.cards.2.d':'Ihre Sachen sind von A bis B abgesichert.',
    'services.title':'Unsere Leistungen','services.sub':'Passend zu Ihrem Umzug – wählen Sie, was Sie brauchen.',
    'services.items.0.t':'Wohnungs- & Hausumzüge','services.items.0.d':'Packen, Laden, Transport, Entladen – alles aus einer Hand.',
    'services.items.1.t':'Möbelmontage','services.items.1.d':'Wir bringen Werkzeug mit und schützen die Böden.',
    'services.items.2.t':'Büroumzug','services.items.2.d':'Minimale Ausfallzeit, sorgfältiger Umgang mit Elektronik.',
    'services.items.3.t':'Entsorgung & Recycling','services.items.3.d':'Altmöbel fachgerecht entsorgen lassen.',
    'gallery.title':'Galerie','gallery.sub':'Aktuelle Einsätze und unser Schutzverpacken.',
    'reviews.title':'Kundenbewertungen','reviews.sub':'Teilen Sie Ihre Erfahrung – das hilft anderen bei der Wahl.','reviews.avg':'Durchschnittsbewertung',
    'form.name':'Ihr Name','form.rating':'Ihre Bewertung','form.comment':'Kommentar','form.submit':'Bewertung senden',
    'contact.title':'Kontakt','contact.sub':'Schnelles Angebot? Senden Sie uns Fotos per WhatsApp oder rufen Sie an.',
    'contact.whatsapp.t':'WhatsApp','contact.whatsapp.d':'Schicken Sie uns Ihre Umzugsliste und Fotos.','contact.whatsapp.btn':'Auf WhatsApp chatten',
    'contact.phone.t':'Telefon','contact.phone.d':'Wir sprechen Deutsch & Englisch.','contact.phone.btn':'Anrufen: +49 176 5799 0309',
    'footer.rights':'Alle Rechte vorbehalten.'
  }
};

const state = { lang: localStorage.getItem('lang') || 'en', theme: localStorage.getItem('theme') || 'dark' };

function applyLang(lang){
  state.lang = lang;
  localStorage.setItem('lang',lang);
  document.documentElement.lang = (lang==='de'?'de':'en');
  $$('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    const t = (dict[lang]||{})[k];
    if(typeof t!=='undefined') el.textContent=t;
  });
}

function applyTheme(theme){
  state.theme = theme;
  localStorage.setItem('theme',theme);
  document.documentElement.classList.toggle('light', theme==='light');
}

// Ensure all sections visible
$$('[data-page]').forEach(s=>{ s.hidden=false; s.removeAttribute('hidden'); });

// Smooth scroll with offset
function scrollToId(id){
  const el=$(id); if(!el) return;
  const h=$('header')?.offsetHeight||0;
  const y=el.getBoundingClientRect().top + window.scrollY - h - 6;
  window.scrollTo({top:y, behavior:'smooth'});
}
$$('.nav-links a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const id=a.getAttribute('href');
    scrollToId(id);
    history.replaceState(null,'',id);
  }, {passive:false});
});

// Active link highlight
const links=$$('.nav-links a');
const io=new IntersectionObserver((ents)=>{
  ents.forEach(e=>{
    if(e.isIntersecting){
      const id='#'+e.target.id;
      links.forEach(a=>a.classList.toggle('active', a.getAttribute('href')===id));
    }
  });
},{root:null, rootMargin:'-55% 0px -40% 0px', threshold:0});
$$('[data-page]').forEach(sec=> io.observe(sec));

// Buttons
$('#langBtn')?.addEventListener('click', ()=> applyLang(state.lang==='en'?'de':'en'));
$('#themeBtn')?.addEventListener('click', ()=> applyTheme(state.theme==='dark'?'light':'dark'));

// Init
$('#year').textContent = new Date().getFullYear();
applyTheme(state.theme); applyLang(state.lang);
if(location.hash){ setTimeout(()=> scrollToId(location.hash), 80); }
window.addEventListener('scroll', ()=> $('header').classList.toggle('scrolled', window.scrollY>4));


// ------------------ FIREBASE REVIEWS ------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmJNUtDlMl8LFoK5H8hIVn6QecFm6JJgo",
  authDomain: "quick-umzug.firebaseapp.com",
  projectId: "quick-umzug",
  storageBucket: "quick-umzug.firebasestorage.app",
  messagingSenderId: "335118579637",
  appId: "1:335118579637:web:26acbbeb6539b5b1decbfc",
  measurementId: "G-W42QQ3YHE2"
};

const appFB = initializeApp(firebaseConfig);
const db = getFirestore(appFB);
const reviewsCol = collection(db, 'reviews');

// --- Stars helper ---
function makeStars(container, initial=0, readOnly=false){
  if(!container) return;
  container.innerHTML='';
  const n=5; const stars=[];
  for(let i=1;i<=n;i++){
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.style.width='22px'; svg.style.height='22px';
    svg.innerHTML = '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>';
    if(initial>=i) svg.classList.add('active');
    if(!readOnly){
      svg.addEventListener('mouseenter',()=>{ stars.forEach((s,idx)=>s.classList.toggle('active', idx < i)); });
      svg.addEventListener('click',()=>{ ratingState.value=i; });
      container.addEventListener('mouseleave',()=>{ stars.forEach((s,idx)=>s.classList.toggle('active', idx < (ratingState.value||0))); });
    }
    container.appendChild(svg); stars.push(svg);
  }
}

const ratingState = { value:0 };
makeStars(document.getElementById('ratingStars'));

// Render reviews
function renderReviews(docs){
  const list = $('#reviewsList');
  list.innerHTML = '';
  let sum = 0;
  if(docs.length===0){
    const empty = document.createElement('div');
    empty.className='muted';
    empty.textContent = (document.documentElement.lang==='de') ? 'Noch keine Bewertungen.' : 'No reviews yet.';
    list.appendChild(empty);
  } else {
    docs.forEach(d=>{
      const r = d.data();
      sum += (r.rating||0);
      const card = document.createElement('div');
      card.className='review';
      const name = document.createElement('div'); name.style.fontWeight='700'; name.textContent=r.name || 'Anon';
      const stars = document.createElement('div'); stars.className='stars'; makeStars(stars, r.rating||0, true);
      const text = document.createElement('p'); text.className='muted'; text.textContent=r.comment || '';
      card.append(name, stars, text);
      list.appendChild(card);
    });
  }
  const avg = docs.length ? (sum/docs.length) : 0;
  makeStars(document.getElementById('avgStars'), Math.round(avg), true);
  document.getElementById('avgText').textContent = `${avg.toFixed(1)} (${docs.length})`;
}

// Live listener
const q = query(reviewsCol, orderBy('ts','desc'), limit(100));
onSnapshot(q, (snap)=>{ renderReviews(snap.docs.slice().reverse()); });

// Submit review
const form = document.getElementById('reviewForm');
form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const comment = document.getElementById('comment').value.trim();
  const rating = ratingState.value || 0;
  if(!name || !comment || rating===0){
    alert(document.documentElement.lang==='de' ? 'Bitte füllen Sie alle Felder aus und wählen Sie Sterne.' : 'Please fill all fields and choose a star rating.');
    return;
  }
  try{
    await addDoc(reviewsCol, { name, comment, rating, ts: serverTimestamp() });
    ratingState.value = 0; form.reset();
    makeStars(document.getElementById('ratingStars')); // reset stars
  }catch(err){
    console.error(err);
    alert('Could not send review. Please try again later.');
  }
});
