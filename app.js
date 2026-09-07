// --- 0. GOOGLE MAPS INITIALIZATION CALLBACK ---
let googleMapsReady = false;
window.initializeGoogleMaps = function() {
  googleMapsReady = true;
  console.log('Google Maps API loaded successfully');
};

// --- 1. THE DATASET WITH COORDINATES AND ROOMS ---
const veloraData = {
  "destinations": [
    { "id": 1, "name": "Kyoto", "country": "Japan", "category": "Culture", "terrain": "urban", "climate": "temperate", "costOfLiving": "medium", "luxuryLevel": "upscale", "mainAttraction": "culture", "description": "The cultural heart of Japan, featuring classical Buddhist temples and traditional wooden houses with stunning gardens.", "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e", "lat": 35.0116, "lng": 135.7681 },
    { "id": 2, "name": "Zermatt", "country": "Switzerland", "category": "Mountain", "terrain": "alpine", "climate": "cold", "costOfLiving": "high", "luxuryLevel": "luxury", "mainAttraction": "adventure", "description": "A car-free alpine village nestled below the iconic Matterhorn peak, famous for world-class skiing and breathtaking views.", "image": "https://images.unsplash.com/photo-1531366936337-7c912a458b97", "lat": 46.0207, "lng": 7.7491 },
    { "id": 3, "name": "Ubud", "country": "Indonesia", "category": "Nature", "terrain": "rainforest", "climate": "tropical", "costOfLiving": "low", "luxuryLevel": "upscale", "mainAttraction": "nature", "description": "Surrounded by rainforest and terraced rice paddies, Ubud is Bali's center for traditional crafts and spiritual culture.", "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4", "lat": -8.5069, "lng": 115.2625 },
    { "id": 4, "name": "Barcelona", "country": "Spain", "category": "Culture", "terrain": "coastal", "climate": "mediterranean", "costOfLiving": "high", "luxuryLevel": "upscale", "mainAttraction": "culture", "description": "A vibrant coastal city known for Gaudí's architectural masterpieces, beaches, and Mediterranean charm.", "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded", "lat": 41.3874, "lng": 2.1686 },
    { "id": 5, "name": "Banff", "country": "Canada", "category": "Mountain", "terrain": "alpine", "climate": "cold", "costOfLiving": "medium", "luxuryLevel": "upscale", "mainAttraction": "nature", "description": "Nestled in the Canadian Rockies, Banff offers stunning turquoise lakes, hiking trails, and wilderness experiences.", "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", "lat": 51.1784, "lng": -115.5708 },
    { "id": 6, "name": "Maldives", "country": "Maldives", "category": "Beach", "terrain": "coastal", "climate": "tropical", "costOfLiving": "high", "luxuryLevel": "luxury", "mainAttraction": "beach", "description": "A tropical paradise with crystal-clear waters, white sandy beaches, and world-class diving opportunities.", "image": "https://images.unsplash.com/photo-1514282401047-7e6e5ad3220d", "lat": 4.1694, "lng": 73.5093 },
    { "id": 7, "name": "Costa Rica", "country": "Costa Rica", "category": "Nature", "terrain": "rainforest", "climate": "tropical", "costOfLiving": "medium", "luxuryLevel": "upscale", "mainAttraction": "nature", "description": "A biodiverse country with rainforests, volcanoes, and abundant wildlife offering eco-tourism adventures.", "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", "lat": 9.7489, "lng": -83.7534 },
    { "id": 8, "name": "Queenstown", "country": "New Zealand", "category": "Adventure", "terrain": "alpine", "climate": "temperate", "costOfLiving": "medium", "luxuryLevel": "upscale", "mainAttraction": "adventure", "description": "The adventure capital of the world with bungee jumping, jet boating, skiing, and stunning lake scenery.", "image": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800", "lat": -44.9210, "lng": 168.7383 },
    { "id": 9, "name": "Santorini", "country": "Greece", "category": "Beach", "terrain": "coastal", "climate": "mediterranean", "costOfLiving": "high", "luxuryLevel": "luxury", "mainAttraction": "beach", "description": "A picturesque island famous for white-washed buildings, sunset views, and beautiful Mediterranean beaches.", "image": "https://images.unsplash.com/photo-1570077189670-e3a8d69ac5ff", "lat": 36.3932, "lng": 25.4615 }
  ],
  "hotels": [
    // Kyoto (35.0116, 135.7681)
    { "dest_id": 1, "name": "Suiran Luxury Collection", "rating": 4.9, "price_usd": 450, "amenities": ["Spa", "River View", "Onsen", "Michelin Restaurant"], "lat": 35.0150, "lng": 135.7720, "address": "Sagatenryuji Susukinobabacho, Kyoto" },
    { "dest_id": 1, "name": "Kyoto Granbell Hotel", "rating": 4.5, "price_usd": 120, "amenities": ["Free WiFi", "Bar", "Public Bath", "Modern Design"], "lat": 35.0089, "lng": 135.7650, "address": "Kaminokuchi-cho, Kyoto" },
    { "dest_id": 1, "name": "The Ritz-Carlton Kyoto", "rating": 5.0, "price_usd": 680, "amenities": ["Private Garden", "Kaiseki Dining", "Spa"], "lat": 35.0105, "lng": 135.7700, "address": "Kamogawa Nijo-Kahoji-cho, Kyoto" },
    // Zermatt (46.0207, 7.7491)
    { "dest_id": 2, "name": "The Omnia", "rating": 5.0, "price_usd": 650, "amenities": ["Ski-in/Ski-out", "Michelin Restaurant", "Indoor Pool"], "lat": 46.0180, "lng": 7.7520, "address": "Zermatt, Switzerland" },
    { "dest_id": 2, "name": "Chalet Hotel Schönegg", "rating": 4.7, "price_usd": 320, "amenities": ["Matterhorn View", "Spa", "Wellness Center"], "lat": 46.0225, "lng": 7.7475, "address": "Zermatt, Switzerland" },
    { "dest_id": 2, "name": "Höhematte Resort", "rating": 4.6, "price_usd": 280, "amenities": ["Mountain Views", "Sauna", "Restaurant"], "lat": 46.0195, "lng": 7.7510, "address": "Zermatt, Switzerland" },
    // Ubud (-8.5069, 115.2625)
    { "dest_id": 3, "name": "Hanging Gardens of Bali", "rating": 4.8, "price_usd": 350, "amenities": ["Infinity Pool", "Jungle View", "Spa Treatments"], "lat": -8.5090, "lng": 115.2650, "address": "Ubud, Bali" },
    { "dest_id": 3, "name": "Ubud Tropical Hostel", "rating": 4.2, "price_usd": 15, "amenities": ["Co-working", "Pool", "Community Kitchen"], "lat": -8.5055, "lng": 115.2610, "address": "Ubud, Bali" },
    { "dest_id": 3, "name": "Four Seasons Resort Bali", "rating": 4.9, "price_usd": 520, "amenities": ["Valley Views", "Private Pools", "Fine Dining"], "lat": -8.5075, "lng": 115.2640, "address": "Ubud, Bali" },
    // Barcelona (41.3874, 2.1686)
    { "dest_id": 4, "name": "Hotel Pratik Bakery", "rating": 4.4, "price_usd": 95, "amenities": ["Bakery", "Free WiFi", "Rooftop Terrace"], "lat": 41.3850, "lng": 2.1700, "address": "Barcelona, Spain" },
    { "dest_id": 4, "name": "Mandarin Oriental Barcelona", "rating": 4.9, "price_usd": 620, "amenities": ["Spa", "Michelin Restaurant", "City Views"], "lat": 41.3880, "lng": 2.1680, "address": "Barcelona, Spain" },
    { "dest_id": 4, "name": "Casa Camper Barcelona", "rating": 4.6, "price_usd": 180, "amenities": ["Rooftop Bar", "Terrace", "Modern Design"], "lat": 41.3895, "lng": 2.1670, "address": "Barcelona, Spain" },
    // Banff (51.1784, -115.5708)
    { "dest_id": 5, "name": "Fairmont Banff Springs", "rating": 4.8, "price_usd": 520, "amenities": ["Mountain Views", "Spa", "Fine Dining", "Golf Course"], "lat": 51.1775, "lng": -115.5720, "address": "Banff, Alberta" },
    { "dest_id": 5, "name": "Lake Louise Inn", "rating": 4.5, "price_usd": 280, "amenities": ["Lake View", "Restaurant", "Hot Tub"], "lat": 51.4267, "lng": -116.1783, "address": "Lake Louise, Alberta" },
    { "dest_id": 5, "name": "Cascade Mountain Suites", "rating": 4.3, "price_usd": 165, "amenities": ["Mountain Lodge", "Fireplace", "Restaurant"], "lat": 51.1790, "lng": -115.5700, "address": "Banff, Alberta" },
    // Maldives (4.1694, 73.5093)
    { "dest_id": 6, "name": "Conrad Maldives Rangali Island", "rating": 5.0, "price_usd": 1200, "amenities": ["Overwater Villas", "Private Beach", "Michelin Restaurant"], "lat": 4.1700, "lng": 73.5100, "address": "Rangali Island" },
    { "dest_id": 6, "name": "Maldives Island Resort", "rating": 4.6, "price_usd": 450, "amenities": ["Coral Reef", "Water Sports", "Spa"], "lat": 4.1690, "lng": 73.5085, "address": "Maldives" },
    { "dest_id": 6, "name": "Sun Island Resort", "rating": 4.4, "price_usd": 320, "amenities": ["Beach", "Snorkeling", "Restaurant"], "lat": 4.1705, "lng": 73.5105, "address": "Maldives" },
    // Costa Rica (9.7489, -83.7534)
    { "dest_id": 7, "name": "Four Seasons Peninsula Papagayo", "rating": 4.9, "price_usd": 650, "amenities": ["Beach Resort", "Spa", "Golf Course"], "lat": 10.7241, "lng": -85.8308, "address": "Guanacaste" },
    { "dest_id": 7, "name": "Arenal Kioro Suites", "rating": 4.7, "price_usd": 380, "amenities": ["Volcano Views", "Hot Springs", "Spa"], "lat": 10.4581, "lng": -84.3026, "address": "La Fortuna" },
    { "dest_id": 7, "name": "Manuel Antonio Eco Lodge", "rating": 4.4, "price_usd": 185, "amenities": ["Rainforest Location", "Wildlife Tours", "Restaurant"], "lat": 9.3786, "lng": -84.4145, "address": "Manuel Antonio" },
    // Queenstown (-44.9210, 168.7383)
    { "dest_id": 8, "name": "The Ritz-Carlton Queenstown", "rating": 4.9, "price_usd": 780, "amenities": ["Mountain Views", "Spa", "Fine Dining"], "lat": -44.9205, "lng": 168.7375, "address": "Queenstown" },
    { "dest_id": 8, "name": "Hilton Queenstown", "rating": 4.6, "price_usd": 350, "amenities": ["Lake View", "Adventure Booking", "Restaurant"], "lat": -44.9215, "lng": 168.7390, "address": "Queenstown" },
    { "dest_id": 8, "name": "Backpacker Lodge Queenstown", "rating": 4.2, "price_usd": 45, "amenities": ["Social Atmosphere", "Kitchen", "Adventure Advice"], "lat": -44.9220, "lng": 168.7365, "address": "Queenstown" },
    // Santorini (36.3932, 25.4615)
    { "dest_id": 9, "name": "Luxury Caldera Suite", "rating": 5.0, "price_usd": 850, "amenities": ["Caldera View", "Private Pool", "Sunset Terrace"], "lat": 36.4167, "lng": 25.4615, "address": "Oia, Santorini" },
    { "dest_id": 9, "name": "Astra Suites", "rating": 4.8, "price_usd": 520, "amenities": ["Whitewashed Design", "Spa", "Wine Tasting"], "lat": 36.4175, "lng": 25.4620, "address": "Oia, Santorini" },
    { "dest_id": 9, "name": "Blue Domes Resort", "rating": 4.5, "price_usd": 220, "amenities": ["Aegean Sea View", "Restaurant", "Pool"], "lat": 36.4160, "lng": 25.4610, "address": "Santorini" }
  ],
  "rooms": [
    { "hotel_id": 1, "type": "Deluxe Room", "capacity": 2, "price_usd": 450, "amenities": ["River View", "Marble Bath", "Garden Access", "Free WiFi"] },
    { "hotel_id": 1, "type": "Suite with Onsen", "capacity": 2, "price_usd": 680, "amenities": ["Private Onsen", "River View", "Spa Access", "Kaiseki Breakfast"] },
    { "hotel_id": 1, "type": "Villa", "capacity": 4, "price_usd": 1200, "amenities": ["Private Garden", "Private Onsen", "Gourmet Kitchen", "Concierge"] },
    { "hotel_id": 2, "type": "Standard Room", "capacity": 2, "price_usd": 120, "amenities": ["Modern Design", "Flat-screen TV", "Shower Cabin", "Free WiFi"] },
    { "hotel_id": 2, "type": "Deluxe Room", "capacity": 2, "price_usd": 180, "amenities": ["City View", "Luxury Bath", "Work Desk", "Free WiFi"] },
    { "hotel_id": 2, "type": "Suite", "capacity": 3, "price_usd": 320, "amenities": ["Lounge Area", "City View", "Spa Bath", "Bar Access"] },
    { "hotel_id": 3, "type": "Deluxe Room", "capacity": 2, "price_usd": 680, "amenities": ["Garden View", "Marble Bath", "Premium Toiletries", "Robes"] },
    { "hotel_id": 3, "type": "Suite", "capacity": 2, "price_usd": 950, "amenities": ["River View", "Private Bath", "Living Room", "Concierge"] },
    { "hotel_id": 3, "type": "Presidential Suite", "capacity": 4, "price_usd": 1800, "amenities": ["Panoramic View", "Private Spa", "Chef Kitchen", "Butler Service"] },
    { "hotel_id": 4, "type": "Standard Room", "capacity": 2, "price_usd": 650, "amenities": ["Mountain View", "Heated Floors", "Luxury Bath", "Fireplace"] },
    { "hotel_id": 4, "type": "Suite", "capacity": 2, "price_usd": 950, "amenities": ["Balcony", "Mountain View", "Jacuzzi", "Premium Bed"] },
    { "hotel_id": 4, "type": "Penthouse", "capacity": 4, "price_usd": 1600, "amenities": ["360° Views", "Private Pool", "Gourmet Kitchen", "Concierge"] },
    { "hotel_id": 5, "type": "Chalet Room", "capacity": 2, "price_usd": 320, "amenities": ["Matterhorn View", "Fireplace", "Wood Interior", "Spa Access"] },
    { "hotel_id": 5, "type": "Suite", "capacity": 3, "price_usd": 520, "amenities": ["Balcony", "Jacuzzi", "Mountain View", "Wine Cellar"] },
    { "hotel_id": 5, "type": "Luxury Chalet", "capacity": 6, "price_usd": 1200, "amenities": ["Private Hot Tub", "Sauna", "Gourmet Kitchen", "Fireplace"] },
    { "hotel_id": 6, "type": "Mountain Room", "capacity": 2, "price_usd": 280, "amenities": ["Alpine View", "Sauna Access", "Wooden Decor", "Heated Bed"] },
    { "hotel_id": 6, "type": "Deluxe Room", "capacity": 2, "price_usd": 420, "amenities": ["Balcony", "Mountain View", "Premium Bath", "Lounge Area"] },
    { "hotel_id": 6, "type": "Suite", "capacity": 4, "price_usd": 780, "amenities": ["Fireplace", "Private Sauna", "Kitchenette", "Mountain Views"] },
    { "hotel_id": 7, "type": "Deluxe Room", "capacity": 2, "price_usd": 350, "amenities": ["Jungle View", "Pool Access", "Spa Treatments", "Outdoor Shower"] },
    { "hotel_id": 7, "type": "Suite", "capacity": 2, "price_usd": 580, "amenities": ["Private Pool", "Jungle View", "Daybed", "Spa Bath"] },
    { "hotel_id": 7, "type": "Villa", "capacity": 4, "price_usd": 1100, "amenities": ["Infinity Pool", "Jungle View", "Chef Kitchen", "Private Spa"] },
    { "hotel_id": 8, "type": "Dorm Room", "capacity": 4, "price_usd": 15, "amenities": ["Shared Bath", "Locker", "Fan", "Common Area"] },
    { "hotel_id": 8, "type": "Private Room", "capacity": 2, "price_usd": 35, "amenities": ["Private Bath", "AC", "Work Desk", "Balcony"] },
    { "hotel_id": 8, "type": "Suite", "capacity": 3, "price_usd": 65, "amenities": ["Kitchenette", "Private Bath", "Living Area", "Pool View"] },
    { "hotel_id": 9, "type": "Deluxe Room", "capacity": 2, "price_usd": 520, "amenities": ["Valley View", "Private Pool", "Terrace", "Spa Access"] },
    { "hotel_id": 9, "type": "Suite", "capacity": 2, "price_usd": 850, "amenities": ["Infinity Pool", "Valley View", "Lounge Area", "Premium Service"] },
    { "hotel_id": 9, "type": "Presidential Villa", "capacity": 4, "price_usd": 1800, "amenities": ["Private Villa", "Butler", "Gourmet Kitchen", "Spa Treatment"] },
    { "hotel_id": 10, "type": "Standard Room", "capacity": 2, "price_usd": 95, "amenities": ["Cozy", "Free WiFi", "Bakery Access", "City Center"] },
    { "hotel_id": 10, "type": "Deluxe Room", "capacity": 2, "price_usd": 150, "amenities": ["Rooftop View", "Luxury Bath", "Free WiFi", "Breakfast"] },
    { "hotel_id": 10, "type": "Suite", "capacity": 3, "price_usd": 250, "amenities": ["Terrace", "City View", "Kitchenette", "Premium Access"] },
    { "hotel_id": 11, "type": "Deluxe Room", "capacity": 2, "price_usd": 620, "amenities": ["City View", "Marble Bath", "Premium Bed", "Spa Access"] },
    { "hotel_id": 11, "type": "Suite", "capacity": 2, "price_usd": 950, "amenities": ["Balcony", "City View", "Jacuzzi", "Lounge"] },
    { "hotel_id": 11, "type": "Presidential Suite", "capacity": 4, "price_usd": 1800, "amenities": ["Panoramic View", "Private Spa", "Chef", "Butler"] },
    { "hotel_id": 12, "type": "Standard Room", "capacity": 2, "price_usd": 180, "amenities": ["Modern Design", "Rooftop Access", "Free WiFi", "Flat-screen TV"] },
    { "hotel_id": 12, "type": "Deluxe Room", "capacity": 2, "price_usd": 280, "amenities": ["Terrace", "City View", "Luxury Bath", "Work Desk"] },
    { "hotel_id": 12, "type": "Suite", "capacity": 3, "price_usd": 450, "amenities": ["Rooftop Terrace", "Lounge Area", "Bar Access", "Premium Service"] },
    { "hotel_id": 13, "type": "Deluxe Room", "capacity": 2, "price_usd": 520, "amenities": ["Mountain View", "Marble Bath", "Spa Access", "Golf Privileges"] },
    { "hotel_id": 13, "type": "Suite", "capacity": 2, "price_usd": 850, "amenities": ["Valley View", "Premium Bath", "Lounge", "Concierge"] },
    { "hotel_id": 13, "type": "Castle Suite", "capacity": 4, "price_usd": 1800, "amenities": ["Panoramic View", "Private Spa", "Gourmet Kitchen", "Butler"] },
    { "hotel_id": 14, "type": "Standard Room", "capacity": 2, "price_usd": 280, "amenities": ["Lake View", "Heated Bathroom", "Work Desk", "Hot Tub Access"] },
    { "hotel_id": 14, "type": "Deluxe Room", "capacity": 2, "price_usd": 420, "amenities": ["Balcony", "Lake View", "Premium Bath", "Fireplace"] },
    { "hotel_id": 14, "type": "Suite", "capacity": 4, "price_usd": 780, "amenities": ["Lounge Area", "Lake View", "Kitchenette", "Private Hot Tub"] },
    { "hotel_id": 15, "type": "Mountain Room", "capacity": 2, "price_usd": 165, "amenities": ["Mountain View", "Fireplace", "Cozy", "Hot Tub Access"] },
    { "hotel_id": 15, "type": "Suite", "capacity": 2, "price_usd": 280, "amenities": ["Balcony", "Fireplace", "Premium Bath", "Lounge"] },
    { "hotel_id": 15, "type": "Deluxe Suite", "capacity": 4, "price_usd": 520, "amenities": ["Kitchen", "Fireplace", "Mountain View", "Spa Access"] },
    { "hotel_id": 16, "type": "Water Villa", "capacity": 2, "price_usd": 1200, "amenities": ["Overwater", "Private Pool", "Slide to Ocean", "Unlimited Dining"] },
    { "hotel_id": 16, "type": "Beach Villa", "capacity": 2, "price_usd": 950, "amenities": ["Private Beach", "Pool", "Deck", "Water Sports"] },
    { "hotel_id": 16, "type": "Ultimate Villa", "capacity": 4, "price_usd": 2500, "amenities": ["Infinity Pool", "Chef Kitchen", "Spa", "Butler Service"] },
    { "hotel_id": 17, "type": "Beach Bungalow", "capacity": 2, "price_usd": 450, "amenities": ["Beach Access", "Snorkeling", "Outdoor Shower", "Pool"] },
    { "hotel_id": 17, "type": "Water Bungalow", "capacity": 2, "price_usd": 650, "amenities": ["Overwater", "Glass Floor", "Private Pool", "Slide"] },
    { "hotel_id": 17, "type": "Luxury Villa", "capacity": 4, "price_usd": 1200, "amenities": ["Private Beach", "Infinity Pool", "Spa", "Chef"] },
    { "hotel_id": 18, "type": "Beach Room", "capacity": 2, "price_usd": 320, "amenities": ["Beach View", "Pool Access", "Snorkeling", "Restaurant"] },
    { "hotel_id": 18, "type": "Water Villa", "capacity": 2, "price_usd": 520, "amenities": ["Overwater", "Private Pool", "Deck", "Dining"] },
    { "hotel_id": 18, "type": "Deluxe Villa", "capacity": 3, "price_usd": 850, "amenities": ["Beachfront", "Infinity Pool", "Spa Bath", "Premium Service"] },
    { "hotel_id": 19, "type": "Deluxe Room", "capacity": 2, "price_usd": 650, "amenities": ["Ocean View", "Terrace", "Private Pool", "Spa Access"] },
    { "hotel_id": 19, "type": "Suite", "capacity": 2, "price_usd": 950, "amenities": ["Balcony", "Ocean View", "Jacuzzi", "Lounge"] },
    { "hotel_id": 19, "type": "Presidential Villa", "capacity": 4, "price_usd": 1800, "amenities": ["Private Villa", "Chef Kitchen", "Spa", "Butler"] },
    { "hotel_id": 20, "type": "Deluxe Room", "capacity": 2, "price_usd": 380, "amenities": ["Volcano View", "Balcony", "Hot Springs Access", "Spa"] },
    { "hotel_id": 20, "type": "Suite", "capacity": 2, "price_usd": 580, "amenities": ["Volcano View", "Private Hot Spring", "Lounge", "Premium Service"] },
    { "hotel_id": 20, "type": "Luxury Suite", "capacity": 4, "price_usd": 1100, "amenities": ["Panoramic View", "Private Hot Spring", "Gourmet Kitchen", "Concierge"] },
    { "hotel_id": 21, "type": "Jungle Room", "capacity": 2, "price_usd": 185, "amenities": ["Nature View", "Eco-Friendly", "Wildlife Viewing", "Terrace"] },
    { "hotel_id": 21, "type": "Suite", "capacity": 2, "price_usd": 320, "amenities": ["Jungle View", "Private Terrace", "Premium Bath", "Eco-Luxury"] },
    { "hotel_id": 21, "type": "Villa", "capacity": 4, "price_usd": 650, "amenities": ["Rainforest Setting", "Private Pool", "Kitchen", "Wildlife Tours"] },
    { "hotel_id": 22, "type": "Deluxe Room", "capacity": 2, "price_usd": 780, "amenities": ["Mountain View", "Premium Bath", "Spa Access", "Fireplace"] },
    { "hotel_id": 22, "type": "Suite", "capacity": 2, "price_usd": 1100, "amenities": ["Lake View", "Private Bath", "Lounge", "Concierge"] },
    { "hotel_id": 22, "type": "Presidential Suite", "capacity": 4, "price_usd": 2000, "amenities": ["Panoramic View", "Private Spa", "Chef Kitchen", "Butler"] },
    { "hotel_id": 23, "type": "Standard Room", "capacity": 2, "price_usd": 350, "amenities": ["Lake View", "Modern Design", "Free WiFi", "Gym Access"] },
    { "hotel_id": 23, "type": "Deluxe Room", "capacity": 2, "price_usd": 520, "amenities": ["Lake View", "Balcony", "Premium Bath", "Restaurant Access"] },
    { "hotel_id": 23, "type": "Suite", "capacity": 3, "price_usd": 850, "amenities": ["Lounge Area", "Lake View", "Kitchenette", "Premium Service"] },
    { "hotel_id": 24, "type": "Dorm", "capacity": 4, "price_usd": 45, "amenities": ["Shared Bath", "Locker", "Common Area", "Social Vibe"] },
    { "hotel_id": 24, "type": "Private Room", "capacity": 2, "price_usd": 95, "amenities": ["Private Bath", "Work Desk", "Balcony", "Adventure Info"] },
    { "hotel_id": 24, "type": "Suite", "capacity": 4, "price_usd": 180, "amenities": ["Kitchen", "Private Bath", "Lounge", "Adventure Booking"] },
    { "hotel_id": 25, "type": "Deluxe Suite", "capacity": 2, "price_usd": 850, "amenities": ["Caldera View", "Private Pool", "Outdoor Shower", "Premium Bed"] },
    { "hotel_id": 25, "type": "Luxury Suite", "capacity": 2, "price_usd": 1200, "amenities": ["Sunset View", "Infinity Pool", "Spa Bath", "Terrace"] },
    { "hotel_id": 25, "type": "Presidential Suite", "capacity": 4, "price_usd": 2000, "amenities": ["360° View", "Private Pool", "Spa", "Chef Kitchen"] },
    { "hotel_id": 26, "type": "Deluxe Room", "capacity": 2, "price_usd": 520, "amenities": ["Caldera View", "Private Terrace", "Spa Access", "Wine Tasting"] },
    { "hotel_id": 26, "type": "Suite", "capacity": 2, "price_usd": 780, "amenities": ["Sunset View", "Lounge Area", "Premium Bath", "Concierge"] },
    { "hotel_id": 26, "type": "Luxury Suite", "capacity": 3, "price_usd": 1200, "amenities": ["Panoramic View", "Private Spa", "Wine Cellar", "Chef"] },
    { "hotel_id": 27, "type": "Standard Room", "capacity": 2, "price_usd": 220, "amenities": ["Sea View", "Balcony", "Pool Access", "Restaurant"] },
    { "hotel_id": 27, "type": "Deluxe Room", "capacity": 2, "price_usd": 350, "amenities": ["Caldera View", "Private Terrace", "Premium Bath", "Spa Access"] },
    { "hotel_id": 27, "type": "Suite", "capacity": 3, "price_usd": 580, "amenities": ["Sea View", "Lounge", "Kitchenette", "Premium Service"] }
  ],
  "attractions": [
    { "dest_id": 1, "name": "Fushimi Inari Shrine", "category": "Historic", "entry_fee_usd": 0, "duration_hours": 3, "lat": 34.9674, "lng": 135.7628 },
    { "dest_id": 1, "name": "Arashiyama Bamboo Grove", "category": "Nature", "entry_fee_usd": 0, "duration_hours": 1.5, "lat": 35.0130, "lng": 135.7472 },
    { "dest_id": 1, "name": "Kinkaku-ji Golden Pavilion", "category": "Temple", "entry_fee_usd": 8, "duration_hours": 2, "lat": 35.0393, "lng": 135.7291 },
    { "dest_id": 2, "name": "Matterhorn Glacier Paradise", "category": "Adventure", "entry_fee_usd": 110, "duration_hours": 4, "lat": 45.9814, "lng": 7.7558 },
    { "dest_id": 2, "name": "Gornergrat Railway", "category": "Scenic Sightseeing", "entry_fee_usd": 125, "duration_hours": 3, "lat": 46.0430, "lng": 7.7836 },
    { "dest_id": 2, "name": "Five Lake Hiking Trail", "category": "Hiking", "entry_fee_usd": 0, "duration_hours": 5, "lat": 46.0112, "lng": 7.7612 },
    { "dest_id": 3, "name": "Sacred Monkey Forest", "category": "Wildlife", "entry_fee_usd": 5, "duration_hours": 2, "lat": -8.5150, "lng": 115.2565 },
    { "dest_id": 3, "name": "Tegallalang Rice Terrace", "category": "Nature", "entry_fee_usd": 3, "duration_hours": 2, "lat": -8.4270, "lng": 115.2618 },
    { "dest_id": 3, "name": "Ubud Arts Market", "category": "Shopping", "entry_fee_usd": 0, "duration_hours": 2.5, "lat": -8.5069, "lng": 115.2608 },
    { "dest_id": 4, "name": "Sagrada Família", "category": "Architecture", "entry_fee_usd": 28, "duration_hours": 2.5, "lat": 41.4036, "lng": 2.1744 },
    { "dest_id": 4, "name": "Park Güell", "category": "Nature", "entry_fee_usd": 16, "duration_hours": 3, "lat": 41.4145, "lng": 2.1527 },
    { "dest_id": 4, "name": "Gothic Quarter Walking Tour", "category": "Historic", "entry_fee_usd": 15, "duration_hours": 2, "lat": 41.3851, "lng": 2.1734 },
    { "dest_id": 5, "name": "Lake Louise Boat Tour", "category": "Scenic", "entry_fee_usd": 35, "duration_hours": 1.5, "lat": 51.4266, "lng": -116.1783 },
    { "dest_id": 5, "name": "Moraine Lake Hiking", "category": "Hiking", "entry_fee_usd": 0, "duration_hours": 4, "lat": 51.3266, "lng": -116.1900 },
    { "dest_id": 5, "name": "Cave and Basin Trail", "category": "Hiking", "entry_fee_usd": 7, "duration_hours": 2, "lat": 51.1813, "lng": -115.5631 },
    { "dest_id": 6, "name": "House Reef Snorkeling", "category": "Water Sports", "entry_fee_usd": 0, "duration_hours": 3, "lat": 4.1694, "lng": 73.5093 },
    { "dest_id": 6, "name": "Dolphin Watching Tour", "category": "Wildlife", "entry_fee_usd": 80, "duration_hours": 2.5, "lat": 4.1650, "lng": 73.5150 },
    { "dest_id": 6, "name": "Night Diving Adventure", "category": "Water Sports", "entry_fee_usd": 120, "duration_hours": 3, "lat": 4.1700, "lng": 73.5050 },
    { "dest_id": 7, "name": "Arenal Volcano Tour", "category": "Nature", "entry_fee_usd": 55, "duration_hours": 4, "lat": 10.4628, "lng": -84.3036 },
    { "dest_id": 7, "name": "Monteverde Cloud Forest", "category": "Hiking", "entry_fee_usd": 25, "duration_hours": 3, "lat": 10.3063, "lng": -84.8153 },
    { "dest_id": 7, "name": "Sloth Spotting Tour", "category": "Wildlife", "entry_fee_usd": 45, "duration_hours": 3, "lat": 9.3786, "lng": -84.4145 },
    { "dest_id": 8, "name": "Bungee Jumping", "category": "Adventure", "entry_fee_usd": 195, "duration_hours": 3, "lat": -44.8672, "lng": 168.7625 },
    { "dest_id": 8, "name": "Jet Boat Tour Lake Wakatipu", "category": "Water Sports", "entry_fee_usd": 105, "duration_hours": 1.5, "lat": -44.9210, "lng": 168.7383 },
    { "dest_id": 8, "name": "Milford Sound Cruise", "category": "Scenic", "entry_fee_usd": 165, "duration_hours": 8, "lat": -44.6719, "lng": 168.2000 },
    { "dest_id": 9, "name": "Sunset in Oia", "category": "Scenic", "entry_fee_usd": 0, "duration_hours": 2, "lat": 36.4170, "lng": 25.4615 },
    { "dest_id": 9, "name": "Volcano & Hot Springs Boat Tour", "category": "Tour", "entry_fee_usd": 50, "duration_hours": 4, "lat": 36.4200, "lng": 25.4500 },
    { "dest_id": 9, "name": "Caldera Hiking Trail", "category": "Hiking", "entry_fee_usd": 0, "duration_hours": 3.5, "lat": 36.4100, "lng": 25.4700 }
  ],
  "restaurants": [
    { "dest_id": 1, "name": "Kyoto Kaiseki Miyama", "cuisine": "Japanese", "rating": 4.9, "price_usd": 120, "features": ["Michelin Starred", "Traditional", "Seasonal Menu"] },
    { "dest_id": 1, "name": "Okutan Kappa Zushi", "cuisine": "Japanese", "rating": 4.6, "price_usd": 35, "features": ["Tofu Speciality", "Historic", "Casual"] },
    { "dest_id": 1, "name": "Ramen Yokocho", "cuisine": "Japanese", "rating": 4.5, "price_usd": 10, "features": ["Ramen Alley", "Local", "Budget Friendly"] },
    { "dest_id": 2, "name": "Chez Vrony", "cuisine": "Swiss", "rating": 4.8, "price_usd": 85, "features": ["Mountain Views", "Traditional", "Seasonal Dishes"] },
    { "dest_id": 2, "name": "Stahlbalm Restaurant", "rating": 4.7, "price_usd": 65, "features": ["Fondue", "Raclette", "Cozy"] },
    { "dest_id": 2, "name": "Bahnhof Burger", "cuisine": "Burgers", "rating": 4.4, "price_usd": 20, "features": ["Quick Service", "Quality", "Budget"] },
    { "dest_id": 3, "name": "Karsa Kafe", "cuisine": "Indonesian", "rating": 4.6, "price_usd": 15, "features": ["Traditional", "Local", "Authentic Flavors"] },
    { "dest_id": 3, "name": "Bridges Bali", "cuisine": "International", "rating": 4.8, "price_usd": 50, "features": ["Fine Dining", "Valley Views", "Romantic"] },
    { "dest_id": 3, "name": "Pizza Bagus", "cuisine": "Italian", "rating": 4.3, "price_usd": 12, "features": ["Wood Fired", "Casual", "Budget Friendly"] },
    { "dest_id": 4, "name": "Moments (Mandarin Oriental)", "cuisine": "Catalan", "rating": 4.9, "price_usd": 150, "features": ["Michelin Starred", "Upscale", "Modern"] },
    { "dest_id": 4, "name": "Cervecería Catalana", "cuisine": "Spanish", "rating": 4.7, "price_usd": 28, "features": ["Tapas", "Lively", "Social"] },
    { "dest_id": 4, "name": "La Boqueria Market Food", "cuisine": "Spanish", "rating": 4.5, "price_usd": 18, "features": ["Fresh Produce", "Local", "Quick"] },
    { "dest_id": 5, "name": "Banffshire Club", "cuisine": "Canadian", "rating": 4.8, "price_usd": 95, "features": ["Fine Dining", "Local Game", "Upscale"] },
    { "dest_id": 5, "name": "Tooloulou", "cuisine": "French", "rating": 4.6, "price_usd": 65, "features": ["Bistro", "Cozy", "Wine Selection"] },
    { "dest_id": 5, "name": "Burger King Banff", "cuisine": "Fast Food", "rating": 4.1, "price_usd": 12, "features": ["Quick", "Budget", "Convenient"] },
    { "dest_id": 6, "name": "Ufaa by Momo", "cuisine": "Asian Fusion", "rating": 4.9, "price_usd": 180, "features": ["Michelin Chef", "Underwater", "Luxury"] },
    { "dest_id": 6, "name": "The Rill Beach Club", "cuisine": "International", "rating": 4.7, "price_usd": 95, "features": ["Beachfront", "Relaxed", "Fresh Seafood"] },
    { "dest_id": 6, "name": "Fisherman's Cove", "cuisine": "Seafood", "rating": 4.5, "price_usd": 55, "features": ["Fresh Catch", "Local", "Casual"] },
    { "dest_id": 7, "name": "Silvestre", "cuisine": "Costa Rican", "rating": 4.8, "price_usd": 65, "features": ["Farm to Table", "Organic", "Sustainably Sourced"] },
    { "dest_id": 7, "name": "Al Mercat", "cuisine": "Spanish", "rating": 4.6, "price_usd": 48, "features": ["Tapas", "Wine Bar", "Cozy"] },
    { "dest_id": 7, "name": "Soda Típica", "cuisine": "Costa Rican", "rating": 4.3, "price_usd": 8, "features": ["Local Favorite", "Budget", "Authentic"] },
    { "dest_id": 8, "name": "Rātā", "cuisine": "Modern NZ", "rating": 4.9, "price_usd": 120, "features": ["Rotisserie", "Fine Dining", "Local Produce"] },
    { "dest_id": 8, "name": "Burgers & Beers", "cuisine": "Burgers", "rating": 4.6, "price_usd": 22, "features": ["Craft Beers", "Casual", "Quality"] },
    { "dest_id": 8, "name": "Thai Chilli", "cuisine": "Thai", "rating": 4.4, "price_usd": 16, "features": ["Authentic", "Budget", "Popular"] },
    { "dest_id": 9, "name": "Selene", "cuisine": "Greek", "rating": 4.9, "price_usd": 100, "features": ["Michelin Starred", "Local Wine", "Sunset Views"] },
    { "dest_id": 9, "name": "Sunset Taverna", "cuisine": "Greek", "rating": 4.7, "price_usd": 35, "features": ["Sunset View", "Traditional", "Casual"] },
    { "dest_id": 9, "name": "Souvlaki Spot", "cuisine": "Greek Street Food", "rating": 4.4, "price_usd": 8, "features": ["Quick Bite", "Authentic", "Budget"] }
  ]
};

// --- 2. STATE MANAGEMENT ---
let currentDestination = 1;
let currentHotelPage = 0;
let currentAttractionPage = 0;
let filteredDestinations = veloraData.destinations;
const destinationFilters = {
  category: 'all',
  terrain: 'all',
  climate: 'all',
  costOfLiving: 'all',
  luxuryLevel: 'all',
  mainAttraction: 'all'
};
let currentDetailView = null;
let map = null;

// --- 3. UTILITY FUNCTIONS ---
function getDestinationDetails(destinationId) {
  const destination = veloraData.destinations.find(dest => dest.id === destinationId);
  if (!destination) return null;
  return {
    ...destination,
    hotels: veloraData.hotels.filter(h => h.dest_id === destinationId),
    attractions: veloraData.attractions.filter(a => a.dest_id === destinationId),
    restaurants: veloraData.restaurants.filter(r => r.dest_id === destinationId)
  };
}

function paginateItems(items, page, itemsPerPage = 3) {
  const start = page * itemsPerPage;
  return {
    items: items.slice(start, start + itemsPerPage),
    totalPages: Math.ceil(items.length / itemsPerPage),
    currentPage: page
  };
}

// --- 4. DETAIL VIEW FUNCTIONS ---
function openDetailModal(type, id) {
  const modal = document.getElementById('detail-modal');
  currentDetailView = { type, id };
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (type === 'hotel') {
    const hotelIndex = id - 1;
    const hotel = veloraData.hotels[hotelIndex];
    const destination = veloraData.destinations.find(d => d.id === hotel.dest_id);
    const rooms = veloraData.rooms.filter(r => r.hotel_id === id);
    const restaurants = veloraData.restaurants.filter(r => r.dest_id === hotel.dest_id);
    renderHotelDetail(hotel, destination, rooms, restaurants);
  } else if (type === 'attraction') {
    const attraction = veloraData.attractions[id];
    const destination = veloraData.destinations.find(d => d.id === attraction.dest_id);
    renderAttractionDetail(attraction, destination);
  }
}

function closeDetailModal() {
  const modal = document.getElementById('detail-modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  currentDetailView = null;
}

function renderHotelDetail(hotel, destination, rooms, restaurants) {
  document.getElementById('detail-title').textContent = hotel.name;
  document.getElementById('detail-rating').innerHTML = `<span class="rating">⭐ ${hotel.rating}</span>`;
  document.getElementById('detail-category').textContent = `${destination.country}`;
  document.getElementById('detail-description').textContent = `${hotel.name} is located in ${destination.name}, ${destination.country}. Experience luxury accommodation with premium amenities.`;

  const infoGrid = document.getElementById('detail-info-grid');
  infoGrid.innerHTML = `
    <div class="detail-info-item">
      <h4>Price per Night</h4>
      <p>$${hotel.price_usd}</p>
    </div>
    <div class="detail-info-item">
      <h4>Location</h4>
      <p>${destination.name}, ${destination.country}</p>
    </div>
    <div class="detail-info-item">
      <h4>Rating</h4>
      <p>${hotel.rating}/5.0</p>
    </div>
    <div class="detail-info-item">
      <h4>Amenities</h4>
      <p>${hotel.amenities.length} Available</p>
    </div>
  `;

  initializeMap(hotel.lat, hotel.lng, hotel.name);
  const locationInfo = document.getElementById('detail-location-info');
  locationInfo.innerHTML = `
    <div class="location-card">
      <h4><i class="fas fa-map-pin"></i> Hotel Location</h4>
      <p><strong>${hotel.name}</strong></p>
      <p>${hotel.address || `${destination.name}, ${destination.country}`}</p>
      <p>Coordinates: ${hotel.lat.toFixed(4)}°, ${hotel.lng.toFixed(4)}°</p>
    </div>
    <div class="location-card">
      <h4><i class="fas fa-star"></i> Amenities</h4>
      <p>${hotel.amenities.map(a => `<span style="display: block; margin: 0.3rem 0;">✓ ${a}</span>`).join('')}</p>
    </div>
  `;

  const roomsList = document.getElementById('rooms-list');
  roomsList.innerHTML = rooms.map((room, idx) => `
    <div class="room-card">
      <div class="room-header">
        <h4>${room.type}</h4>
        <div class="room-capacity"><i class="fas fa-users"></i> ${room.capacity}</div>
      </div>
      <div class="room-body">
        <div class="room-price">
          <p>per night</p>
          <div class="room-price-value">$${room.price_usd}</div>
        </div>
        <div class="room-amenities">
          ${room.amenities.map(a => `
            <div class="room-amenity">
              <i class="fas fa-check"></i>
              <span>${a}</span>
            </div>
          `).join('')}
        </div>
        <button class="book-btn" onclick="alert('Booking functionality would be integrated here')">Book Now</button>
      </div>
    </div>
  `).join('');

  const nearbyList = document.getElementById('nearby-restaurants');
  nearbyList.innerHTML = restaurants.map((rest, idx) => `
    <div class="nearby-card">
      <div class="nearby-card-header">
        <h4>${rest.name}</h4>
        <div class="nearby-rating">⭐ ${rest.rating}</div>
      </div>
      <div class="nearby-card-body">
        <div class="nearby-info">
          <div class="nearby-info-item">
            <i class="fas fa-utensils"></i>
            <span>${rest.cuisine}</span>
          </div>
          <div class="nearby-info-item">
            <i class="fas fa-dollar-sign"></i>
            <span>~$${rest.price_usd} per person</span>
          </div>
          <div class="nearby-info-item">
            <i class="fas fa-star"></i>
            <span>${rest.rating} Rating</span>
          </div>
        </div>
        <div class="nearby-features">
          ${rest.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  switchTab('overview');
}

function renderAttractionDetail(attraction, destination) {
  document.getElementById('detail-title').textContent = attraction.name;
  document.getElementById('detail-rating').innerHTML = `<span class="rating"><i class="fas fa-ticket"></i> ${attraction.category}</span>`;
  document.getElementById('detail-category').textContent = `${destination.country}`;
  document.getElementById('detail-description').textContent = `Explore ${attraction.name} in ${destination.name}. This ${attraction.category.toLowerCase()} experience is perfect for travelers seeking authentic cultural and natural attractions.`;

  const infoGrid = document.getElementById('detail-info-grid');
  infoGrid.innerHTML = `
    <div class="detail-info-item">
      <h4>Entry Fee</h4>
      <p>${attraction.entry_fee_usd === 0 ? 'Free' : `$${attraction.entry_fee_usd}`}</p>
    </div>
    <div class="detail-info-item">
      <h4>Duration</h4>
      <p>${attraction.duration_hours} hours</p>
    </div>
    <div class="detail-info-item">
      <h4>Category</h4>
      <p>${attraction.category}</p>
    </div>
    <div class="detail-info-item">
      <h4>Location</h4>
      <p>${destination.name}, ${destination.country}</p>
    </div>
  `;

  initializeMap(attraction.lat, attraction.lng, attraction.name);
  const locationInfo = document.getElementById('detail-location-info');
  locationInfo.innerHTML = `
    <div class="location-card">
      <h4><i class="fas fa-map-pin"></i> Attraction Location</h4>
      <p><strong>${attraction.name}</strong></p>
      <p>${destination.name}, ${destination.country}</p>
      <p>Coordinates: ${attraction.lat.toFixed(4)}°, ${attraction.lng.toFixed(4)}°</p>
    </div>
    <div class="location-card">
      <h4><i class="fas fa-info-circle"></i> Details</h4>
      <p><strong>Category:</strong> ${attraction.category}</p>
      <p><strong>Duration:</strong> ${attraction.duration_hours} hours</p>
      <p><strong>Entry Fee:</strong> ${attraction.entry_fee_usd === 0 ? 'Free' : `$${attraction.entry_fee_usd}`}</p>
    </div>
  `;

  document.getElementById('rooms-list').innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">This section is for accommodation details.</p>';
  document.getElementById('nearby-restaurants').innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-muted);">Nearby restaurants will be shown here.</p>';

  switchTab('overview');
}

function initializeMap(lat, lng, title) {
  const mapElement = document.getElementById('detail-map');
  mapElement.innerHTML = '';
  
  // Check if API key is set to default/placeholder
  if (!googleMapsReady) {
    mapElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: #f9fafb; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <i class="fas fa-map" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
        <h4>Maps Not Available</h4>
        <p>To enable Google Maps, you need to:</p>
        <ol style="text-align: left; margin: 1rem 0;">
          <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank" style="color: var(--primary-color);">Google Cloud Console</a></li>
          <li>Open <strong>Velora.html</strong> and find line 9 with <code>key=YOUR_API_KEY</code></li>
          <li>Replace <code>YOUR_API_KEY</code> with your actual API key</li>
          <li>Save and refresh the page</li>
        </ol>
      </div>
    `;
    return;
  }
  
  setTimeout(() => {
    if (typeof google !== 'undefined' && google.maps) {
      try {
        map = new google.maps.Map(mapElement, {
          zoom: 15,
          center: { lat, lng },
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }
          ]
        });
        new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: title,
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        console.log('Map initialized for:', title, 'at', lat, lng);
      } catch (error) {
        console.error('Error initializing map:', error);
        mapElement.innerHTML = '<p style="padding: 2rem; text-align: center; color: red;">Error loading map. Check console for details.</p>';
      }
    } else {
      mapElement.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-muted);">Google Maps library not loaded. Check your API key.</p>';
    }
  }, 100);
}

