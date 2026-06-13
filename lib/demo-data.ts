export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const DEMO_PROFILE = {
  id: 'demo-user-1', name: 'Ola Omoriwo', email: 'ola@campAssist.co.uk',
  phone: '+44 7700 000111', role: 'camper' as const,
  festival_id: 'demo-festival-1', arrival_date: '2027-05-23', departure_date: '2027-05-26',
  created_at: '2026-01-01T00:00:00Z',
};

export const DEMO_ASSISTANT_PROFILE = {
  id: 'demo-assistant-1', name: 'Chidi Musa', email: 'chidi@campAssist.co.uk',
  phone: '+44 7700 000999', role: 'assistant' as const,
  festival_id: 'demo-festival-1', arrival_date: '2027-05-22', departure_date: '2027-05-27',
  created_at: '2026-01-01T00:00:00Z',
};

export const TENT_EXTRAS = [
  { id: 'e1', name: 'Inflatable Single Bed', emoji: '🛏️', desc: 'Comfortable self-inflating sleeping mat with pillow. Rolls up to the size of a water bottle.', price: 1500, unit: 'per night', category: 'bed' },
  { id: 'e2', name: 'Inflatable Double Bed', emoji: '🛏️', desc: 'Full double air mattress with electric pump included. Fits any 2-person+ tent.', price: 2500, unit: 'per night', category: 'bed' },
  { id: 'e3', name: 'Camping Stove & Gas', emoji: '🍳', desc: 'Compact 2-burner gas stove with 2 gas canisters. Perfect for cooking at your tent.', price: 1000, unit: 'flat fee', category: 'cooking' },
  { id: 'e4', name: 'Mini Kitchen Kit', emoji: '🥘', desc: 'Pot, pan, 2 plates, 2 mugs, cutlery set, chopping board and washing up supplies.', price: 1500, unit: 'flat fee', category: 'cooking' },
  { id: 'e5', name: 'Solar Lantern', emoji: '🔆', desc: 'Bright solar-powered LED lantern. Charges during the day, lights up your tent at night.', price: 800, unit: 'per night', category: 'lighting' },
  { id: 'e6', name: 'Camping Table & Chairs', emoji: '🪑', desc: 'Foldable table + 2 lightweight chairs. Set up outside your tent for meals and socialising.', price: 1200, unit: 'per night', category: 'furniture' },
  { id: 'e7', name: 'Festival Survival Kit', emoji: '🎒', desc: 'Waterproof poncho, hand warmers, ear plugs, phone dry bag, mini first aid kit, cable ties.', price: 2000, unit: 'flat fee', category: 'essentials' },
];

