// --- 1. THE DATASET ---
const veloraData = {
  "destinations": [
    { "id": 1, "name": "Kyoto", "country": "Japan", "category": "Culture", "description": "The cultural heart of Japan, featuring classical Buddhist temples and traditional wooden houses.", "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e" },
    { "id": 2, "name": "Zermatt", "country": "Switzerland", "category": "Mountain", "description": "A car-free alpine village nestled below the iconic Matterhorn peak, famous for world-class skiing.", "image": "https://images.unsplash.com/photo-1531366936337-7c912a458b97" },
    { "id": 3, "name": "Ubud", "country": "Indonesia", "category": "Nature", "description": "Surrounded by rainforest and terraced rice paddies, Ubud is Bali's center for traditional crafts.", "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4" }
  ],
  "hotels": [
    { "dest_id": 1, "name": "Suiran Luxury Collection", "rating": 4.9, "price_usd": 450, "amenities": ["Spa", "River View", "Onsen"] },
    { "dest_id": 1, "name": "Kyoto Granbell Hotel", "rating": 4.5, "price_usd": 120, "amenities": ["Free WiFi", "Bar", "Public Bath"] },
    { "dest_id": 2, "name": "The Omnia", "rating": 5.0, "price_usd": 650, "amenities": ["Ski-in/Ski-out", "Michelin Restaurant", "Pool"] },
    { "dest_id": 2, "name": "Chalet Hotel Schönegg", "rating": 4.7, "price_usd": 320, "amenities": ["Matterhorn View", "Spa"] },
    { "dest_id": 3, "name": "Hanging Gardens of Bali", "rating": 4.8, "price_usd": 350, "amenities": ["Infinity Pool", "Jungle View"] },
    { "dest_id": 3, "name": "Ubud Tropical Hostel", "rating": 4.2, "price_usd": 15, "amenities": ["Co-working", "Pool"] }
  ],
  "attractions": [
    { "dest_id": 1, "name": "Fushimi Inari Shrine", "category": "Historic", "entry_fee_usd": 0, "duration_hours": 3 },
    { "dest_id": 1, "name": "Arashiyama Bamboo Grove", "category": "Nature", "entry_fee_usd": 0, "duration_hours": 1.5 },
    { "dest_id": 2, "name": "Matterhorn Glacier Paradise", "category": "Adventure", "entry_fee_usd": 110, "duration_hours": 4 },
    { "dest_id": 2, "name": "Gornergrat Railway", "category": "Scenic Sightseeing", "entry_fee_usd": 125, "duration_hours": 3 },
    { "dest_id": 3, "name": "Sacred Monkey Forest", "category": "Wildlife", "entry_fee_usd": 5, "duration_hours": 2 },
    { "dest_id": 3, "name": "Tegallalang Rice Terrace", "category": "Nature", "entry_fee_usd": 3, "duration_hours": 2 }
  ]
};

// --- 2. DATA PROCESSING FUNCTION ---
function getDestinationDetails(destinationId) {
  const destination = veloraData.destinations.find(dest => dest.id === destinationId);
  if (!destination) return null;

  return {
    ...destination,
    hotels: veloraData.hotels.filter(h => h.dest_id === destinationId),
    attractions: veloraData.attractions.filter(a => a.dest_id === destinationId)
  };
}

// --- 3. UI RENDERING FUNCTION ---
function renderDashboard(data) {
  // Update Hero
  const heroContainer = document.getElementById('destination-hero');
  heroContainer.innerHTML = `
    <div class="hero-banner" style="background-image: url('${data.image}')">
      <div class="hero-content">
        <span class="badge">${data.category}</span>
        <h2>${data.name}, ${data.country}</h2>
        <p>${data.description}</p>
      </div>
    </div>
  `;

  // Update Hotels
  const hotelContainer = document.getElementById('hotel-list');
  hotelContainer.innerHTML = data.hotels.map(hotel => `
    <li class="card">
      <div class="flex-row">
        <h4>${hotel.name}</h4>
        <span class="price">$${hotel.price_usd}</span>
      </div>
      <div class="flex-row">
        <span class="rating">⭐ ${hotel.rating}</span>
        <span class="meta">/ night</span>
      </div>
      <p class="amenities">Amenities: ${hotel.amenities.join(', ')}</p>
    </li>
  `).join('');

  // Update Attractions
  const attractionContainer = document.getElementById('attraction-list');
  attractionContainer.innerHTML = data.attractions.map(attr => `
    <li class="card">
      <div class="flex-row">
        <h4>${attr.name}</h4>
        <span class="fee">${attr.entry_fee_usd === 0 ? 'Free' : '$' + attr.entry_fee_usd}</span>
      </div>
      <p class="meta">${attr.category} • ${attr.duration_hours} hours</p>
    </li>
  `).join('');
}

// --- 4. EVENT LISTENERS ---
const buttons = document.querySelectorAll('.destination-btn');

buttons.forEach(button => {
  button.addEventListener('click', (e) => {
    // Remove 'active' class from all buttons
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add 'active' class to the clicked button
    const clickedBtn = e.currentTarget;
    clickedBtn.classList.add('active');

    // Fetch and render data
    const destId = parseInt(clickedBtn.getAttribute('data-id'));
    const destData = getDestinationDetails(destId);
    if (destData) renderDashboard(destData);
  });
});

// Load Kyoto data by default on page load
window.addEventListener('DOMContentLoaded', () => {
  const initialData = getDestinationDetails(1);
  if (initialData) renderDashboard(initialData);
});