function switchTab(tabName) {
  document.querySelectorAll('.detail-tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.detail-tab-btn').forEach(btn => btn.classList.remove('active'));
  const tabContent = document.getElementById(`tab-${tabName}`);
  if (tabContent) tabContent.classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  if (tabName === 'map' && map && googleMapsReady) {
    setTimeout(() => {
      try {
        google.maps.event.trigger(map, 'resize');
        console.log('Map resized');
      } catch (error) {
        console.error('Error resizing map:', error);
      }
    }, 100);
  }
}

// --- 5. DASHBOARD RENDERING ---
function renderDestinationButtons() {
  const navButtons = document.getElementById('nav-buttons');
  if (!filteredDestinations.length) {
    navButtons.innerHTML = '<p class="no-destinations">No destinations match these filters.</p>';
    return;
  }
  navButtons.innerHTML = filteredDestinations.map(dest => `
    <button class="destination-btn ${dest.id === currentDestination ? 'active' : ''}" data-id="${dest.id}">
      ${dest.name}, ${dest.country}
    </button>
  `).join('');
  attachDestinationListeners();
}

function applyDestinationFilters() {
  filteredDestinations = veloraData.destinations.filter(destination =>
    Object.entries(destinationFilters).every(([key, value]) => value === 'all' || destination[key] === value)
  );
  renderDestinationButtons();

  if (!filteredDestinations.length) return;
  if (!filteredDestinations.find(destination => destination.id === currentDestination)) {
    currentDestination = filteredDestinations[0].id;
  }
  currentHotelPage = 0;
  currentAttractionPage = 0;
  const destData = getDestinationDetails(currentDestination);
  if (destData) renderDashboard(destData);
}