export const DEMO_FESTIVAL = {
  id: 'demo-festival-1', name: 'In It Together 2027', location: 'Margam Park, Wales',
  start_date: '2027-05-23', end_date: '2027-05-26', map_image_url: null,
  // Real coordinates around Margam Park, Wales (51.578, -3.729)
  map_pois: [
    { id: '1', name: 'Big Smoke Burgers', category: 'food', lat: 51.5798, lng: -3.7265, notes: 'Award-winning smash burgers · Open 11am–1am' },
    { id: '2', name: 'Pizza Republic', category: 'food', lat: 51.5785, lng: -3.7242, notes: 'Wood-fired Neapolitan pizza · Vegan options' },
    { id: '3', name: 'Vibe & Vegan', category: 'food', lat: 51.5778, lng: -3.7258, notes: '100% plant-based wraps & smoothies' },
    { id: '4', name: "Nando's Pop-up", category: 'food', lat: 51.5793, lng: -3.7282, notes: 'Festival exclusive PERi-PERi menu · Opens 12pm' },
    { id: '5', name: 'Main Stage', category: 'stage', lat: 51.5768, lng: -3.7315, notes: 'Headliners 8pm–11pm nightly · Capacity 40,000' },
    { id: '6', name: 'Jazz & Soul Tent', category: 'stage', lat: 51.5805, lng: -3.7228, notes: 'Intimate live jazz · Doors 6pm daily' },
    { id: '7', name: 'Electronic Arena', category: 'stage', lat: 51.5762, lng: -3.7295, notes: 'Late night techno & house · Runs till 3am' },
    { id: '8', name: 'The Green Bar', category: 'bar', lat: 51.5791, lng: -3.7262, notes: 'Craft beer, cocktails, mocktails · DJ from 8pm' },
    { id: '9', name: 'Prosecco Garden', category: 'bar', lat: 51.5782, lng: -3.7250, notes: 'Wine & prosecco garden · Relaxed vibes' },
    { id: '10', name: 'Toilet Block A', category: 'toilet', lat: 51.5787, lng: -3.7278, notes: '24 cubicles + accessible · Cleaned every 2hrs' },
    { id: '11', name: 'Showers & Toilets B', category: 'toilet', lat: 51.5796, lng: -3.7245, notes: '20 toilets + 8 hot showers (£2 token)' },
    { id: '12', name: 'First Aid', category: 'first_aid', lat: 51.5790, lng: -3.7270, notes: 'Paramedics on site 24/7 · Mental health support' },
    { id: '13', name: 'Water Refill', category: 'water', lat: 51.5785, lng: -3.7263, notes: 'Free water refills all day · Bring your bottle' },
    { id: '14', name: 'Festival Barbers', category: 'other', lat: 51.5794, lng: -3.7255, notes: 'Cuts, trims, braiding · Walk-in welcome' },
    { id: '15', name: 'Giant Games Zone', category: 'other', lat: 51.5776, lng: -3.7275, notes: 'Giant Jenga, Connect 4, axe throwing' },
    { id: '16', name: 'Charging Hub', category: 'other', lat: 51.5788, lng: -3.7268, notes: '100 charging points · All cables available' },
  ],
  created_at: '2026-01-01T00:00:00Z',
};

export const DEMO_TENT_TYPES = [
  {
    id: 'tent-1', festival_id: 'demo-festival-1', name: 'Solo Explorer', capacity: 1,
    description: 'Complete privacy for one. Lightweight, fast setup, mesh inner for airflow. Perfect for solo festival-goers who want their own space without the bulk.',
    price_per_day: 1800, damage_deposit: 3500, available_quantity: 10, images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=400&fit=crop',
    ], created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tent-2', festival_id: 'demo-festival-1', name: 'Buddy Duo', capacity: 2,
    description: 'Two sleeping spaces, shared porch, dual entry. The go-to choice for festival friends. Generous vestibule for your gear, excellent ventilation.',
    price_per_day: 2500, damage_deposit: 5000, available_quantity: 10, images: [
      'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&h=400&fit=crop',
    ], created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tent-3', festival_id: 'demo-festival-1', name: 'Privacy Pod', capacity: 2,
    description: 'Two completely separate compartments with individual zip entries and a shared vestibule. Ideal for friends who like their independence but want to share costs.',
    price_per_day: 3200, damage_deposit: 6000, available_quantity: 8, images: [
      'https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1566827971063-f7b37d46d8e9?w=600&h=400&fit=crop',
    ], created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tent-4', festival_id: 'demo-festival-1', name: 'Family Dome', capacity: 4,
    description: 'Full 1.9m standing height throughout. Separate bedroom compartment plus large living area for families. The ultimate festival home away from home.',
    price_per_day: 4000, damage_deposit: 7500, available_quantity: 6, images: [
      'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1496545672447-f699b503d270?w=600&h=400&fit=crop',
    ], created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tent-5', festival_id: 'demo-festival-1', name: 'Festival Lodge', capacity: 6,
    description: 'Three sleeping zones around a communal hub. The ultimate group base camp for six. Full 2.1m standing height throughout with massive shared living space.',
    price_per_day: 5500, damage_deposit: 10000, available_quantity: 4, images: [
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&h=400&fit=crop',
    ], created_at: '2026-01-01T00:00:00Z',
  },
];

export const DEMO_BOOKING = {
  id: 'demo-booking-1', camper_id: 'demo-user-1', tent_type_id: 'tent-2',
  festival_id: 'demo-festival-1', arrival_date: '2027-05-23', departure_date: '2027-05-26',
  status: 'pending' as const, assigned_assistant_id: null, notes: null,
  created_at: '2026-01-01T00:00:00Z', tent_type: DEMO_TENT_TYPES[1],
  extras: ['e1', 'e3'],
};

