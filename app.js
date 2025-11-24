// app.js
const locationText = document.getElementById('locationText');
const statusDiv = document.getElementById('status');
const prayerList = document.getElementById('prayerTimes');
const refreshBtn = document.getElementById('refreshBtn');
const notifyBtn = document.getElementById('notifyBtn');
const methodSelect = document.getElementById('methodSelect');
const yearSpan = document.getElementById('year');

yearSpan.textContent = new Date().getFullYear();

const API_BASE = 'https://api.aladhan.com/v1/timings'; // Aladhan API

// load saved method or default
const savedMethod = localStorage.getItem('solat_method') || '2';
methodSelect.value = savedMethod;

methodSelect.addEventListener('change', () => {
  localStorage.setItem('solat_method', methodSelect.value);
  getLocationAndLoad();
});

refreshBtn.addEventListener('click', getLocationAndLoad);

notifyBtn.addEventListener('click', async () => {
  if (!('Notification' in window)) { alert('Notifikasi tidak disokong.'); return; }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { alert('Sila benarkan notifikasi.'); return; }
  new Notification('Waktu Solat', { body: 'Notifikasi diaktifkan (sementara). Aplikasi mesti dibuka untuk terima pemberitahuan ini.' });
});

// register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('SW registered', reg);
    }).catch(e => console.warn('SW reg failed', e));
  });
}

// main flow
function getLocationAndLoad() {
  if (!navigator.geolocation) {
    locationText.textContent = 'Geolocation tidak disokong oleh pelayar ini.';
    statusDiv.textContent = 'Tidak dapat menentukan lokasi.';
    return;
  }

  statusDiv.textContent = 'Mencari lokasi…';
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    locationText.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
    await loadPrayerTimes(lat, lon, methodSelect.value);
  }, err => {
    console.error(err);
    locationText.textContent = 'Lokasi ditolak atau gagal.';
    statusDiv.textContent = 'Sila benarkan akses lokasi.';
  }, { enableHighAccuracy: false, timeout: 15000 });
}

async function loadPrayerTimes(lat, lon, method) {
  statusDiv.textContent = 'Memuatkan waktu solat...';
  const today = new Date();
  const timestamp = Math.floor(today.getTime() / 1000);

  const url = `${API_BASE}/${timestamp}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&method=${encodeURIComponent(method)}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    if (!data || !data.data || !data.data.timings) throw new Error('API response error');
    renderTimings(data.data.timings);
    statusDiv.textContent = `Waktu solat dikira untuk ${data.data.date.readable}`;
  } catch (e) {
    console.error(e);
    statusDiv.textContent = 'Gagal memuatkan data. Sila cuba lagi.';
  }
}

function renderTimings(timings) {
  prayerList.innerHTML = '';
  const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const malay = {Fajr:'Subuh', Sunrise:'Syuruk', Dhuhr:'Zohor', Asr:'Asar', Maghrib:'Maghrib', Isha:'Isyak'};

  order.forEach(k => {
    const li = document.createElement('li');
    li.setAttribute('data-key', k);
    li.innerHTML = `<span>${malay[k] || k}</span><span class="time">${timings[k]}</span>`;
    prayerList.appendChild(li);
  });

  highlightNextPrayer(timings);
}

function parseTimeToDate(timeStr) {
  // timeStr like "05:13" or "05:13 (GST)"
  const clean = timeStr.trim().split(' ')[0];
  const [h,m] = clean.split(':').map(x => parseInt(x,10));
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function highlightNextPrayer(timings) {
  const now = new Date();
  const order = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
  let nextIndex = -1;
  for (let i=0;i<order.length;i++){
    const t = parseTimeToDate(timings[order[i]]);
    if (t > now) { nextIndex = i; break; }
  }
  if (nextIndex === -1) nextIndex = 0; // next day's Fajr

  const lis = prayerList.querySelectorAll('li');
  lis.forEach((li, idx) => {
    li.classList.toggle('next', idx === nextIndex);
  });
}

// start on load
getLocationAndLoad();
