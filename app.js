/**
 * Velora Travel Platform - Core Application Logic
 * Optimized for lag-free performance, responsive layout, dual-engine maps,
 * debounced search, and highlight-framed imagery.
 */

// --- 0. GOOGLE MAPS CALLBACK & DUAL ENGINE MAP SUPPORT ---
let googleMapsReady = false;
let leafletMapInstance = null;
let googleMapInstance = null;


// --- CURRENCY CONVERTER ENGINE ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
  INR: { symbol: '₹', rate: 84.5, label: 'INR (₹)' },
  JPY: { symbol: '¥', rate: 154.0, label: 'JPY (¥)' },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD (A$)' }
};

let currentCurrency = 'USD';
try {
  const saved = localStorage.getItem('velora_currency');
  if (saved && CURRENCIES[saved]) currentCurrency = saved;
} catch (e) {}

function formatPrice(usdAmount) {
  if (typeof usdAmount !== 'number' || isNaN(usdAmount)) return '$0';
  const curr = CURRENCIES[currentCurrency] || CURRENCIES.USD;
  const converted = Math.round(usdAmount * curr.rate);
  return `${curr.symbol}${converted.toLocaleString()}`;
}

function setCurrency(newCurr) {
  if (CURRENCIES[newCurr]) {
    currentCurrency = newCurr;
    try { localStorage.setItem('velora_currency', newCurr); } catch (e) {}
    
    // Refresh current views
    if (currentDestinationId) {
      renderHotels(currentDestinationId);
      renderAttractions(currentDestinationId);
      renderMainDestinationMap(currentDestinationId, false);
      const dest = veloraStore.destinationMap.get(currentDestinationId);
      if (dest) renderItinerary(dest);
    }
  }
}


// --- THEME ENGINE (DARK / LIGHT LUXURY PALETTE) ---
function initThemeEngine() {
  let theme = 'light';
  try {
    const saved = localStorage.getItem('velora_theme');
    if (saved) {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch (e) {}
  
  applyTheme(theme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('velora_theme', theme); } catch (e) {}
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}


// --- BUCKET LIST & FAVORITES ENGINE (LOCALSTORAGE) ---
let bucketList = [];
try {
  const saved = localStorage.getItem('velora_bucket_list');
  if (saved) bucketList = JSON.parse(saved);
} catch (e) {
  bucketList = [];
}

function saveBucketList() {
  try {
    localStorage.setItem('velora_bucket_list', JSON.stringify(bucketList));
  } catch (e) {}
  updateBucketBadge();
  renderBucketDrawer();
  updateHeartButtons();
}

function isItemInBucket(type, id) {
  return bucketList.some(item => item.type === type && item.id === id);
}

function toggleBucketItem(type, id) {
  const idx = bucketList.findIndex(item => item.type === type && item.id === id);
  if (idx > -1) {
    const removed = bucketList.splice(idx, 1)[0];
    showToastNotification('Removed from Bucket List', `${removed.name} was removed from your list.`);
  } else {
    let itemData = null;
    if (type === 'destination') {
      const dest = veloraStore.destinationMap.get(id);
      if (dest) {
        itemData = {
          type,
          id,
          name: dest.name,
          sub: `${dest.famousPlace || dest.name}, ${dest.country}`,
          image: dest.thumb || dest.image
        };
      }
    } else if (type === 'hotel') {
      for (const hotels of veloraStore.hotelsByDestId.values()) {
        const h = hotels.find(x => x.id === id);
        if (h) {
          const d = veloraStore.destinationMap.get(h.dest_id);
          itemData = {
            type,
            id,
            dest_id: h.dest_id,
            name: h.name,
            sub: `${d ? d.name + ' · ' : ''}From ${formatPrice(h.price_usd)}/night`,
            image: d?.thumb || d?.image
          };
          break;
        }
      }
    } else if (type === 'attraction') {
      for (const attrs of veloraStore.attractionsByDestId.values()) {
        const a = attrs.find(x => x.id === id);
        if (a) {
          const d = veloraStore.destinationMap.get(a.dest_id);
          itemData = {
            type,
            id,
            dest_id: a.dest_id,
            name: a.name,
            sub: `${a.category} · ${d ? d.name : ''}`,
            image: d?.thumb || d?.image
          };
          break;
        }
      }
    }

    if (itemData) {
      bucketList.push(itemData);
      showToastNotification('Saved to Bucket List! ❤️', `${itemData.name} added to your travel collection.`);
    }
  }

  saveBucketList();
}

function updateBucketBadge() {
  const badge = document.getElementById('bucket-badge-count');
  if (badge) badge.textContent = bucketList.length;
  const drawerCount = document.getElementById('drawer-bucket-count');
  if (drawerCount) drawerCount.textContent = `${bucketList.length} saved`;
}

let activeBucketFilter = 'all';

function renderBucketDrawer() {
  const container = document.getElementById('bucket-drawer-items');
  if (!container) return;

  const filtered = activeBucketFilter === 'all'
    ? bucketList
    : bucketList.filter(item => item.type === activeBucketFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bucket-empty-state">
        <i class="fas fa-heart-broken" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem; opacity: 0.5;"></i>
        <h4>Your Bucket List is Empty</h4>
        <p style="font-size: 0.82rem; margin-top: 0.35rem;">Click the heart icon on any destination, hotel, or landmark to save it here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="bucket-item-card" onclick="handleBucketItemClick('${item.type}', ${item.id}, ${item.dest_id || 'null'})">
      <img class="bucket-item-thumb" src="${item.image || ''}" alt="${escapeHtml(item.name)}" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&q=80'">
      <div class="bucket-item-info">
        <div class="bucket-item-name">${escapeHtml(item.name)}</div>
        <div class="bucket-item-meta"><i class="${item.type === 'destination' ? 'fas fa-map-pin' : (item.type === 'hotel' ? 'fas fa-hotel' : 'fas fa-landmark')}"></i> ${escapeHtml(item.sub)}</div>
      </div>
      <button type="button" class="bucket-remove-btn" onclick="event.stopPropagation(); toggleBucketItem('${item.type}', ${item.id})" title="Remove item">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

function handleBucketItemClick(type, id, destId) {
  closeBucketDrawer();
  if (type === 'destination') {
    selectDestination(id);
  } else if (type === 'hotel') {
    if (destId) selectDestination(destId);
    setTimeout(() => openHotelModal(id), 300);
  } else if (type === 'attraction') {
    if (destId) selectDestination(destId);
    setTimeout(() => openAttractionModal(id), 300);
  }
}

function updateHeartButtons() {
  const heroBtn = document.getElementById('hero-fav-btn');
  if (heroBtn && currentDestinationId) {
    const isFav = isItemInBucket('destination', currentDestinationId);
    heroBtn.classList.toggle('is-fav', isFav);
    heroBtn.innerHTML = `<i class="fas fa-heart"></i> ${isFav ? 'Saved in Bucket List' : 'Save to Bucket List'}`;
  }

  document.querySelectorAll('.card-fav-action').forEach(btn => {
    const type = btn.getAttribute('data-fav-type');
    const id = parseInt(btn.getAttribute('data-fav-id'), 10);
    const isFav = isItemInBucket(type, id);
    btn.classList.toggle('is-fav', isFav);
  });
}

function openBucketDrawer() {
  document.getElementById('bucket-drawer')?.classList.add('open');
  document.getElementById('bucket-drawer-overlay')?.classList.add('active');
  renderBucketDrawer();
}

function closeBucketDrawer() {
  document.getElementById('bucket-drawer')?.classList.remove('open');
  document.getElementById('bucket-drawer-overlay')?.classList.remove('active');
}

function clearBucketList() {
  if (bucketList.length === 0) return;
  if (confirm('Are you sure you want to clear your entire bucket list?')) {
    bucketList = [];
    saveBucketList();
    showToastNotification('Bucket List Cleared', 'All saved items have been cleared.');
  }
}

function exportBucketList() {
  if (bucketList.length === 0) {
    showToastNotification('Bucket List Empty', 'Save items first before sharing.');
    return;
  }
  const lines = ['Velora Travel Platform - My Travel Bucket List:', ''];
  bucketList.forEach((it, i) => lines.push(`${i+1}. [${it.type.toUpperCase()}] ${it.name} (${it.sub})`));
  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    showToastNotification('Bucket List Copied! 📋', 'Shareable summary copied to clipboard.');
  }).catch(() => {
    alert(text);
  });
}


// --- PROCEDURAL AMBIENT SOUND GENERATOR (WEB AUDIO API - 100% OFFLINE) ---
let ambientAudioCtx = null;
let ambientMasterGain = null;
let isAmbientPlaying = false;
let ambientOscillators = [];

function toggleAmbientSound() {
  if (isAmbientPlaying) {
    stopAmbientSound();
  } else {
    startAmbientSound();
  }
}

function startAmbientSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      showToastNotification('Audio Not Supported', 'Your browser does not support Web Audio API.');
      return;
    }
    
    if (!ambientAudioCtx) {
      ambientAudioCtx = new AudioCtx();
    }
    
    if (ambientAudioCtx.state === 'suspended') {
      ambientAudioCtx.resume();
    }

    ambientMasterGain = ambientAudioCtx.createGain();
    ambientMasterGain.gain.setValueAtTime(0.01, ambientAudioCtx.currentTime);
    ambientMasterGain.gain.exponentialRampToValueAtTime(0.08, ambientAudioCtx.currentTime + 2.0);
    ambientMasterGain.connect(ambientAudioCtx.destination);

    // Warm, tranquil drone chords (432Hz harmonic scale)
    const freqs = [108.0, 162.0, 216.0, 324.0];
    ambientOscillators = freqs.map((freq, idx) => {
      const osc = ambientAudioCtx.createOscillator();
      const filter = ambientAudioCtx.createBiquadFilter();
      const gain = ambientAudioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ambientAudioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ambientAudioCtx.currentTime);

      gain.gain.setValueAtTime(0.25 / freqs.length, ambientAudioCtx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ambientMasterGain);
      osc.start();
      return osc;
    });

    isAmbientPlaying = true;
    updateSoundBtnState();
    showToastNotification('Nature Ambience Playing 🎧', 'Tranquil harmonic soundscape activated.');
  } catch (err) {
    console.warn('Ambient audio error:', err);
  }
}

function stopAmbientSound() {
  if (ambientMasterGain && ambientAudioCtx) {
    ambientMasterGain.gain.exponentialRampToValueAtTime(0.0001, ambientAudioCtx.currentTime + 1.0);
    setTimeout(() => {
      ambientOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      ambientOscillators = [];
      isAmbientPlaying = false;
      updateSoundBtnState();
      showToastNotification('Ambience Muted 🔇', 'Soundscape paused.');
    }, 1000);
  } else {
    isAmbientPlaying = false;
    updateSoundBtnState();
  }
}