export const DEMO_REQUESTS = [
  {
    id: 'demo-req-1', camper_id: 'demo-user-1', festival_id: 'demo-festival-1',
    type: 'tent_setup' as const, description: 'Please set up near the main stage',
    location_description: 'Near main stage, section B, green tent with blue flag',
    status: 'complete' as const, assigned_assistant_id: 'demo-assistant-1',
    rating: 5, created_at: '2027-05-23T10:00:00Z',
  },
  {
    id: 'demo-req-2', camper_id: 'demo-user-1', festival_id: 'demo-festival-1',
    type: 'general' as const, description: 'Need help finding the jazz tent',
    location_description: 'Near the food court area, wearing yellow jacket',
    status: 'in_progress' as const, assigned_assistant_id: 'demo-assistant-1',
    rating: null, created_at: '2027-05-24T14:30:00Z',
  },
];

export const VENDOR_REVIEWS: Record<string, { id: string; user: string; rating: number; comment: string; date: string }[]> = {
  '1': [
    { id: 'r1', user: 'Marcus T.', rating: 5, comment: 'Best burger I have had at any festival. The double smash with cheese sauce was unreal. Long queue but absolutely worth it!', date: '2027-05-24' },
    { id: 'r2', user: 'Priya S.', rating: 5, comment: 'Loaded fries were incredible. Staff were friendly even when it got really busy. Will be coming back every day!', date: '2027-05-23' },
    { id: 'r3', user: 'Dele O.', rating: 4, comment: 'Great food but the queue at peak times is long. Worth pre-planning your visit before 1pm or after 9pm.', date: '2027-05-23' },
  ],
  '2': [
    { id: 'r4', user: 'Funke A.', rating: 5, comment: 'Genuinely the best pizza I have had outside Italy. The margherita with buffalo mozzarella was stunning.', date: '2027-05-24' },
    { id: 'r5', user: 'Tobi R.', rating: 4, comment: 'The vegan mushroom truffle pizza was exceptional. Slightly pricey but quality matches it.', date: '2027-05-23' },
  ],
  '5': [
    { id: 'r6', user: 'Ola O.', rating: 5, comment: 'The headliner set was electric. Sound system is incredible — can feel the bass in your chest even 30 rows back.', date: '2027-05-24' },
    { id: 'r7', user: 'Chidi M.', rating: 5, comment: 'Best festival stage setup I have seen. The light show alone is worth the ticket price.', date: '2027-05-23' },
  ],
  '8': [
    { id: 'r8', user: 'Amara L.', rating: 5, comment: 'Cocktails are genuinely high quality — not watered down like most festival bars. The espresso martini was perfect.', date: '2027-05-24' },
    { id: 'r9', user: 'Marcus T.', rating: 4, comment: 'Good craft beer selection. Staff keep the queue moving fast. Gets very packed after 10pm though.', date: '2027-05-23' },
    { id: 'r10', user: 'Priya S.', rating: 5, comment: 'The mocktails are just as good as the cocktails. Great vibe, good music, would make this my base camp for the weekend.', date: '2027-05-24' },
  ],
  '3': [
    { id: 'r11', user: 'Dele O.', rating: 5, comment: 'As a vegan this is always the hardest place to eat well at festivals. Vibe & Vegan absolutely nailed it. The jackfruit wrap was incredible.', date: '2027-05-23' },
    { id: 'r12', user: 'Funke A.', rating: 4, comment: 'Smoothie bowls were amazing. Wish the portion sizes were slightly bigger but the quality is there.', date: '2027-05-24' },
  ],
};

export const DEMO_JOBS = [
  { id: 'demo-job-1', camper_id: 'demo-user-2', festival_id: 'demo-festival-1', type: 'tent_setup' as const, description: '', location_description: 'Near main stage, section B, green tent with blue flag', status: 'pending' as const, assigned_assistant_id: null, rating: null, created_at: '2027-05-23T09:00:00Z', camper: { name: 'Marcus T.', phone: '+44 7700 123456' } },
  { id: 'demo-job-2', camper_id: 'demo-user-3', festival_id: 'demo-festival-1', type: 'general' as const, description: 'Lost near food court, needs navigation help', location_description: 'Near food court, yellow jacket', status: 'pending' as const, assigned_assistant_id: null, rating: null, created_at: '2027-05-23T09:05:00Z', camper: { name: 'Priya S.', phone: '+44 7700 654321' } },
  { id: 'demo-job-3', camper_id: 'demo-user-4', festival_id: 'demo-festival-1', type: 'tent_collection' as const, description: 'Leaving today, please collect tent', location_description: 'Water refill area, red hoodie', status: 'pending' as const, assigned_assistant_id: null, rating: null, created_at: '2027-05-23T09:10:00Z', camper: { name: 'Dele O.', phone: '+44 7700 112233' } },
];