function renderDashboard(data) {
  document.getElementById('page-title').textContent = `${data.name} - Travel Guide`;
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

  const hotelPaged = paginateItems(data.hotels, currentHotelPage);
  const attractionPaged = paginateItems(data.attractions, currentAttractionPage);

  const hotelContainer = document.getElementById('hotel-list');
  hotelContainer.innerHTML = hotelPaged.items.map((hotel, idx) => `
    <li class="card" onclick="openDetailModal('hotel', ${veloraData.hotels.indexOf(hotel) + 1})" style="cursor: pointer;">
      <div class="flex-row">
        <h4>${hotel.name}</h4>
        <span class="price">$${hotel.price_usd}</span>
      </div>
      <div class="flex-row">
        <span class="rating">⭐ ${hotel.rating}</span>
        <span class="meta">/ night</span>
      </div>
      <div class="amenities">
        ${hotel.amenities.map(a => `<span style="display: inline-block; margin-right: 0.5rem; margin-bottom: 0.5rem; background: rgba(79,70,229,0.1); padding: 0.3rem 0.7rem; border-radius: 4px; font-size: 0.85rem;">${a}</span>`).join('')}
      </div>
      <p class="meta" style="margin-top: 0.75rem; cursor: pointer; color: var(--primary-color); font-weight: 500;">View Details & Rooms →</p>
    </li>
  `).join('');

  const attractionContainer = document.getElementById('attraction-list');
  attractionContainer.innerHTML = attractionPaged.items.map((attr, idx) => `
    <li class="card" onclick="openDetailModal('attraction', ${veloraData.attractions.indexOf(attr)})" style="cursor: pointer;">
      <div class="flex-row">
        <h4>${attr.name}</h4>
        <span class="fee">${attr.entry_fee_usd === 0 ? 'Free' : '$' + attr.entry_fee_usd}</span>
      </div>
      <p class="meta"><i class="fas fa-tag"></i> ${attr.category}</p>
      <p class="meta"><i class="fas fa-clock"></i> ${attr.duration_hours} hours</p>
      <p class="meta" style="margin-top: 0.75rem; cursor: pointer; color: var(--primary-color); font-weight: 500;">View on Map →</p>
    </li>
  `).join('');

  const restaurantPaged = paginateItems(data.restaurants, 0);
  const restaurantContainer = document.getElementById('restaurant-list');
  restaurantContainer.innerHTML = restaurantPaged.items.map(rest => `
    <li class="card">
      <div class="flex-row">
        <h5>${rest.name}</h5>
        <span class="rating">⭐ ${rest.rating}</span>
      </div>
      <p class="meta"><i class="fas fa-utensils"></i> ${rest.cuisine}</p>
      <p class="meta"><i class="fas fa-dollar-sign"></i> ~$${rest.price_usd} per person</p>
      <div class="features">
        ${rest.features.map(f => `<span style="display: inline-block; margin-right: 0.5rem; margin-bottom: 0.5rem; color: var(--primary-color); font-size: 0.85rem;">✓ ${f}</span>`).join('')}
      </div>
    </li>
  `).join('');

  updatePageNavigation(hotelPaged.totalPages, attractionPaged.totalPages);
}