function updateSoundBtnState() {
  const btn = document.getElementById('hero-sound-btn');
  if (btn) {
    btn.classList.toggle('is-playing', isAmbientPlaying);
    btn.innerHTML = `<i class="fas ${isAmbientPlaying ? 'fa-volume-mute' : 'fa-volume-up'}"></i> ${isAmbientPlaying ? 'Mute Ambience' : 'Nature Ambience'}`;
  }
}


// --- CURATED 3-DAY ITINERARY GENERATOR ---
function getBestSeason(dest) {
  const terrain = (dest.terrain || '').toLowerCase();
  const climate = (dest.climate || '').toLowerCase();
  if (terrain.includes('mountain') || terrain.includes('alpine')) return 'June – September (Alpine Summer) & Dec – Mar (Snow)';
  if (terrain.includes('beach') || terrain.includes('island')) return 'November – April (Dry Sunshine Window)';
  if (climate.includes('desert') || climate.includes('arid')) return 'October – March (Pleasant Days & Crisp Nights)';
  return 'March – May & September – November (Ideal Weather)';
}

function getAvgTemp(dest) {
  const climate = (dest.climate || '').toLowerCase();
  if (climate.includes('tropical') || climate.includes('humid')) return '26°C – 32°C (80°F – 90°F)';
  if (climate.includes('cold') || climate.includes('alpine')) return '4°C – 16°C (39°F – 61°F)';
  if (climate.includes('desert')) return '18°C – 28°C (64°F – 82°F)';
  return '15°C – 23°C (59°F – 73°F)';
}

function getPackingTip(dest) {
  const terrain = (dest.terrain || '').toLowerCase();
  if (terrain.includes('mountain')) return 'Thermal layers, hiking boots & UV sunglasses';
  if (terrain.includes('beach')) return 'Light linen, reef-safe sunscreen & swimwear';
  return 'Comfortable walking sneakers, light jacket & camera';
}