export const DEMO_COMPLETED_JOBS = [
  { id: 'cj-1', type: 'tent_setup' as const, description: '', location_description: 'Section B', status: 'complete' as const, camper_id: 'u1', festival_id: 'demo-festival-1', assigned_assistant_id: 'demo-assistant-1', rating: 5, created_at: '2027-05-23T10:30:00Z', camper: { name: 'Marcus T.' } },
  { id: 'cj-2', type: 'general' as const, description: '', location_description: 'Food court', status: 'complete' as const, camper_id: 'u2', festival_id: 'demo-festival-1', assigned_assistant_id: 'demo-assistant-1', rating: 5, created_at: '2027-05-24T13:45:00Z', camper: { name: 'Priya S.' } },
  { id: 'cj-3', type: 'tent_collection' as const, description: '', location_description: 'Water refill area', status: 'complete' as const, camper_id: 'u3', festival_id: 'demo-festival-1', assigned_assistant_id: 'demo-assistant-1', rating: 4, created_at: '2027-05-25T09:00:00Z', camper: { name: 'Dele O.' } },
];

export const DEMO_ADMIN_BOOKINGS = [
  { id: 'ab-1', camper_id: 'u1', tent_type_id: 'tent-2', festival_id: 'demo-festival-1', arrival_date: '2027-05-23', departure_date: '2027-05-26', status: 'pending' as const, assigned_assistant_id: null, notes: null, created_at: '2027-01-01T00:00:00Z', camper: { name: 'Ola O.', phone: '+44 7000 000000' }, tent_type: DEMO_TENT_TYPES[1] },
  { id: 'ab-2', camper_id: 'u2', tent_type_id: 'tent-3', festival_id: 'demo-festival-1', arrival_date: '2027-05-23', departure_date: '2027-05-26', status: 'confirmed' as const, assigned_assistant_id: null, notes: null, created_at: '2027-01-02T00:00:00Z', camper: { name: 'Marcus T.', phone: '+44 7700 123456' }, tent_type: DEMO_TENT_TYPES[2] },
  { id: 'ab-3', camper_id: 'u3', tent_type_id: 'tent-4', festival_id: 'demo-festival-1', arrival_date: '2027-05-23', departure_date: '2027-05-25', status: 'tent_setup' as const, assigned_assistant_id: 'demo-assistant-1', notes: null, created_at: '2027-01-03T00:00:00Z', camper: { name: 'Priya S.', phone: '+44 7700 654321' }, tent_type: DEMO_TENT_TYPES[3] },
];

export const DEMO_ADMIN_REQUESTS = [
  { id: 'ar-1', camper_id: 'u1', festival_id: 'demo-festival-1', type: 'tent_setup' as const, description: '', location_description: 'Section B near main stage', status: 'in_progress' as const, assigned_assistant_id: 'demo-assistant-1', rating: null, created_at: '2027-05-23T09:00:00Z', camper: { name: 'Ola O.' } },
  { id: 'ar-2', camper_id: 'u2', festival_id: 'demo-festival-1', type: 'general' as const, description: 'Navigation help', location_description: 'Near food court', status: 'pending' as const, assigned_assistant_id: null, rating: null, created_at: '2027-05-23T10:00:00Z', camper: { name: 'Priya S.' } },
  { id: 'ar-3', camper_id: 'u3', festival_id: 'demo-festival-1', type: 'tent_collection' as const, description: '', location_description: 'Water refill area', status: 'accepted' as const, assigned_assistant_id: 'demo-assistant-1', rating: null, created_at: '2027-05-23T11:00:00Z', camper: { name: 'Dele O.' } },
];