function updatePageNavigation(hotelPages, attractionPages) {
  const pageNav = document.getElementById('page-nav');
  const backBtn = pageNav.querySelector('[data-page="0"]');
  const nextBtn = pageNav.querySelector('[data-page="1"]');
  const indicator = document.getElementById('page-indicator');
  const maxPage = Math.max(hotelPages, attractionPages);
  if (maxPage > 1) {
    backBtn.style.display = currentHotelPage > 0 || currentAttractionPage > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = currentHotelPage < hotelPages - 1 || currentAttractionPage < attractionPages - 1 ? 'inline-block' : 'none';
    indicator.textContent = `Hotel Page ${currentHotelPage + 1}/${hotelPages} • Attraction Page ${currentAttractionPage + 1}/${attractionPages}`;
  } else {
    backBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    indicator.textContent = `Showing all hotels & attractions`;
  }
}

// --- 6. EVENT LISTENERS ---
function setupMenuToggle() {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const closeBtn = document.getElementById('close-btn');
  menuToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  });
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });
}

function attachDestinationListeners() {
  const buttons = document.querySelectorAll('.destination-btn');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      document.getElementById('sidebar').classList.remove('active');
      document.getElementById('sidebar-overlay').classList.remove('active');
      currentHotelPage = 0;
      currentAttractionPage = 0;
      buttons.forEach(btn => btn.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentDestination = parseInt(e.currentTarget.getAttribute('data-id'));
      const destData = getDestinationDetails(currentDestination);
      if (destData) renderDashboard(destData);
    });
  });
}