function renderItinerary(dest) {
  const container = document.getElementById('itinerary-days-container');
  if (!container) return;

  const titleEl = document.getElementById('itinerary-title');
  if (titleEl) titleEl.textContent = `Curated 3-Day Experience: ${dest.name}`;

  const attractions = veloraStore.attractionsByDestId.get(dest.id) || [];
  const hotels = veloraStore.hotelsByDestId.get(dest.id) || [];
  const dining = veloraStore.restaurantsByDestId.get(dest.id) || [];

  const hotelName = hotels[0]?.name || `${dest.name} Boutique Retreat`;
  const attr1 = attractions[0]?.name || dest.famousPlace || 'Historic City Center';
  const attr2 = attractions[1]?.name || 'Panoramic Viewpoint & Cultural District';
  const attr3 = attractions[2]?.name || 'Local Artisan Markets & Heritage Sanctuary';
  const din1 = dining[0]?.name || 'Signature Regional Dining';
  const din2 = dining[1]?.name || 'Artisan Sunset Bistro';

  const days = [
    {
      day: 'Day 1',
      theme: 'Arrival & Iconic Landmarks',
      slots: [
        { time: '09:00 AM', title: `VIP Check-in at ${hotelName}`, desc: 'Settle into your suite, enjoy welcome artisan tea, and view orientation maps.' },
        { time: '02:00 PM', title: `Explore ${attr1}`, desc: 'Guided stroll through premier cultural grounds, photo viewpoints, and historic architecture.' },
        { time: '07:30 PM', title: `Welcome Dinner at ${din1}`, desc: 'Multi-course regional gastronomy featuring authentic seasonal ingredients.' }
      ]
    },
    {
      day: 'Day 2',
      theme: 'Scenic Marvels & Cultural Immersion',
      slots: [
        { time: '08:30 AM', title: `Sunrise Excursion to ${attr2}`, desc: 'Golden hour photography, pristine walking trails, and panoramic landmark vistas.' },
        { time: '01:00 PM', title: 'Curated Artisan Food & Craft Walk', desc: 'Taste local delicacies, visit boutique craft workshops, and meet regional artisans.' },
        { time: '06:00 PM', title: `Sunset Gathering at ${din2}`, desc: 'Relax with panoramic twilight views, signature cocktails, and live acoustic music.' }
      ]
    },
    {
      day: 'Day 3',
      theme: 'Heritage Highlights & Farewell',
      slots: [
        { time: '09:30 AM', title: `Visit ${attr3}`, desc: 'Gentle exploration of peaceful sanctuaries, lush gardens, and historic architecture.' },
        { time: '01:30 PM', title: 'Boutique Shopping & Keepsakes', desc: 'Curated shopping for authentic regional handicrafts, spices, and artisan goods.' },
        { time: '05:00 PM', title: 'Chauffeur Transfer & Departure', desc: 'Convenient airport / luxury private transfer to your onward connection.' }
      ]
    }
  ];

  container.innerHTML = days.map(d => `
    <div class="itinerary-day-card">
      <div class="itinerary-day-header">
        <span class="itinerary-day-badge">${d.day}</span>
        <h4 class="itinerary-day-theme">${d.theme}</h4>
      </div>
      <div class="itinerary-slots-list">
        ${d.slots.map(s => `
          <div class="itinerary-slot">
            <span class="slot-time-pill">${s.time}</span>
            <div>
              <div class="slot-title">${escapeHtml(s.title)}</div>
              <div class="slot-desc">${escapeHtml(s.desc)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function copyItineraryToClipboard() {
  const dest = veloraStore.destinationMap.get(currentDestinationId);
  if (!dest) return;
  const cards = document.querySelectorAll('.itinerary-day-card');
  const lines = [`Curated 3-Day Itinerary for ${dest.name}, ${dest.country}`, ''];
  cards.forEach(c => {
    const badge = c.querySelector('.itinerary-day-badge')?.textContent || '';
    const theme = c.querySelector('.itinerary-day-theme')?.textContent || '';
    lines.push(`## ${badge}: ${theme}`);
    c.querySelectorAll('.itinerary-slot').forEach(s => {
      const time = s.querySelector('.slot-time-pill')?.textContent || '';
      const title = s.querySelector('.slot-title')?.textContent || '';
      const desc = s.querySelector('.slot-desc')?.textContent || '';
      lines.push(`- **${time}**: ${title} — ${desc}`);
    });
    lines.push('');
  });
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    showToastNotification('Itinerary Copied! 📅', 'Full 3-day itinerary markdown copied to clipboard.');
  });
}


// --- WALKING TOUR ROUTE ENGINE & MAP FULLSCREEN ---
let tourRoutePolyline = null;
let tourRouteGlow = null;
let tourRouteActive = false;

function toggleTourRoute() {
  if (!mainMapInstance || !currentDestinationId) return;
  tourRouteActive = !tourRouteActive;

  const btn = document.getElementById('map-route-btn');
  const hud = document.getElementById('tour-route-hud');

  if (tourRouteActive) {
    if (btn) btn.classList.add('active');
    drawTourRoute();
  } else {
    if (btn) btn.classList.remove('active');
    clearTourRoute();
    if (hud) hud.style.display = 'none';
  }
}

function clearTourRoute() {
  if (tourRoutePolyline && mainMapInstance) {
    mainMapInstance.removeLayer(tourRoutePolyline);
    tourRoutePolyline = null;
  }
  if (tourRouteGlow && mainMapInstance) {
    mainMapInstance.removeLayer(tourRouteGlow);
    tourRouteGlow = null;
  }
}

function drawTourRoute() {
  clearTourRoute();
  const dest = veloraStore.destinationMap.get(currentDestinationId);
  if (!dest) return;

  const hotels = veloraStore.hotelsByDestId.get(currentDestinationId) || [];
  const attractions = veloraStore.attractionsByDestId.get(currentDestinationId) || [];

  const waypoints = [
    { name: dest.name + ' Center', lat: dest.lat, lng: dest.lng },
    ...(hotels[0] ? [{ name: hotels[0].name, lat: hotels[0].lat, lng: hotels[0].lng }] : []),
    ...(attractions[0] ? [{ name: attractions[0].name, lat: attractions[0].lat, lng: attractions[0].lng }] : []),
    ...(attractions[1] ? [{ name: attractions[1].name, lat: attractions[1].lat, lng: attractions[1].lng }] : [])
  ];

  if (waypoints.length < 2) return;

  const latLngs = waypoints.map(w => [w.lat, w.lng]);

  // Glow line underneath
  tourRouteGlow = L.polyline(latLngs, {
    color: '#818cf8',
    weight: 9,
    opacity: 0.45,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(mainMapInstance);

  // Sharp route line on top
  tourRoutePolyline = L.polyline(latLngs, {
    color: '#4f46e5',
    weight: 4,
    opacity: 0.95,
    dashArray: '8, 8',
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(mainMapInstance);

  // Calculate total tour distance
  let totalKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalKm += calculateHaversineKm(waypoints[i].lat, waypoints[i].lng, waypoints[i+1].lat, waypoints[i+1].lng);
  }

  const walkingMins = Math.round((totalKm / 4.5) * 60);

  // Display HUD
  const hud = document.getElementById('tour-route-hud');
  const stats = document.getElementById('route-stats-text');
  const strip = document.getElementById('route-steps-strip');

  if (stats) stats.textContent = `~${totalKm.toFixed(1)} km · ${walkingMins} mins · ${waypoints.length} Stops`;

  if (strip) {
    strip.innerHTML = waypoints.map((w, idx) => `
      <span class="route-step-chip" onclick="mainMapInstance.flyTo([${w.lat}, ${w.lng}], 16, { duration: 1 })">
        ${idx + 1}. ${escapeHtml(w.name.length > 16 ? w.name.slice(0, 14) + '..' : w.name)}
      </span>
    `).join('');
  }

  if (hud) hud.style.display = 'block';

  mainMapInstance.fitBounds(L.latLngBounds(latLngs).pad(0.35));
}

function toggleMapFullscreen() {
  const wrapper = document.getElementById('map-wrapper-container');
  if (!wrapper) return;
  wrapper.classList.toggle('is-fullscreen');
  const isFull = wrapper.classList.contains('is-fullscreen');
  const btn = document.getElementById('map-fullscreen-btn');
  if (btn) btn.innerHTML = isFull ? '<i class="fas fa-compress"></i> Exit' : '<i class="fas fa-expand"></i> Fullscreen';

  setTimeout(() => {
    if (mainMapInstance) mainMapInstance.invalidateSize();
  }, 200);
}

// ESC key to exit fullscreen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const wrapper = document.getElementById('map-wrapper-container');
    if (wrapper && wrapper.classList.contains('is-fullscreen')) {
      toggleMapFullscreen();
    }
    closeBucketDrawer();
  }
});


// --- URL HASH ROUTING & TOAST HELPER ---
function setupHashRouting() {
  function handleHash() {
    const hash = window.location.hash;
    if (!hash) return;
    const matchId = hash.match(/#dest(?:ination)?=(\d+)/i);
    if (matchId) {
      const id = parseInt(matchId[1], 10);
      if (veloraStore.destinationMap.has(id)) {
        selectDestination(id);
        return;
      }
    }
    const matchName = hash.match(/#dest(?:ination)?=([a-zA-Z\s-]+)/i);
    if (matchName) {
      const name = decodeURIComponent(matchName[1]).toLowerCase().replace(/-/g, ' ').trim();
      const match = veloraStore.destinations.find(d => d.name.toLowerCase() === name);
      if (match) selectDestination(match.id);
    }
  }

  window.addEventListener('hashchange', handleHash);
  // Execute after initial data loaded
  setTimeout(handleHash, 150);
}

function shareCurrentDestination() {
  const dest = veloraStore.destinationMap.get(currentDestinationId);
  if (!dest) return;
  const shareUrl = `${window.location.origin}${window.location.pathname}#dest=${dest.id}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToastNotification('Link Copied! 🔗', `Direct share link for ${dest.name} copied to clipboard.`);
    }).catch(() => {
      prompt('Copy this share link:', shareUrl);
    });
  } else {
    prompt('Copy this share link:', shareUrl);
  }
}

function showToastNotification(title, message) {
  const toast = document.getElementById('toast-notification');
  const tTitle = document.getElementById('toast-title');
  const tMsg = document.getElementById('toast-message');
  if (!toast || !tTitle || !tMsg) return;

  tTitle.textContent = title;
  tMsg.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}


window.initializeGoogleMaps = function() {
  googleMapsReady = true;
  console.log('[Velora] Google Maps API loaded successfully.');
};

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- 1. DATA INITIALIZATION & ENRICHMENT ---
const veloraStore = {
  destinations: [],
  destinationMap: new Map(),
  hotelsByDestId: new Map(),
  attractionsByDestId: new Map(),
  restaurantsByDestId: new Map(),
  roomsByHotelId: new Map()
};

function enrichDestinations() {
  const rawData = (typeof window !== 'undefined' && window.DESTINATIONS_DATA && window.DESTINATIONS_DATA.length > 0)
    ? window.DESTINATIONS_DATA
    : (typeof globalDestinationData !== 'undefined' && Array.isArray(globalDestinationData) && globalDestinationData.length > 0
      ? globalDestinationData
      : (typeof window !== 'undefined' && window.globalDestinationData ? window.globalDestinationData : []));

  rawData.forEach((dest, index) => {
    veloraStore.destinations.push(dest);
    veloraStore.destinationMap.set(dest.id, dest);

    // Build or enrich Hotels
    const hotelList = (dest.nearbyHotels && dest.nearbyHotels.length > 0)
      ? dest.nearbyHotels
      : [`${dest.name} Grand Palace & Spa`, `${dest.name} Boutique Retreat`, `The Oberoi ${dest.name}`];

    const hotelObjects = hotelList.map((hotelName, hIdx) => {
      const hotelId = dest.id * 100 + (hIdx + 1);
      const rating = Number((4.9 - (hIdx * 0.15) + (Math.random() * 0.1)).toFixed(1));
      const basePrice = dest.luxuryLevel === 'luxury' ? 420 : (dest.costOfLiving === 'high' ? 320 : 180);
      const price = basePrice + (hIdx * 80);

      const amenities = [
        ['Free High-Speed Wi-Fi', 'fas fa-wifi'],
        ['Infinity Pool', 'fas fa-swimming-pool'],
        ['Spa & Wellness Center', 'fas fa-spa'],
        ['Complimentary Artisan Breakfast', 'fas fa-coffee'],
        ['Airport Chauffeur Service', 'fas fa-car'],
        ['Fine Dining Restaurant', 'fas fa-utensils']
      ];

      const hotelObj = {
        id: hotelId,
        dest_id: dest.id,
        name: hotelName,
        rating: Math.min(5.0, rating),
        price_usd: price,
        amenities: amenities.slice(0, 4 + (hIdx % 2)),
        lat: Number((dest.lat + [0.0042, -0.0036, 0.0058, -0.0045, 0.0028, -0.0052][hIdx % 6]).toFixed(6)),
        lng: Number((dest.lng + [-0.0038, 0.0045, 0.0040, -0.0035, 0.0062, 0.0022][hIdx % 6]).toFixed(6)),
        address: `${hotelName}, ${dest.famousPlace || dest.name}, ${dest.country}`
      };

      // Enrich Rooms for this hotel
      const rooms = [
        {
          id: hotelId * 10 + 1,
          hotel_id: hotelId,
          type: 'Superior Deluxe Room',
          capacity: '2 Guests',
          price_usd: price,
          amenities: ['Panoramic Landmark View', 'King Signature Bed', 'Marble Rain Shower', 'Free Wi-Fi']
        },
        {
          id: hotelId * 10 + 2,
          hotel_id: hotelId,
          type: 'Executive Panorama Suite',
          capacity: '3 Guests',
          price_usd: Math.round(price * 1.45),
          amenities: ['Private Balcony / Terrace', 'Jacuzzi Bath', 'Complimentary Butler Service', 'Kaiseki/Chef Breakfast']
        },
        {
          id: hotelId * 10 + 3,
          hotel_id: hotelId,
          type: 'Presidential Royal Villa',
          capacity: '4-6 Guests',
          price_usd: Math.round(price * 2.4),
          amenities: ['Private Plunge Pool', 'Personal Chef & Dining Area', 'Full Spa Access', 'VIP Airport Transfer']
        }
      ];
      veloraStore.roomsByHotelId.set(hotelId, rooms);

      return hotelObj;
    });
    veloraStore.hotelsByDestId.set(dest.id, hotelObjects);

    // Build or enrich Attractions
    const attractionNames = [
      dest.famousPlace,
      ...(dest.nearbyAttractions || [])
    ].filter(Boolean);

    const attractionObjects = attractionNames.map((attrName, aIdx) => {
      const isFree = aIdx % 3 === 0;
      const fee = isFree ? 0 : (aIdx === 0 ? 15 : 25 + (aIdx * 10));
      const duration = aIdx === 0 ? 3.5 : (2.0 + (aIdx * 0.5));

      return {
        id: dest.id * 100 + (aIdx + 1),
        dest_id: dest.id,
        name: attrName,
        category: aIdx === 0 ? 'Primary Landmark' : (dest.category || 'Sightseeing'),
        entry_fee_usd: fee,
        duration_hours: duration,
        lat: Number((dest.lat + [0.0, 0.0065, -0.0052, 0.0035, -0.0060, 0.0078][aIdx % 6]).toFixed(6)),
        lng: Number((dest.lng + [0.0, 0.0032, -0.0048, -0.0068, 0.0050, -0.0040][aIdx % 6]).toFixed(6))
      };
    });
    veloraStore.attractionsByDestId.set(dest.id, attractionObjects);

    // Build or enrich Restaurants
    const cuisinesByRegion = {
      'Japan': 'Authentic Kaiseki & Omakase',
      'Switzerland': 'Alpine Fondue & Swiss Gastronomy',
      'Spain': 'Catalan Tapas & Seafood Paella',
      'Indonesia': 'Balinese Spiced Rijsttafel',
      'Greece': 'Mediterranean Seafood & Meze',
      'Canada': 'Rocky Mountain Game & Artisan Grill',
      'Maldives': 'Overwater Seafood & Asian Fusion',
      'Costa Rica': 'Farm-to-Table Costa Rican Organic',
      'New Zealand': 'Modern Kiwi Grill & Central Otago Wine',
      'France': 'Classic French Haute Cuisine & Bakery',
      'Italy': 'Roman Trattoria & Handmade Pasta',
      'Egypt': 'Nile Riverbank Egyptian & Levantine Meze',
      'Brazil': 'Churrascaria Barbecue & Moqueca',
      'Thailand': 'Royal Thai Cuisine & Fresh Andaman Catch',
      'United Arab Emirates': 'Emirati & Global Michelin Dining',
      'USA (Arizona)': 'Southwestern Mesquite Steakhouse',
      'USA': 'New American Artisan & Classic Steakhouse',
      'United Kingdom': 'Modern British Gastronomy & High Tea',
      'Australia': 'Modern Australian Coastal Seafood & Grill',
      'Czech Republic': 'Bohemian Castle Cellar & Artisan Pilsner',
      'Netherlands': 'Modern Dutch Maritime & Farmhouse Bakery',
      'Turkey': 'Ottoman Grand Meze & Bosphorus Seafood',
      'Singapore': 'Peranakan Heritage & Gourmet Hawker Craft'
    };

    const regionalCuisine = cuisinesByRegion[dest.country] || (dest.regionCountry?.includes('India') ? 'Royal Regional Indian Dining' : 'Local Artisan Gastronomy');

    const restaurants = [
      {
        name: `${dest.name} Heritage Dining Room`,
        cuisine: regionalCuisine,
        rating: 4.9,
        price_usd: dest.luxuryLevel === 'luxury' ? 95 : 45,
        features: ['Michelin Recommended', 'Panoramic View', 'Organic Ingredients', 'Sommelier Selection']
      },
      {
        name: `The Spice & Terrace Lounge`,
        cuisine: 'Traditional Local Specialties',
        rating: 4.7,
        price_usd: dest.luxuryLevel === 'luxury' ? 55 : 28,
        features: ['Al Fresco Outdoor Seating', 'Live Cultural Music', 'Vegetarian & Vegan Options']
      },
      {
        name: `Old Town Artisan Kitchen`,
        cuisine: 'Local Street Delicacies & Bakery',
        rating: 4.6,
        price_usd: dest.luxuryLevel === 'luxury' ? 25 : 15,
        features: ['Centuries-old Recipes', 'Casual Social Vibe', 'Budget Friendly']
      }
    ];
    veloraStore.restaurantsByDestId.set(dest.id, restaurants);
  });
}

// --- 2. APPLICATION STATE ---
let currentDestinationId = 1;
let currentHotelPage = 0;
let currentAttractionPage = 0;
const ITEMS_PER_PAGE = 3;

let destinationListPage = 0;
const DESTINATIONS_PAGE_SIZE = 10;
let filteredDestinations = [];

let searchDebounceTimer = null;
let searchQuery = '';
const activeFilters = {
  category: 'all',
  region: 'all',
  terrain: 'all',
  climate: 'all'
};

// --- 3. FILTERING & SEARCH PIPELINE ---
function normalize(str) {
  return String(str || '').toLowerCase().trim();
}

function applyFilters() {
  const terms = normalize(searchQuery).split(/\s+/).filter(Boolean);

  filteredDestinations = veloraStore.destinations.filter(dest => {
    // Category filter
    if (activeFilters.category !== 'all' && dest.category !== activeFilters.category) {
      return false;
    }
    // Region filter
    if (activeFilters.region !== 'all' && dest.region !== activeFilters.region && dest.country !== activeFilters.region) {
      return false;
    }
    // Terrain filter
    if (activeFilters.terrain !== 'all') {
      const terrainStr = normalize(dest.terrain);
      if (!terrainStr.includes(normalize(activeFilters.terrain))) return false;
    }
    // Climate filter
    if (activeFilters.climate !== 'all') {
      const climateStr = normalize(dest.climate);
      if (!climateStr.includes(normalize(activeFilters.climate))) return false;
    }

    // Text search query
    if (terms.length > 0) {
      const searchable = [
        dest.name,
        dest.destination,
        dest.country,
        dest.regionCountry,
        dest.state,
        dest.famousPlace,
        dest.terrain,
        dest.climate,
        dest.description,
        ...(dest.nearbyAttractions || []),
        ...(dest.famousActivities || [])
      ].map(normalize).join(' ');

      return terms.every(term => searchable.includes(term));
    }

    return true;
  });

  destinationListPage = 0;
  renderSidebarDestinations();

  // If current destination is not in filtered set, switch to first result
  if (filteredDestinations.length > 0) {
    const isCurrentInResults = filteredDestinations.some(d => d.id === currentDestinationId);
    if (!isCurrentInResults) {
      selectDestination(filteredDestinations[0].id);
    }
  } else {
    renderEmptyState();
  }
}

// --- 4. SIDEBAR RENDERING ---
function renderSidebarDestinations() {
  const container = document.getElementById('nav-buttons');
  const countBadge = document.getElementById('destination-count-badge');
  const statusEl = document.getElementById('destination-list-status');
  const prevBtn = document.getElementById('destination-list-prev');
  const nextBtn = document.getElementById('destination-list-next');

  countBadge.textContent = filteredDestinations.length;

  if (filteredDestinations.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted);">
        <i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
        <p style="font-size: 0.85rem; font-weight: 500;">No destinations match your filters.</p>
        <button onclick="resetAllFilters()" style="margin-top: 0.5rem; background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; font-size: 0.78rem;">Reset Filters</button>
      </div>
    `;
    statusEl.textContent = '0 results';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const totalPages = Math.ceil(filteredDestinations.length / DESTINATIONS_PAGE_SIZE);
  destinationListPage = Math.max(0, Math.min(destinationListPage, totalPages - 1));

  const startIdx = destinationListPage * DESTINATIONS_PAGE_SIZE;
  const pageItems = filteredDestinations.slice(startIdx, startIdx + DESTINATIONS_PAGE_SIZE);

  container.innerHTML = pageItems.map(dest => {
    const isActive = dest.id === currentDestinationId;
    const thumbUrl = dest.thumb || dest.image;
    const fallbackThumb = dest.fallbackThumb || dest.fallbackImage || '';
    const regionName = dest.regionCountry || dest.country || '';
    const safeName = escapeHtml(dest.name);
    const safeCategory = escapeHtml(dest.category || 'Travel');

    return `
      <button class="destination-btn ${isActive ? 'active' : ''}" data-id="${dest.id}" type="button">
        <div class="destination-btn-thumb">
          <img src="${thumbUrl}" 
               alt="${safeName}" 
               style="object-position: ${dest.focalPoint || 'center 40%'};"
               data-fallback="${fallbackThumb}"
               data-name="${safeName}"
               data-category="${safeCategory}"
               loading="lazy" 
               decoding="async" 
               onerror="handleThumbError(this)">
        </div>
        <div class="destination-btn-meta">
          <span class="destination-btn-name">${dest.name}</span>
          <span class="destination-btn-region">${regionName}</span>
          <span class="destination-btn-tag">${dest.category || 'Travel'}</span>
        </div>
        <i class="fas fa-chevron-right destination-btn-arrow"></i>
      </button>
    `;
  }).join('');

  statusEl.textContent = `${startIdx + 1}-${Math.min(startIdx + pageItems.length, filteredDestinations.length)} of ${filteredDestinations.length}`;
  prevBtn.disabled = destinationListPage === 0;
  nextBtn.disabled = destinationListPage >= totalPages - 1;

  // Attach button click listeners
  container.querySelectorAll('.destination-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
      selectDestination(id);
      closeMobileSidebar();
    });
  });
}