export const DEMO_ADMIN_STAFF = [
  { profile: { ...DEMO_ASSISTANT_PROFILE, id: 'a1', name: 'Chidi M.' }, available: true,  status: 'active'    as const },
  { profile: { ...DEMO_ASSISTANT_PROFILE, id: 'a2', name: 'Amara L.' }, available: false, status: 'active'    as const },
  { profile: { ...DEMO_ASSISTANT_PROFILE, id: 'a3', name: 'Tobi R.'  }, available: true,  status: 'suspended' as const },
];

// ── Vendor demo data ─────────────────────────────────────────────────────────

export const DEMO_VENDOR_PROFILE = {
  id: 'demo-vendor-1',
  name: 'The Green Bar',
  contact_name: 'Tom Adeyemi',
  email: 'tom@thegreenbar.co.uk',
  phone: '+44 7700 008844',
  category: 'bar' as const,
  description: 'Craft beer, cocktails & mocktails. DJ from 8pm nightly.',
  lat: 51.5791,
  lng: -3.7262,
  pin_confirmed: true,
  pin_description: 'Adjacent to the Jazz & Soul Tent, look for the neon green sign',
  opening_hours: '2pm – 3am',
  festival_id: 'demo-festival-1',
  poi_id: '8',
};

export const DEMO_VENDORS = [
  {
    id: 'v1', poi_id: '1', name: 'Big Smoke Burgers', category: 'food' as const,
    lat: 51.5798, lng: -3.7265, contact: 'James Okafor',
    description: 'Award-winning smash burgers', pin_confirmed: true, opening_hours: '11am–1am',
  },
  {
    id: 'v2', poi_id: '2', name: 'Pizza Republic', category: 'food' as const,
    lat: 51.5785, lng: -3.7242, contact: 'Maria Rossi',
    description: 'Wood-fired Neapolitan pizza', pin_confirmed: true, opening_hours: '12pm–midnight',
  },
  {
    id: 'v3', poi_id: '8', name: 'The Green Bar', category: 'bar' as const,
    lat: 51.5791, lng: -3.7262, contact: 'Tom Adeyemi',
    description: 'Craft beer, cocktails & mocktails', pin_confirmed: true, opening_hours: '2pm–3am',
  },
  {
    id: 'v4', poi_id: '3', name: 'Vibe & Vegan', category: 'food' as const,
    lat: 51.5778, lng: -3.7258, contact: 'Zara Nwosu',
    description: '100% plant-based wraps & smoothies', pin_confirmed: false, opening_hours: '10am–10pm',
  },
];

export type VendorScheduleType = 'performance' | 'free_tasting' | 'competition' | 'workshop' | 'special' | 'promotion';

export interface VendorScheduleEvent {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_category: 'food' | 'bar' | 'other';
  event_name: string;
  day: 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  description: string;
  type: VendorScheduleType;
  is_free: boolean;
  emoji: string;
  capacity: number | null;
  is_hot: boolean;
  poi_id: string;
}

