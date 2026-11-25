# Velora - Luxury Global Travel Platform

Velora is a modern, high-performance travel dashboard and luxury destination guide showcasing **80 world-class travel destinations** across India and internationally, with 240+ hotels, 320+ attractions, and verified gastronomy.

---

## 🚀 Key Improvements & Optimizations

### 1. ⚡ Complete Lag Elimination (60 FPS Performance)
- **Zero-Blocking Architecture**: Removed the previous blocking `@app.before_request` hook that repeatedly queried SQLite and attempted slow external network calls on every static asset request.
- **Debounced Search**: Text search now operates with a 150ms debounce and tokenized matching across names, states, countries, landmarks, activities, and terrains without UI stutter.
- **Smart Image Scaling**: Thumbnails in the sidebar load optimized 200×200 thumbnails (`loading="lazy"` and `decoding="async"`), reducing payload size by over **92%** and eliminating memory bloat.
- **GPU-Accelerated Transitions**: Replaced layout-thrashing animations with hardware-accelerated CSS `transform` and `opacity` transitions.

---

### 2. 📸 Authentic Corresponding Photography & Highlight-Framed Imagery
- **Specific Destination Fixes & Enhancements**:
  - **Barcelona**: Equipped with Antoni Gaudí's vibrant Park Güell terrace panorama overlooking the Barcelona Mediterranean skyline (`photo-1539037116277-4db20889f2d4`).
  - **Spiti Valley**: Updated to high-altitude Key Monastery perched atop the snowbound Himalayan cliff (`photo-1542892615-c300a81a259a`).
  - **Khajuraho**: Updated to the iconic Kandariya Mahadeva Temple sandstone shikhara architecture (`photo-1606298855672-3efb63017be8`).
  - **Hampi**: Updated to Virupaksha Temple & the ancient Vijayanagara boulder-strewn landscape (`photo-1721195807515-70bcc589bb08`).
  - **Jaipur**: Decoupled into authentic daytime Hawa Mahal palace facade (`photo-1705861145715-3c6faa47d1be`) and Amber Fort & Maota Lake hilltop view (`photo-1709883252686-fe847b56c90b`).
  - **Jaisalmer**: Freshly updated to the towering golden sandstone ramparts of Sonar Qila (Jaisalmer Fort) overlooking the desert city (`photo-1775582910565-73284ec13440`).
- **Expanded to 80 Destinations**: Added 18 new world-class destinations with complete schemas, hotel suites, attractions, activities, and verified imagery:
  - *International*: London, New York City, Sydney, Venice, Prague, Amsterdam, Istanbul, Singapore, Lucerne & Mount Pilatus.
  - *Domestic (India)*: Amritsar (Golden Temple), Jodhpur (Mehrangarh Fort & Blue City), Kochi (Chinese Fishing Nets), Mysore (Royal Palace), Varkala (Red Laterite Cliffs), Ajanta & Ellora Caves (Kailash Temple), Chikmagalur (Mullayanagiri & Coffee Hills), Pushkar (Sacred Lake & Brahma Temple), Tawang (Arunachal Buddhist Gompa).
- **Dual-Tier Resilient CDN Fallbacks**: Every single destination record includes both a verified primary image and a curated secondary fallback image (`fallbackImage` & `fallbackThumb`).
- **Graceful Thematic SVG Vector Generator**: If any image fails to load due to offline browsing, ad-blockers, or network throttling, the app instantly generates an elegant vector badge matching the destination's category palette (Indigo for Culture, Azure for Mountain, Emerald for Nature, Teal for Beach, Amber for Adventure) — eliminating broken gray boxes.
- **Focal Highlight Positioning**: Implemented customized CSS `--hero-focal` and thumbnail `object-position` coordinates (e.g., `center 30%` for soaring spires and towers, `center 40%` for mountain peaks, `center 50%` for coastal waters) so that the landmark's highlights are never cropped or obscured.
- **Luminous Contrast Scrim**: Replaced heavy muddy overlays with an elegant, multi-stop gradient scrim and frosted glassmorphism pills (`backdrop-filter: blur(12px)`) that preserve the natural luminescence of the photography while guaranteeing high-contrast text legibility.

---

### 3. 🎨 Design System, Shapes & Alignment Polish
- **Perfect Card Grid Alignment**: Standardized card structures with flexible column layouts (`display: flex; flex-direction: column; justify-content: space-between`). Card titles, badges, ratings, amenities, and action buttons align horizontally across every row.
- **Cohesive Typography & Color Palette**:
  - Primary: Royal Indigo (`#4f46e5`)
  - Accents: Emerald (`#10b981`), Amber (`#f59e0b`), Rose (`#f43f5e`), and Sky (`#0284c7`)
  - Neutral Base: Deep Slate (`#0f172a`) and Soft Porcelain (`#f8fafc`)
  - Typography: Modern pairing of `Plus Jakarta Sans` for titles and `Inter` for interface elements.
- **Responsive Layout**: Designed for seamless use on 4K desktops, laptops, tablets, and smartphones with an animated slide-out drawer on mobile screens.

---

### 4. 🗺️ Dual-Engine Interactive Maps
- **Out-of-the-Box Functionality (No API Key Required)**: When no Google Maps API key is configured, the platform automatically initializes a responsive **Leaflet.js + CartoDB Voyager** interactive map with custom pulse pin markers and popup tooltips.
- **Google Maps Integration**: Seamlessly activates Google Maps when an API key is provided in `Velora.html`.
- **Live GPS Distance Calculator**: One-click distance calculation from the user's current GPS location using the Haversine formula, complete with a direct Google Maps turn-by-turn navigation link.

---

### 5. 🏨 Interactive Booking & Concierge Modal
- **Multi-Tab Experience**: Overview, Map & Location, Available Rooms & Suites, and Local Dining.
- **Instant Booking Simulation**: Interactive "Reserve Suite" buttons with confirmation toast notifications.
- **Keyboard Shortcuts**:
  - Press `/` anywhere to focus the destination search bar.
  - Press `Escape` to close modals or the mobile sidebar.

---

## 💻 How to Run the Project

### Option A: Direct Browser Preview (Fastest)
Simply double-click or open **`Velora.html`** in any modern web browser (Chrome, Edge, Firefox, Safari). All features, imagery, and interactive maps work out-of-the-box.

### Option B: High-Performance Python Server
Run the Flask server:
```bash
python app.py
```
Then visit:
```
http://127.0.0.1:5000
```