// --- THEMATIC SVG FALLBACK GENERATOR ---
const CATEGORY_THEMES = {
  Culture: { start: '#4338ca', end: '#6366f1' },
  Mountain: { start: '#0369a1', end: '#0ea5e9' },
  Beach: { start: '#0f766e', end: '#14b8a6' },
  Nature: { start: '#047857', end: '#10b981' },
  Adventure: { start: '#b45309', end: '#f59e0b' }
};

function generateThematicSvgBadge(name, category) {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.Culture;
  const initials = (name || 'V').substring(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.start}"/>
        <stop offset="100%" stop-color="${theme.end}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#bg)"/>
    <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" fill="none"/>
    <text x="50" y="58" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="22" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${initials}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function generateSvgHeroBanner(name, category) {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.Culture;
  const safeName = (name || 'Velora Sanctuary').replace(/&/g, '&amp;');
  const safeCat = (category || 'Luxury Travel').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600">
    <defs>
      <linearGradient id="hero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.start}"/>
        <stop offset="100%" stop-color="${theme.end}"/>
      </linearGradient>
      <linearGradient id="vignette" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="rgba(15,23,42,0.85)"/>
        <stop offset="100%" stop-color="rgba(15,23,42,0.1)"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="600" fill="url(#hero-grad)"/>
    <path d="M0,450 C300,380 600,500 900,420 C1200,340 1400,480 1600,400 L1600,600 L0,600 Z" fill="rgba(255,255,255,0.06)"/>
    <path d="M0,500 C400,450 800,550 1200,480 C1400,450 1500,520 1600,490 L1600,600 L0,600 Z" fill="rgba(0,0,0,0.2)"/>
    <rect width="1600" height="600" fill="url(#vignette)"/>
    <text x="800" y="310" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="46" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">${safeName}</text>
    <text x="800" y="360" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="16" font-weight="600" fill="rgba(255,255,255,0.8)" text-anchor="middle" letter-spacing="3">${safeCat}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function handleThumbError(img) {
  const fallback = img.getAttribute('data-fallback');
  if (fallback && img.src !== fallback && !img.dataset.hasRetried) {
    img.dataset.hasRetried = 'true';
    img.src = fallback;
    return;
  }
  img.onerror = null;
  const name = img.getAttribute('data-name') || '';
  const category = img.getAttribute('data-category') || '';
  img.src = generateThematicSvgBadge(name, category);
}

function handleHeroImageError(img) {
  const fallback = img.getAttribute('data-fallback');
  if (fallback && img.src !== fallback && !img.dataset.hasRetried) {
    img.dataset.hasRetried = 'true';
    img.src = fallback;
    return;
  }
  img.onerror = null;
  const name = img.getAttribute('data-name') || '';
  const category = img.getAttribute('data-category') || '';
  img.src = generateSvgHeroBanner(name, category);
}

function selectDestination(id) {
  currentDestinationId = id;
  currentHotelPage = 0;
  currentAttractionPage = 0;

  // Update sidebar active states
  document.querySelectorAll('.destination-btn').forEach(btn => {
    const btnId = parseInt(btn.getAttribute('data-id'), 10);
    btn.classList.toggle('active', btnId === id);
  });

  const destData = veloraStore.destinationMap.get(id);
  if (destData) {
    renderDashboard(destData);
  }
}

// --- 5. MAIN DASHBOARD RENDERING ---
function renderDashboard(dest) {
  document.title = `${dest.name} - Velora Luxury Travel`;
  document.getElementById('header-destination-name').textContent = `${dest.name}, ${dest.country}`;

  // 1. HERO BANNER WITH FOCAL POINT FRAMING
  const heroContainer = document.getElementById('destination-hero');
  const focal = dest.focalPoint || 'center 40%';

  heroContainer.innerHTML = `
    <div class="hero-banner" style="--hero-focal: ${focal};">
      <div class="hero-bg-media">
        <img class="hero-bg-img" 
             src="${dest.image}" 
             data-fallback="${dest.fallbackImage || ''}"
             data-name="${escapeHtml(dest.name)}"
             data-category="${escapeHtml(dest.category || 'Travel')}"
             alt="${dest.famousPlace || dest.name}" 
             loading="eager" 
             decoding="async" 
             onerror="handleHeroImageError(this)">
      </div>
      <div class="hero-scrim"></div>
      
      <div class="hero-photo-credit">
        <div class="photo-credit-pill">
          <i class="fas fa-camera"></i>
          <span>${dest.famousPlace || dest.name}</span>
        </div>
      </div>

      <div class="hero-content">
        <div class="hero-badge-row">
          <span class="badge"><i class="fas fa-tag"></i> ${dest.category || 'Travel'}</span>
          <span class="badge badge-country"><i class="fas fa-map-pin"></i> ${dest.country}</span>
          ${dest.luxuryLevel ? `<span class="badge badge-focal"><i class="fas fa-crown"></i> ${dest.luxuryLevel.toUpperCase()}</span>` : ''}
        </div>

        <h1 class="hero-title">${dest.name}</h1>
        <h3 class="hero-subtitle">${dest.famousPlace || 'Historic Landmark & Natural Marvel'}</h3>
        <p class="hero-desc">${dest.description}</p>

        <div class="hero-meta-grid">
          ${dest.terrain ? `<div class="meta-pill"><i class="fas fa-layer-group"></i> <strong>Terrain:</strong> ${dest.terrain}</div>` : ''}
          ${dest.climate ? `<div class="meta-pill"><i class="fas fa-cloud-sun"></i> <strong>Climate:</strong> ${dest.climate}</div>` : ''}
          ${(dest.famousActivities || []).slice(0, 3).map(act => `<div class="meta-pill"><i class="fas fa-star"></i> ${act}</div>`).join('')}
        </div>

        <div class="hero-actions-row">
          <button type="button" class="distance-action-btn hero-fav-btn" id="hero-fav-btn" onclick="toggleBucketItem('destination', ${dest.id})">
            <i class="fas fa-heart"></i> Save to Bucket List
          </button>
          <button type="button" class="distance-action-btn hero-share-btn" onclick="shareCurrentDestination()" title="Copy Shareable Link">
            <i class="fas fa-share-alt"></i> Share
          </button>
          <button type="button" class="distance-action-btn hero-sound-btn" id="hero-sound-btn" onclick="toggleAmbientSound()" title="Play Tranquil Nature Ambience">
            <i class="fas fa-volume-up"></i> Nature Ambience
          </button>
          <button type="button" class="distance-action-btn hero-satellite-btn" onclick="document.getElementById('destination-map-section').scrollIntoView({ behavior: 'smooth' })">
            <i class="fas fa-satellite"></i> Satellite Map
          </button>
          <button type="button" class="distance-action-btn" id="distance-calc-btn">
            <i class="fas fa-location-arrow"></i> Distance from Me
          </button>
          <span id="distance-result-text" class="distance-status" role="status"></span>
        </div>

        <!-- SEASONAL GUIDE STRIP -->
        <div class="seasonal-guide-strip">
          <div class="seasonal-pill"><i class="fas fa-calendar-check"></i> <span>Best Season:</span> <strong>${getBestSeason(dest)}</strong></div>
          <div class="seasonal-pill"><i class="fas fa-temperature-high"></i> <span>Avg Temp:</span> <strong>${getAvgTemp(dest)}</strong></div>
          <div class="seasonal-pill"><i class="fas fa-suitcase"></i> <span>Packing:</span> <strong>${getPackingTip(dest)}</strong></div>
        </div>
      </div>
    </div>
  `;

  // Attach distance calculator
  setupDistanceCalculator(dest);

  // 2. RENDER HOTELS
  renderHotels(dest.id);

  // 3. RENDER ATTRACTIONS
  renderAttractions(dest.id);

  // 4. RENDER DINING
  renderRestaurants(dest.id);

  // 5. RENDER INTERACTIVE SATELLITE MAP
  renderMainDestinationMap(dest.id);

  // 6. RENDER CURATED 3-DAY ITINERARY
  renderItinerary(dest);

  // 7. SYNC URL HASH & BUCKET LIST BUTTONS
  try { history.replaceState(null, '', '#dest=' + dest.id); } catch (e) {}
  updateHeartButtons();
  if (tourRouteActive) drawTourRoute();
}

function renderHotels(destId) {
  const hotels = veloraStore.hotelsByDestId.get(destId) || [];
  const container = document.getElementById('hotel-list');
  const indicator = document.getElementById('hotel-pagi-indicator');
  const prevBtn = document.getElementById('hotel-prev-btn');
  const nextBtn = document.getElementById('hotel-next-btn');

  const totalPages = Math.ceil(hotels.length / ITEMS_PER_PAGE);
  currentHotelPage = Math.max(0, Math.min(currentHotelPage, totalPages - 1));

  const start = currentHotelPage * ITEMS_PER_PAGE;
  const pageHotels = hotels.slice(start, start + ITEMS_PER_PAGE);

  container.innerHTML = pageHotels.map(hotel => `
    <li class="card" onclick="openHotelModal(${hotel.id})" tabindex="0" role="button" aria-label="View details for ${hotel.name}">
      <div class="card-top-row">
        <div>
          <h4 class="card-title">${hotel.name}</h4>
          <div class="card-meta-row" style="margin-top: 0.35rem;">
            <span class="rating-badge"><i class="fas fa-star"></i> ${hotel.rating}</span>
            <span class="meta-icon-item"><i class="fas fa-shield-alt"></i> Verified Stay</span>
          </div>
        </div>
        <div class="card-price-badge">
          <span class="card-price">${formatPrice(hotel.price_usd)}</span>
          <span class="card-price-unit">per night</span>
        </div>
        <button type="button" class="card-fav-action ${isItemInBucket('hotel', hotel.id) ? 'is-fav' : ''}" data-fav-type="hotel" data-fav-id="${hotel.id}" onclick="event.stopPropagation(); toggleBucketItem('hotel', ${hotel.id})" title="Save to Bucket List">
          <i class="fas fa-heart"></i>
        </button>
      </div>

      <div class="card-amenities-wrap">
        ${hotel.amenities.map(([label, icon]) => `
          <span class="amenity-chip"><i class="${icon}"></i> ${label}</span>
        `).join('')}
      </div>

      <div class="card-footer-action">
        <span class="card-address-snippet"><i class="fas fa-map-marker-alt"></i> ${hotel.address}</span>
        <span class="card-action-link">View Suites & Rates <i class="fas fa-arrow-right"></i></span>
      </div>
    </li>
  `).join('');

  indicator.textContent = `${currentHotelPage + 1} / ${Math.max(1, totalPages)}`;
  prevBtn.disabled = currentHotelPage === 0;
  nextBtn.disabled = currentHotelPage >= totalPages - 1;
}

function renderAttractions(destId) {
  const attractions = veloraStore.attractionsByDestId.get(destId) || [];
  const container = document.getElementById('attraction-list');
  const indicator = document.getElementById('attraction-pagi-indicator');
  const prevBtn = document.getElementById('attraction-prev-btn');
  const nextBtn = document.getElementById('attraction-next-btn');

  const totalPages = Math.ceil(attractions.length / ITEMS_PER_PAGE);
  currentAttractionPage = Math.max(0, Math.min(currentAttractionPage, totalPages - 1));

  const start = currentAttractionPage * ITEMS_PER_PAGE;
  const pageAttractions = attractions.slice(start, start + ITEMS_PER_PAGE);

  container.innerHTML = pageAttractions.map(attr => `
    <li class="card attraction-card" onclick="openAttractionModal(${attr.id})" tabindex="0" role="button" aria-label="View attraction ${attr.name}">
      <div class="card-top-row">
        <div>
          <h4 class="card-title">${attr.name}</h4>
          <div class="card-meta-row" style="margin-top: 0.35rem;">
            <span class="meta-icon-item"><i class="fas fa-tag"></i> ${attr.category}</span>
            <span class="meta-icon-item"><i class="fas fa-clock"></i> ~${attr.duration_hours} hrs</span>
          </div>
        </div>
        <div class="card-price-badge">
          <span class="card-price ${attr.entry_fee_usd === 0 ? 'free' : ''}">
            ${attr.entry_fee_usd === 0 ? 'Free Entry' : formatPrice(attr.entry_fee_usd)}
          </span>
          <span class="card-price-unit">${attr.entry_fee_usd === 0 ? 'Open to public' : 'Admission'}</span>
        </div>
        <button type="button" class="card-fav-action ${isItemInBucket('attraction', attr.id) ? 'is-fav' : ''}" data-fav-type="attraction" data-fav-id="${attr.id}" onclick="event.stopPropagation(); toggleBucketItem('attraction', ${attr.id})" title="Save to Bucket List">
          <i class="fas fa-heart"></i>
        </button>
      </div>

      <div class="card-amenities-wrap">
        <span class="amenity-chip"><i class="fas fa-camera"></i> Photography Spot</span>
        <span class="amenity-chip"><i class="fas fa-compass"></i> Guided Tours</span>
        <span class="amenity-chip"><i class="fas fa-walking"></i> Foot Trail</span>
      </div>

      <div class="card-footer-action">
        <span class="card-address-snippet"><i class="fas fa-location-dot"></i> Coordinates: ${attr.lat.toFixed(3)}°, ${attr.lng.toFixed(3)}°</span>
        <span class="card-action-link">Explore On Map <i class="fas fa-map-marked-alt"></i></span>
      </div>
    </li>
  `).join('');

  indicator.textContent = `${currentAttractionPage + 1} / ${Math.max(1, totalPages)}`;
  prevBtn.disabled = currentAttractionPage === 0;
  nextBtn.disabled = currentAttractionPage >= totalPages - 1;
}

function renderRestaurants(destId) {
  const restaurants = veloraStore.restaurantsByDestId.get(destId) || [];
  const container = document.getElementById('restaurant-list');

  container.innerHTML = restaurants.map(rest => `
    <li class="dining-card">
      <div class="dining-card-header">
        <div>
          <h4 class="dining-name">${rest.name}</h4>
          <span class="dining-cuisine-tag">${rest.cuisine}</span>
        </div>
        <span class="rating-badge"><i class="fas fa-star"></i> ${rest.rating}</span>
      </div>

      <div class="dining-features-list">
        ${rest.features.map(f => `<span class="feature-pill"><i class="fas fa-check"></i> ${f}</span>`).join('')}
      </div>

      <div class="dining-price-est">
        <i class="fas fa-wallet"></i>
        <span>Approx. <strong>$${rest.price_usd}</strong> per person</span>
      </div>
    </li>
  `).join('');
}

function renderEmptyState() {
  const hero = document.getElementById('destination-hero');
  hero.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 3rem; text-align: center; border: 1px solid var(--border-subtle);">
      <i class="fas fa-compass" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
      <h2>No Destinations Found</h2>
      <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search criteria or resetting filters.</p>
      <button onclick="resetAllFilters()" style="margin-top: 1.5rem; background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer;">Reset All Filters</button>
    </div>
  `;
  document.getElementById('hotel-list').innerHTML = '';
  document.getElementById('attraction-list').innerHTML = '';
  document.getElementById('restaurant-list').innerHTML = '';
}

// --- 6. DISTANCE CALCULATOR & GEOLOCATION ---
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function setupDistanceCalculator(dest) {
  const btn = document.getElementById('distance-calc-btn');
  const resultText = document.getElementById('distance-result-text');
  if (!btn || !resultText) return;

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      resultText.textContent = 'Geolocation is not supported by your browser.';
      return;
    }

    resultText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating your position...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const distKm = calculateHaversineKm(userLat, userLng, dest.lat, dest.lng);
        const distMiles = distKm * 0.621371;

        resultText.innerHTML = `
          <strong>${Math.round(distKm).toLocaleString()} km</strong> (${Math.round(distMiles).toLocaleString()} miles) away · 
          <a href="https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${dest.lat},${dest.lng}" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-directions"></i> Get Turn-by-Turn Route
          </a>
        `;
      },
      (err) => {
        resultText.textContent = 'Location permission denied or unavailable.';
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

// --- 7. DETAIL MODAL & DUAL ENGINE MAPS ---
let currentActiveItem = null;

function openHotelModal(hotelId) {
  let targetHotel = null;
  for (const hotels of veloraStore.hotelsByDestId.values()) {
    targetHotel = hotels.find(h => h.id === hotelId);
    if (targetHotel) break;
  }
  if (!targetHotel) return;

  const dest = veloraStore.destinationMap.get(targetHotel.dest_id);
  const rooms = veloraStore.roomsByHotelId.get(hotelId) || [];
  const restaurants = veloraStore.restaurantsByDestId.get(targetHotel.dest_id) || [];

  currentActiveItem = { type: 'hotel', item: targetHotel, dest };

  // Fill modal headers
  document.getElementById('detail-title').textContent = targetHotel.name;
  document.getElementById('detail-category').textContent = `${dest.country} · Luxury Hotel`;
  document.getElementById('detail-rating').innerHTML = `
    <span class="rating-badge"><i class="fas fa-star"></i> ${targetHotel.rating} / 5.0</span>
    <span style="color: rgba(255,255,255,0.85); font-size: 0.88rem;">Starting at $${targetHotel.price_usd}/night</span>
  `;

  document.getElementById('detail-description').textContent =
    `${targetHotel.name} offers signature luxury accommodations in ${dest.name}, ${dest.country}. Guests enjoy proximity to ${dest.famousPlace}, world-class wellness facilities, and authentic regional hospitality.`;

  // Overview Info Grid
  document.getElementById('detail-info-grid').innerHTML = `
    <div class="detail-info-card">
      <span class="detail-info-card-label">Nightly Rate</span>
      <span class="detail-info-card-val">$${targetHotel.price_usd}</span>
    </div>
    <div class="detail-info-card">
      <span class="detail-info-card-label">Star Rating</span>
      <span class="detail-info-card-val">${targetHotel.rating} ⭐</span>
    </div>
    <div class="detail-info-card">
      <span class="detail-info-card-label">Destination</span>
      <span class="detail-info-card-val">${dest.name}</span>
    </div>
    <div class="detail-info-card">
      <span class="detail-info-card-label">Suites Available</span>
      <span class="detail-info-card-val">${rooms.length} Tiers</span>
    </div>
  `;

  // Extra highlights
  document.getElementById('detail-extra-highlights').innerHTML = `
    <h4 class="detail-extra-title"><i class="fas fa-concierge-bell"></i> Property Amenities & Privileges</h4>
    <div class="highlights-pill-wrap">
      ${targetHotel.amenities.map(([a, icon]) => `<span class="highlight-item-chip"><i class="${icon}"></i> ${a}</span>`).join('')}
    </div>
  `;

  // Map & Location tab setup
  setupModalMap(targetHotel.lat, targetHotel.lng, targetHotel.name, `${dest.name}, ${dest.country}`, 'hotel', dest.id);

  // Rooms Tab
  document.getElementById('rooms-list').innerHTML = rooms.map(room => `
    <div class="room-card-unit">
      <div class="room-unit-header">
        <h4 class="room-unit-type">${room.type}</h4>
        <span class="room-unit-capacity"><i class="fas fa-user-friends"></i> ${room.capacity}</span>
      </div>
      <div class="room-unit-body">
        <div class="room-unit-price-box">
          <span style="font-size: 0.82rem; color: var(--text-muted);">Rate per night</span>
          <span class="room-unit-price-val">$${room.price_usd}</span>
        </div>
        <div class="room-unit-amenities-list">
          ${room.amenities.map(a => `<div class="room-unit-amenity-row"><i class="fas fa-check-circle"></i> <span>${a}</span></div>`).join('')}
        </div>
        <button class="room-book-action-btn" type="button" onclick="triggerBooking('${targetHotel.name}', '${room.type}', ${room.price_usd})">
          Reserve Suite Instantly
        </button>
      </div>
    </div>
  `).join('');

  // Nearby Restaurants Tab
  document.getElementById('nearby-restaurants').innerHTML = restaurants.map(rest => `
    <div class="dining-card">
      <div class="dining-card-header">
        <div>
          <h4 class="dining-name">${rest.name}</h4>
          <span class="dining-cuisine-tag">${rest.cuisine}</span>
        </div>
        <span class="rating-badge"><i class="fas fa-star"></i> ${rest.rating}</span>
      </div>
      <div class="dining-features-list">
        ${rest.features.map(f => `<span class="feature-pill"><i class="fas fa-check"></i> ${f}</span>`).join('')}
      </div>
      <div class="dining-price-est">
        <span>Estimated ~<strong>$${rest.price_usd}</strong> per guest</span>
      </div>
    </div>
  `).join('');

  switchModalTab('overview');
  document.getElementById('detail-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openAttractionModal(attrId) {
  let targetAttr = null;
  for (const attrs of veloraStore.attractionsByDestId.values()) {
    targetAttr = attrs.find(a => a.id === attrId);
    if (targetAttr) break;
  }
  if (!targetAttr) return;

  const dest = veloraStore.destinationMap.get(targetAttr.dest_id);
  currentActiveItem = { type: 'attraction', item: targetAttr, dest };

  document.getElementById('detail-title').textContent = targetAttr.name;
  document.getElementById('detail-category').textContent = `${dest.country} · ${targetAttr.category}`;
  document.getElementById('detail-rating').innerHTML = `
    <span class="rating-badge"><i class="fas fa-ticket-alt"></i> ${targetAttr.entry_fee_usd === 0 ? 'Free Admission' : '$' + targetAttr.entry_fee_usd}</span>
    <span style="color: rgba(255,255,255,0.85); font-size: 0.88rem;">Recommended Duration: ~${targetAttr.duration_hours} hours</span>
  `;

  document.getElementById('detail-description').textContent =
    `Discover ${targetAttr.name}, an iconic highlight of ${dest.name}, ${dest.country}. Revered for its breathtaking views, historical significance, and authentic connection to ${dest.terrain}.`;

  document.getElementById('detail-info-grid').innerHTML = `
    <div class="detail-info-card">
      <span class="detail-info-card-label">Admission Fee</span>
      <span class="detail-info-card-val">${targetAttr.entry_fee_usd === 0 ? 'Free' : '$' + targetAttr.entry_fee_usd}</span>
    </div>
    <div class="detail-info-card">
      <span class="detail-info-card-label">Duration</span>
      <span class="detail-info-card-val">${targetAttr.duration_hours} hrs</span>
    </div>
    <div class="detail-info-card">
      <span class="detail-info-card-label">Category</span>
      <span class="detail-info-card-val">${targetAttr.category}</span>
    </div>
    <div class="detail-info-card">
      <span class="detail-info-card-label">Coordinates</span>
      <span class="detail-info-card-val" style="font-size: 0.95rem;">${targetAttr.lat.toFixed(2)}°, ${targetAttr.lng.toFixed(2)}°</span>
    </div>
  `;

  document.getElementById('detail-extra-highlights').innerHTML = `
    <h4 class="detail-extra-title"><i class="fas fa-hiking"></i> Landmark Activities</h4>
    <div class="highlights-pill-wrap">
      <span class="highlight-item-chip"><i class="fas fa-camera"></i> Panoramic Photography</span>
      <span class="highlight-item-chip"><i class="fas fa-walking"></i> Guided Heritage Walk</span>
      <span class="highlight-item-chip"><i class="fas fa-sun"></i> Golden Hour Sunset Watch</span>
      <span class="highlight-item-chip"><i class="fas fa-leaf"></i> Eco-Preservation Zone</span>
    </div>
  `;

  setupModalMap(targetAttr.lat, targetAttr.lng, targetAttr.name, `${dest.name}, ${dest.country}`, 'attraction', dest.id);

  document.getElementById('rooms-list').innerHTML = `
    <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted);">
      <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--primary);"></i>
      <p>This is a sightseeing landmark. For accommodations, please browse the Available Hotels section on the dashboard.</p>
    </div>
  `;

  const restaurants = veloraStore.restaurantsByDestId.get(targetAttr.dest_id) || [];
  document.getElementById('nearby-restaurants').innerHTML = restaurants.map(rest => `
    <div class="dining-card">
      <div class="dining-card-header">
        <div>
          <h4 class="dining-name">${rest.name}</h4>
          <span class="dining-cuisine-tag">${rest.cuisine}</span>
        </div>
        <span class="rating-badge"><i class="fas fa-star"></i> ${rest.rating}</span>
      </div>
      <div class="dining-features-list">
        ${rest.features.map(f => `<span class="feature-pill"><i class="fas fa-check"></i> ${f}</span>`).join('')}
      </div>
    </div>
  `).join('');

  switchModalTab('overview');
  document.getElementById('detail-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('active');
  document.body.style.overflow = 'auto';
  currentActiveItem = null;
}

function switchModalTab(tabKey) {
  document.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
    btn.setAttribute('aria-selected', btn.getAttribute('data-tab') === tabKey ? 'true' : 'false');
  });

  document.querySelectorAll('.detail-tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabKey}`);
  });

  // Resize Leaflet or Google Map when switching to map tab
  if (tabKey === 'map') {
    setTimeout(() => {
      if (leafletMapInstance) {
        leafletMapInstance.invalidateSize();
      }
      if (googleMapInstance && typeof google !== 'undefined') {
        google.maps.event.trigger(googleMapInstance, 'resize');
      }
    }, 150);
  }
}