function attachCategoryListeners() {
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      destinationFilters.category = e.currentTarget.getAttribute('data-category');
      applyDestinationFilters();
    });
  });
}

function attachDestinationFilterListeners() {
  document.querySelectorAll('[data-filter]').forEach(filter => {
    filter.addEventListener('change', (e) => {
      destinationFilters[e.currentTarget.dataset.filter] = e.currentTarget.value;
      applyDestinationFilters();
    });
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    Object.keys(destinationFilters).forEach(key => {
      destinationFilters[key] = 'all';
    });
    document.querySelectorAll('[data-filter]').forEach(filter => {
      filter.value = 'all';
    });
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.category-btn[data-category="all"]').classList.add('active');
    applyDestinationFilters();
  });
}

function attachPageNavigation() {
  const pageNav = document.getElementById('page-nav');
  const backBtn = pageNav.querySelector('[data-page="0"]');
  const nextBtn = pageNav.querySelector('[data-page="1"]');
  backBtn.addEventListener('click', () => {
    if (currentHotelPage > 0) currentHotelPage--;
    if (currentAttractionPage > 0) currentAttractionPage--;
    const destData = getDestinationDetails(currentDestination);
    if (destData) renderDashboard(destData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    const destData = getDestinationDetails(currentDestination);
    const hotelPaged = paginateItems(destData.hotels, currentHotelPage);
    const attractionPaged = paginateItems(destData.attractions, currentAttractionPage);
    if (currentHotelPage < hotelPaged.totalPages - 1) currentHotelPage++;
    if (currentAttractionPage < attractionPaged.totalPages - 1) currentAttractionPage++;
    if (destData) renderDashboard(destData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function attachTabListeners() {
  const tabBtns = document.querySelectorAll('.detail-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.currentTarget.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
}

// --- 7. INITIALIZE APP ---
window.addEventListener('DOMContentLoaded', () => {
  renderDestinationButtons();
  setupMenuToggle();
  attachCategoryListeners();
  attachDestinationFilterListeners();
  attachPageNavigation();
  document.getElementById('detail-overlay').addEventListener('click', closeDetailModal);
  document.getElementById('detail-close').addEventListener('click', closeDetailModal);
  attachTabListeners();
  const initialData = getDestinationDetails(1);
  if (initialData) renderDashboard(initialData);
});