export const DEMO_VENDOR_SCHEDULES: VendorScheduleEvent[] = [
  // Big Smoke Burgers
  {
    id: 'sch-1', vendor_id: 'v1', vendor_name: 'Big Smoke Burgers', vendor_category: 'food',
    event_name: 'Secret Menu Launch', day: 'Friday', start_time: '12:00', end_time: '13:00',
    description: 'Be first to try our exclusive festival-only secret menu. Limited to 50 people — get there early!',
    type: 'special', is_free: false, emoji: '🍔', capacity: 50, is_hot: true, poi_id: '1',
  },
  {
    id: 'sch-2', vendor_id: 'v1', vendor_name: 'Big Smoke Burgers', vendor_category: 'food',
    event_name: 'Burger Eating Challenge', day: 'Saturday', start_time: '16:00', end_time: '17:00',
    description: 'Can you eat 3 double smash burgers in 10 minutes? Winner gets free food for the whole weekend!',
    type: 'competition', is_free: true, emoji: '🏆', capacity: 10, is_hot: true, poi_id: '1',
  },
  {
    id: 'sch-3', vendor_id: 'v1', vendor_name: 'Big Smoke Burgers', vendor_category: 'food',
    event_name: 'Happy Hour: 2-for-1 Burgers', day: 'Sunday', start_time: '15:00', end_time: '17:00',
    description: '2-for-1 on all burgers during happy hour. First come, first served — no pre-orders.',
    type: 'promotion', is_free: false, emoji: '⏰', capacity: null, is_hot: false, poi_id: '1',
  },
  // The Green Bar
  {
    id: 'sch-4', vendor_id: 'v3', vendor_name: 'The Green Bar', vendor_category: 'bar',
    event_name: 'Tango & Cocktails Night', day: 'Friday', start_time: '20:00', end_time: '22:00',
    description: 'Live tango performance by El Fuego duo while you sip signature cocktails. Free to watch — drinks at normal price.',
    type: 'performance', is_free: true, emoji: '💃', capacity: 80, is_hot: true, poi_id: '8',
  },
  {
    id: 'sch-5', vendor_id: 'v3', vendor_name: 'The Green Bar', vendor_category: 'bar',
    event_name: 'Stand-Up Comedy Set', day: 'Saturday', start_time: '21:00', end_time: '22:30',
    description: 'Comedian Kemi Osei brings a festival-exclusive 90-minute set. Limited bar space — get there early!',
    type: 'performance', is_free: true, emoji: '🎤', capacity: 60, is_hot: true, poi_id: '8',
  },
  {
    id: 'sch-6', vendor_id: 'v3', vendor_name: 'The Green Bar', vendor_category: 'bar',
    event_name: 'Morning After Mocktails', day: 'Saturday', start_time: '10:00', end_time: '12:00',
    description: 'Nurse your festival morning with expertly crafted zero-alcohol mocktails. Full flavour, zero regrets.',
    type: 'special', is_free: false, emoji: '🥤', capacity: null, is_hot: false, poi_id: '8',
  },
  // Vibe & Vegan
  {
    id: 'sch-7', vendor_id: 'v4', vendor_name: 'Vibe & Vegan', vendor_category: 'food',
    event_name: 'Free Smoothie Tasting', day: 'Friday', start_time: '10:00', end_time: '12:00',
    description: 'Try our new Tropical Storm and Berry Blast smoothies for free. First 100 campers only — seriously!',
    type: 'free_tasting', is_free: true, emoji: '🥤', capacity: 100, is_hot: true, poi_id: '3',
  },
  {
    id: 'sch-8', vendor_id: 'v4', vendor_name: 'Vibe & Vegan', vendor_category: 'food',
    event_name: 'Vegan Cooking Demo', day: 'Saturday', start_time: '14:00', end_time: '15:00',
    description: 'Watch Chef Zara prepare our most popular dishes from scratch. Take the recipe card home!',
    type: 'workshop', is_free: true, emoji: '👩‍🍳', capacity: 30, is_hot: false, poi_id: '3',
  },
  // Pizza Republic
  {
    id: 'sch-9', vendor_id: 'v2', vendor_name: 'Pizza Republic', vendor_category: 'food',
    event_name: 'Pizza Making Workshop', day: 'Sunday', start_time: '13:00', end_time: '14:30',
    description: 'Learn to stretch and top your own Neapolitan pizza with Chef Maria. You eat what you make!',
    type: 'workshop', is_free: false, emoji: '🍕', capacity: 12, is_hot: false, poi_id: '2',
  },
  {
    id: 'sch-10', vendor_id: 'v2', vendor_name: 'Pizza Republic', vendor_category: 'food',
    event_name: 'White Truffle Special', day: 'Saturday', start_time: '18:00', end_time: '20:00',
    description: 'Limited run of white truffle & buffalo mozzarella pizza. Only 20 made daily — sold out both previous days!',
    type: 'special', is_free: false, emoji: '🌿', capacity: 20, is_hot: true, poi_id: '2',
  },
];

// ── Misconduct reports ────────────────────────────────────────────────────────

export type MisconductType =
  | 'rude_behavior'
  | 'no_show'
  | 'damaged_property'
  | 'harassment'
  | 'theft'
  | 'other';

export type ReportStatus = 'pending_review' | 'under_review' | 'resolved' | 'dismissed';