// ==========================================================================
// VELORA HIGH-RESOLUTION MAP ENGINE (Leaflet + Google Satellite & Layers)
// Free, Zero-API-Key, Instant Orbit & Terrain Imagery with Top-Right Switcher
// ==========================================================================

let mainMapInstance = null;
let mainMapMarkerGroup = null;
let currentMapFilter = 'all'; // 'all' | 'hotels' | 'attractions'
let currentMapDestinationId = null;

function createVeloraTileLayers() {
  const googleSatellite = L.tileLayer(
    'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps Satellite'
    }
  );

  const googleHybrid = L.tileLayer(
    'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps Hybrid'
    }
  );

  const googleStreets = L.tileLayer(
    'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps Streets'
    }
  );

  const cartoVoyager = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap, &copy; CARTO'
    }
  );

  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }
  );

  return {
    baseMaps: {
      '🛰️ Google Satellite': googleSatellite,
      '🏷️ Google Hybrid (Satellite + Labels)': googleHybrid,
      '🗺️ Google Streets': googleStreets,
      '🎨 CartoDB Clean': cartoVoyager,
      '🌐 OpenStreetMap': osm
    },
    defaultLayer: googleSatellite
  };
}

// --- RENDER MAIN DESTINATION INTERACTIVE MAP ---
function renderMainDestinationMap(destId, fitBoundsImmediately = true) {
  const mapElement = document.getElementById('main-interactive-map');
  if (!mapElement || typeof L === 'undefined') return;

  const dest = veloraStore.destinationMap.get(destId);
  if (!dest) return;

  currentMapDestinationId = destId;

  const hotels = veloraStore.hotelsByDestId.get(destId) || [];
  const attractions = veloraStore.attractionsByDestId.get(destId) || [];

  // Update Section Header and Counters
  const titleEl = document.getElementById('destination-map-title');
  if (titleEl) titleEl.textContent = `Interactive Satellite Map: ${dest.name}`;
  const subEl = document.getElementById('destination-map-subtitle');
  if (subEl) subEl.textContent = `Satellite overview of ${dest.famousPlace || dest.name}, ${dest.country} — ${hotels.length} luxury stays & ${attractions.length} landmarks plotted`;

  const countAll = document.getElementById('map-count-all');
  if (countAll) countAll.textContent = 1 + hotels.length + attractions.length;
  const countHotels = document.getElementById('map-count-hotels');
  if (countHotels) countHotels.textContent = hotels.length;
  const countAttr = document.getElementById('map-count-attractions');
  if (countAttr) countAttr.textContent = attractions.length;



  // Initialize Map if not already created
  if (!mainMapInstance) {
    const layers = createVeloraTileLayers();
    mainMapInstance = L.map(mapElement, {
      center: [dest.lat, dest.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: true
    });

    // Default is Google Satellite!
    layers.defaultLayer.addTo(mainMapInstance);

    // Layer switcher on top-right (Google Satellite, Hybrid, Streets, Carto, OSM)
    L.control.layers(layers.baseMaps, null, { position: 'topright' }).addTo(mainMapInstance);

    mainMapMarkerGroup = L.layerGroup().addTo(mainMapInstance);
  } else {
    mainMapMarkerGroup.clearLayers();
  }

  const allLatLngs = [];

  // 1. Plot Destination Center Landmark
  if (currentMapFilter === 'all' || currentMapFilter === 'attractions') {
    const destIcon = L.divIcon({
      className: 'velora-map-marker marker-dest',
      html: `
        <div class="marker-pin pin-dest">
          <i class="fas fa-compass"></i>
          <span class="marker-pulse"></span>
        </div>
        <div class="marker-tag tag-dest">${escapeHtml(dest.name)}</div>
      `,
      iconSize: [40, 44],
      iconAnchor: [20, 40],
      popupAnchor: [0, -42]
    });

    const destPopupHtml = `
      <div class="velora-minimal-popup">
        <div class="popup-info-block">
          <div class="popup-place-name"><i class="fas fa-compass" style="color: #d97706; margin-right: 4px;"></i>${escapeHtml(dest.name)}</div>
          <div class="popup-place-sub">${escapeHtml(dest.famousPlace || dest.name)}, ${escapeHtml(dest.country)}</div>
        </div>
        <a class="popup-directions-btn" href="https://www.google.com/maps/search/?api=1&query=${dest.lat},${dest.lng}" target="_blank" rel="noopener noreferrer" title="Get Directions in Google Maps">
          <i class="fas fa-diamond-turn-right"></i>
          <span>Directions</span>
        </a>
      </div>
    `;

    const destMarker = L.marker([dest.lat, dest.lng], { icon: destIcon })
      .bindPopup(destPopupHtml, {
        className: 'velora-minimal-popup-wrap',
        minWidth: 210,
        maxWidth: 320,
        autoPan: true,
        autoPanPadding: [25, 25],
        offset: [0, -4]
      });
    mainMapMarkerGroup.addLayer(destMarker);
    allLatLngs.push([dest.lat, dest.lng]);
  }

  // 2. Plot Hotels
  if (currentMapFilter === 'all' || currentMapFilter === 'hotels') {
    hotels.forEach(hotel => {
      const hotelIcon = L.divIcon({
        className: 'velora-map-marker marker-hotel',
        html: `
          <div class="marker-pin pin-hotel">
            <i class="fas fa-hotel"></i>
          </div>
          <div class="marker-tag tag-hotel">$${hotel.price_usd}</div>
        `,
        iconSize: [36, 40],
        iconAnchor: [18, 38],
        popupAnchor: [0, -40]
      });

      const hotelPopupHtml = `
        <div class="velora-minimal-popup">
          <div class="popup-info-block">
            <div class="popup-place-name"><i class="fas fa-hotel" style="color: #4f46e5; margin-right: 4px;"></i>${escapeHtml(hotel.name)}</div>
            <div class="popup-place-sub">⭐ ${hotel.rating} · $${hotel.price_usd}/night</div>
          </div>
          <div class="popup-actions-block">
            <button type="button" class="popup-view-btn" onclick="openHotelModal(${hotel.id})" title="View Rooms">
              View
            </button>
            <a class="popup-directions-btn" href="https://www.google.com/maps/dir/?api=1&destination=${hotel.lat},${hotel.lng}" target="_blank" rel="noopener noreferrer" title="Get Directions in Google Maps">
              <i class="fas fa-diamond-turn-right"></i>
            </a>
          </div>
        </div>
      `;

      const hotelMarker = L.marker([hotel.lat, hotel.lng], { icon: hotelIcon })
        .bindPopup(hotelPopupHtml, {
          className: 'velora-minimal-popup-wrap',
          minWidth: 220,
          maxWidth: 320,
          autoPan: true,
          autoPanPadding: [25, 25],
          offset: [0, -4]
        });
      mainMapMarkerGroup.addLayer(hotelMarker);
      allLatLngs.push([hotel.lat, hotel.lng]);
    });
  }

  // 3. Plot Attractions
  if (currentMapFilter === 'all' || currentMapFilter === 'attractions') {
    attractions.forEach(attr => {
      const attrIcon = L.divIcon({
        className: 'velora-map-marker marker-attr',
        html: `
          <div class="marker-pin pin-attr">
            <i class="fas fa-camera-retro"></i>
          </div>
          <div class="marker-tag tag-attr">${escapeHtml(attr.name.length > 18 ? attr.name.slice(0, 16) + '..' : attr.name)}</div>
        `,
        iconSize: [36, 40],
        iconAnchor: [18, 38],
        popupAnchor: [0, -40]
      });

      const attrPopupHtml = `
        <div class="velora-minimal-popup">
          <div class="popup-info-block">
            <div class="popup-place-name"><i class="fas fa-camera-retro" style="color: #059669; margin-right: 4px;"></i>${escapeHtml(attr.name)}</div>
            <div class="popup-place-sub">${escapeHtml(attr.category)} · ${attr.entry_fee_usd === 0 ? 'Free' : '$' + attr.entry_fee_usd}</div>
          </div>
          <div class="popup-actions-block">
            <button type="button" class="popup-view-btn" onclick="openAttractionModal(${attr.id})" title="View Details">
              View
            </button>
            <a class="popup-directions-btn" href="https://www.google.com/maps/dir/?api=1&destination=${attr.lat},${attr.lng}" target="_blank" rel="noopener noreferrer" title="Get Directions in Google Maps">
              <i class="fas fa-diamond-turn-right"></i>
            </a>
          </div>
        </div>
      `;

      const attrMarker = L.marker([attr.lat, attr.lng], { icon: attrIcon })
        .bindPopup(attrPopupHtml, {
          className: 'velora-minimal-popup-wrap',
          minWidth: 220,
          maxWidth: 320,
          autoPan: true,
          autoPanPadding: [25, 25],
          offset: [0, -4]
        });
      mainMapMarkerGroup.addLayer(attrMarker);
      allLatLngs.push([attr.lat, attr.lng]);
    });
  }

  // Fit bounds to show all destination pins
  if (allLatLngs.length > 0 && fitBoundsImmediately) {
    const bounds = L.latLngBounds(allLatLngs);
    mainMapInstance.fitBounds(bounds.pad(0.32), { maxZoom: 15, animate: true, duration: 0.8 });
  }

  setTimeout(() => {
    if (mainMapInstance) mainMapInstance.invalidateSize();
  }, 150);
}

// --- SETUP MAP TOOLBAR LISTENERS ---
function setupMapToolbar() {
  const filterGroup = document.getElementById('map-filter-group');
  if (filterGroup) {
    filterGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.map-chip-btn');
      if (!btn) return;
      const filter = btn.getAttribute('data-map-filter');
      if (!filter) return;
      currentMapFilter = filter;
      filterGroup.querySelectorAll('.map-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (currentDestinationId) {
        renderMainDestinationMap(currentDestinationId, false);
      }
    });
  }

  const recenterBtn = document.getElementById('map-recenter-btn');
  if (recenterBtn) {
    recenterBtn.addEventListener('click', () => {
      if (currentDestinationId && mainMapInstance) {
        const dest = veloraStore.destinationMap.get(currentDestinationId);
        if (dest) {
          mainMapInstance.flyTo([dest.lat, dest.lng], 14, { duration: 1.0 });
        }
      }
    });
  }

  // Tour route toggle
  const routeBtn = document.getElementById('map-route-btn');
  if (routeBtn) {
    routeBtn.addEventListener('click', toggleTourRoute);
  }

  const closeHudBtn = document.getElementById('close-route-hud');
  if (closeHudBtn) {
    closeHudBtn.addEventListener('click', toggleTourRoute);
  }

  // Fullscreen map toggle
  const fullscreenBtn = document.getElementById('map-fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleMapFullscreen);
  }
}

// --- MODAL MAP INITIALIZER (Leaflet + Google Satellite & Top-Right Control) ---
function setupModalMap(lat, lng, title, locationText, entityType = 'hotel', destId = null) {
  const mapElement = document.getElementById('detail-map');
  const coordBadge = document.getElementById('map-coordinates-text');
  const extBtn = document.getElementById('open-external-maps-btn');
  const locationInfo = document.getElementById('detail-location-info');

  coordBadge.textContent = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
  extBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  locationInfo.innerHTML = `
    <div class="location-info-card">
      <h4><i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> Location & Address</h4>
      <p><strong>${title}</strong></p>
      <p>${locationText}</p>
      <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem;">Global Coordinates: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°</p>
    </div>
    <div class="location-info-card">
      <h4><i class="fas fa-satellite" style="color: var(--secondary);"></i> Satellite Navigation</h4>
      <p>High-resolution Google Satellite view with layer switching on the top-right. Click pins to explore.</p>
      <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem;">GPS route navigation available directly in Google Maps.</p>
    </div>
  `;

  if (typeof L !== 'undefined') {
    if (leafletMapInstance) {
      leafletMapInstance.remove();
      leafletMapInstance = null;
    }

    mapElement.innerHTML = '';
    const layers = createVeloraTileLayers();
    leafletMapInstance = L.map(mapElement, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: true
    });

    // Default layer is Google Satellite!
    layers.defaultLayer.addTo(leafletMapInstance);

    // Layer switcher on top-right:
    L.control.layers(layers.baseMaps, null, { position: 'topright' }).addTo(leafletMapInstance);

    const isHotel = entityType === 'hotel';
    const focusIcon = L.divIcon({
      className: `velora-map-marker ${isHotel ? 'marker-hotel' : 'marker-attr'}`,
      html: `
        <div class="marker-pin ${isHotel ? 'pin-hotel' : 'pin-attr'}">
          <i class="${isHotel ? 'fas fa-hotel' : 'fas fa-camera-retro'}"></i>
          <span class="marker-pulse"></span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -42]
    });

    const modalPopupHtml = `
      <div class="velora-minimal-popup">
        <div class="popup-info-block">
          <div class="popup-place-name">
            <i class="${isHotel ? 'fas fa-hotel' : 'fas fa-camera-retro'}" style="color: ${isHotel ? '#4f46e5' : '#059669'}; margin-right: 4px;"></i>
            ${escapeHtml(title)}
          </div>
          <div class="popup-place-sub">
            <i class="fas fa-map-marker-alt" style="font-size: 10px; margin-right: 3px; color: #64748b;"></i>
            ${escapeHtml(locationText)}
          </div>
        </div>
        <a class="popup-directions-btn" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" title="Get Directions in Google Maps">
          <i class="fas fa-diamond-turn-right"></i>
          <span>Directions</span>
        </a>
      </div>
    `;

    L.marker([lat, lng], { icon: focusIcon })
      .addTo(leafletMapInstance)
      .bindPopup(modalPopupHtml, {
        className: 'velora-minimal-popup-wrap',
        minWidth: 210,
        maxWidth: 340,
        autoPan: true,
        autoPanPadding: [25, 25],
        offset: [0, -2]
      })
      .openPopup();

    // Contextual secondary markers from same destination
    if (destId) {
      const dest = veloraStore.destinationMap.get(destId);
      if (dest && (Math.abs(dest.lat - lat) > 0.0001 || Math.abs(dest.lng - lng) > 0.0001)) {
        const destIcon = L.divIcon({
          className: 'velora-map-marker marker-dest marker-subdued',
          html: `<div class="marker-pin pin-dest" style="width:30px;height:30px;font-size:12px;"><i class="fas fa-compass"></i></div><div class="marker-tag tag-dest">${escapeHtml(dest.name)}</div>`,
          iconSize: [30, 34],
          iconAnchor: [15, 30],
          popupAnchor: [0, -32]
        });
        L.marker([dest.lat, dest.lng], { icon: destIcon })
          .addTo(leafletMapInstance)
          .bindPopup(`
            <div class="velora-minimal-popup">
              <div class="popup-info-block">
                <div class="popup-place-name"><i class="fas fa-compass" style="color:#d97706; margin-right:4px;"></i>${escapeHtml(dest.name)} Center</div>
                <div class="popup-place-sub">${escapeHtml(dest.famousPlace || dest.name)}</div>
              </div>
            </div>
          `, { className: 'velora-minimal-popup-wrap', minWidth: 160, offset: [0, -2] });
      }
    }

    setTimeout(() => {
      if (leafletMapInstance) leafletMapInstance.invalidateSize();
    }, 150);
  }
}


// --- 8. BOOKING TOAST SIMULATOR ---
function triggerBooking(hotelName, roomType, price) {
  const toast = document.getElementById('toast-notification');
  const title = document.getElementById('toast-title');
  const msg = document.getElementById('toast-message');

  title.textContent = `Reservation Confirmed!`;
  msg.textContent = `${roomType} at ${hotelName} ($${price}/night). Check your email for confirmation voucher.`;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

// --- 9. EVENT LISTENERS & SETUP ---
function setupMobileMenu() {
  const toggleBtn = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('close-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  });

  closeBtn.addEventListener('click', closeMobileSidebar);
  overlay.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('active');
  document.getElementById('sidebar-overlay').classList.remove('active');
}

function setupSearchAndFilters() {
  const searchInput = document.getElementById('destination-search');
  const clearSearchBtn = document.getElementById('clear-search');

  // Debounced search (150ms)
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      searchQuery = e.target.value;
      applyFilters();
    }, 150);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    applyFilters();
    searchInput.focus();
  });

  // Category Pills
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeFilters.category = e.currentTarget.getAttribute('data-category');
      applyFilters();
    });
  });

  // Select Dropdowns
  document.querySelectorAll('[data-filter]').forEach(select => {
    select.addEventListener('change', (e) => {
      const filterKey = e.currentTarget.getAttribute('data-filter');
      activeFilters[filterKey] = e.currentTarget.value;
      applyFilters();
    });
  });

  // Reset Filters Link
  document.getElementById('clear-filters').addEventListener('click', resetAllFilters);
}

function resetAllFilters() {
  document.getElementById('destination-search').value = '';
  searchQuery = '';

  activeFilters.category = 'all';
  activeFilters.region = 'all';
  activeFilters.terrain = 'all';
  activeFilters.climate = 'all';

  document.querySelectorAll('.category-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-category') === 'all');
  });

  document.querySelectorAll('[data-filter]').forEach(select => {
    select.value = 'all';
  });

  applyFilters();
}

function populateFilterDropdowns() {
  const regions = [...new Set(veloraStore.destinations.map(d => d.region).filter(Boolean))].sort();
  const terrains = [...new Set(veloraStore.destinations.map(d => d.terrain?.split('/')[0].trim()).filter(Boolean))].sort();
  const climates = [...new Set(veloraStore.destinations.map(d => d.climate?.split('/')[0].trim()).filter(Boolean))].sort();

  const regionSelect = document.getElementById('region-filter');
  const terrainSelect = document.getElementById('terrain-filter');
  const climateSelect = document.getElementById('climate-filter');

  regionSelect.innerHTML = '<option value="all">All Regions</option>' +
    regions.map(r => `<option value="${r}">${r}</option>`).join('');

  terrainSelect.innerHTML = '<option value="all">Any Terrain</option>' +
    terrains.map(t => `<option value="${t}">${t}</option>`).join('');

  climateSelect.innerHTML = '<option value="all">Any Climate</option>' +
    climates.map(c => `<option value="${c}">${c}</option>`).join('');
}

function setupPaginationButtons() {
  // Sidebar list pagination
  document.getElementById('destination-list-prev').addEventListener('click', () => {
    if (destinationListPage > 0) {
      destinationListPage--;
      renderSidebarDestinations();
    }
  });

  document.getElementById('destination-list-next').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredDestinations.length / DESTINATIONS_PAGE_SIZE);
    if (destinationListPage < totalPages - 1) {
      destinationListPage++;
      renderSidebarDestinations();
    }
  });

  // Hotel mini pagination
  document.getElementById('hotel-prev-btn').addEventListener('click', () => {
    if (currentHotelPage > 0) {
      currentHotelPage--;
      renderHotels(currentDestinationId);
    }
  });

  document.getElementById('hotel-next-btn').addEventListener('click', () => {
    const hotels = veloraStore.hotelsByDestId.get(currentDestinationId) || [];
    const totalPages = Math.ceil(hotels.length / ITEMS_PER_PAGE);
    if (currentHotelPage < totalPages - 1) {
      currentHotelPage++;
      renderHotels(currentDestinationId);
    }
  });

  // Attraction mini pagination
  document.getElementById('attraction-prev-btn').addEventListener('click', () => {
    if (currentAttractionPage > 0) {
      currentAttractionPage--;
      renderAttractions(currentDestinationId);
    }
  });

  document.getElementById('attraction-next-btn').addEventListener('click', () => {
    const attractions = veloraStore.attractionsByDestId.get(currentDestinationId) || [];
    const totalPages = Math.ceil(attractions.length / ITEMS_PER_PAGE);
    if (currentAttractionPage < totalPages - 1) {
      currentAttractionPage++;
      renderAttractions(currentDestinationId);
    }
  });
}

function setupModalInteractions() {
  document.getElementById('detail-close').addEventListener('click', closeDetailModal);
  document.getElementById('detail-overlay').addEventListener('click', closeDetailModal);

  document.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      switchModalTab(tab);
    });
  });

  // Keyboard accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailModal();
      closeMobileSidebar();
    }
    // Pressing '/' shortcut to search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const searchBox = document.getElementById('destination-search');
      searchBox.focus();
      searchBox.select();
    }
  });
}

function updateQuickStats() {
  document.getElementById('total-destinations').textContent = veloraStore.destinations.length;
  let totalHotels = 0;
  veloraStore.hotelsByDestId.forEach(h => totalHotels += h.length);
  document.getElementById('total-hotels').textContent = `${totalHotels}+`;

  let totalAttractions = 0;
  veloraStore.attractionsByDestId.forEach(a => totalAttractions += a.length);
  document.getElementById('total-attractions').textContent = `${totalAttractions}+`;
}

// --- 10. APP INITIALIZATION ON DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
  enrichDestinations();
  populateFilterDropdowns();
  setupMobileMenu();
  setupSearchAndFilters();
  setupPaginationButtons();
  setupModalInteractions();
  setupMapToolbar();
  updateQuickStats();

  // Initialize Pro features
  initThemeEngine();
  updateBucketBadge();
  setupHashRouting();

  // Wire Currency Selector
  const currSelect = document.getElementById('currency-select');
  if (currSelect) {
    currSelect.value = currentCurrency;
    currSelect.addEventListener('change', (e) => setCurrency(e.target.value));
  }

  // Wire Bucket List Drawer
  const openBucketBtn = document.getElementById('open-bucket-list-btn');
  if (openBucketBtn) openBucketBtn.addEventListener('click', openBucketDrawer);

  const closeBucketBtn = document.getElementById('close-bucket-drawer-btn');
  if (closeBucketBtn) closeBucketBtn.addEventListener('click', closeBucketDrawer);

  const bucketOverlay = document.getElementById('bucket-drawer-overlay');
  if (bucketOverlay) bucketOverlay.addEventListener('click', closeBucketDrawer);

  const clearBucketBtnEl = document.getElementById('clear-bucket-btn');
  if (clearBucketBtnEl) clearBucketBtnEl.addEventListener('click', clearBucketList);

  const exportBucketBtnEl = document.getElementById('export-bucket-btn');
  if (exportBucketBtnEl) exportBucketBtnEl.addEventListener('click', exportBucketList);

  document.querySelectorAll('.bucket-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bucket-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBucketFilter = btn.getAttribute('data-bucket-filter');
      renderBucketDrawer();
    });
  });

  filteredDestinations = [...veloraStore.destinations];
  renderSidebarDestinations();

  // Load initial destination
  if (veloraStore.destinations.length > 0) {
    selectDestination(veloraStore.destinations[0].id);
  }
});


// Global bindings for inline handlers and map callbacks
if (typeof window !== 'undefined') {
  window.veloraStore = veloraStore;
  window.selectDestination = selectDestination;
  window.openHotelModal = openHotelModal;
  window.openAttractionModal = openAttractionModal;
  window.renderMainDestinationMap = renderMainDestinationMap;
  window.setupModalMap = setupModalMap;
}


if (typeof window !== 'undefined') {
  window.veloraStore = veloraStore;
  window.selectDestination = selectDestination;
  window.openHotelModal = openHotelModal;
  window.openAttractionModal = openAttractionModal;
  window.renderMainDestinationMap = renderMainDestinationMap;
  window.setupModalMap = setupModalMap;
  window.toggleBucketItem = toggleBucketItem;
  window.shareCurrentDestination = shareCurrentDestination;
  window.toggleAmbientSound = toggleAmbientSound;
  window.toggleTourRoute = toggleTourRoute;
  window.toggleMapFullscreen = toggleMapFullscreen;
  window.openBucketDrawer = openBucketDrawer;
  window.closeBucketDrawer = closeBucketDrawer;
  window.clearBucketList = clearBucketList;
  window.exportBucketList = exportBucketList;
  window.copyItineraryToClipboard = copyItineraryToClipboard;
  window.setCurrency = setCurrency;
}