export interface AssistantReport {
  id: string;
  request_id: string;
  request_type: string;
  camper_id: string;
  camper_name: string;
  assistant_id: string;
  assistant_name: string;
  misconduct_type: MisconductType;
  description: string;
  image_url: string | null;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
}

export const DEMO_REPORTS: AssistantReport[] = [
  {
    id: 'report-1',
    request_id: 'demo-req-1',
    request_type: 'tent_setup',
    camper_id: 'demo-user-1',
    camper_name: 'Ola O.',
    assistant_id: 'a3',
    assistant_name: 'Tobi R.',
    misconduct_type: 'rude_behavior',
    description: 'The assistant arrived 45 minutes late and was dismissive when I pointed it out. He made sarcastic comments about the location of my tent and left without confirming everything was set up properly.',
    image_url: null,
    status: 'under_review',
    admin_note: 'Contacted Tobi R. Awaiting his response. Second complaint this weekend.',
    created_at: '2027-05-23T11:30:00Z',
  },
  {
    id: 'report-2',
    request_id: 'ar-3',
    request_type: 'tent_collection',
    camper_id: 'u3',
    camper_name: 'Dele O.',
    assistant_id: 'a1',
    assistant_name: 'Chidi M.',
    misconduct_type: 'damaged_property',
    description: 'When collecting the tent, the assistant accidentally bent the main pole and denied it happened. I have photos of the damage.',
    image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop',
    status: 'pending_review',
    admin_note: null,
    created_at: '2027-05-25T16:10:00Z',
  },
];

// ── Festival onboarding ───────────────────────────────────────────────────────

export const DEMO_ONBOARDED_FESTIVALS = [
  {
    id: 'demo-festival-1',
    name: 'In It Together 2027',
    organiser: 'In It Together Ltd',
    organiser_email: 'ops@inittogether.co.uk',
    organiser_phone: '+44 29 2000 0001',
    event_type: 'Music Festival',
    start_date: '2027-05-23',
    end_date: '2027-05-26',
    venue: 'Margam Park',
    location: 'Margam Park, Port Talbot, Wales, SA13 2TJ',
    expected_attendance: 60000,
    expected_vendors: 45,
    camping_zones: 8,
    services: ['tent_booking', 'camp_assistance', 'navigation', 'social'],
    site_plan_file: 'margam_site_plan.geojson',
    site_plan_format: 'GeoJSON',
    status: 'active' as const,
    onboarded_at: '2026-11-15T09:00:00Z',
    notes: 'Returning client — 4th year. Site plan updated for new Main Stage location.',
  },
  {
    id: 'demo-festival-2',
    name: 'Green Fields 2027',
    organiser: 'Green Fields Events CIC',
    organiser_email: 'hello@greenfieldsevents.co.uk',
    organiser_phone: '+44 117 929 0001',
    event_type: 'Community Festival',
    start_date: '2027-07-12',
    end_date: '2027-07-14',
    venue: 'Ashton Court Estate',
    location: 'Ashton Court Estate, Bristol, BS41 9JN',
    expected_attendance: 15000,
    expected_vendors: 20,
    camping_zones: 3,
    services: ['camp_assistance', 'navigation'],
    site_plan_file: null,
    site_plan_format: null,
    status: 'pending_plan' as const,
    onboarded_at: '2027-01-22T11:30:00Z',
    notes: 'Awaiting site plan upload from organiser. First year with CampAssist.',
  },
  {
    id: 'demo-festival-3',
    name: 'Woodland Beats 2027',
    organiser: 'Woodland Collective',
    organiser_email: 'info@woodlandbeats.co.uk',
    organiser_phone: '+44 121 200 0002',
    event_type: 'Music Festival',
    start_date: '2027-08-08',
    end_date: '2027-08-10',
    venue: 'Kenilworth Forest',
    location: 'Kenilworth Forest Estate, Warwickshire, CV8 2LN',
    expected_attendance: 8000,
    expected_vendors: 12,
    camping_zones: 2,
    services: ['tent_booking', 'camp_assistance', 'navigation', 'social'],
    site_plan_file: 'woodland_beats_plan.kml',
    site_plan_format: 'KML',
    status: 'review' as const,
    onboarded_at: '2027-02-05T14:00:00Z',
    notes: 'Site plan received in KML format. Conversion to GeoJSON in progress.',
  },
];
