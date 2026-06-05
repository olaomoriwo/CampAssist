export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const DEMO_PROFILE = {
  id: 'demo-user-1',
  name: 'Ola',
  email: 'demo@campAssist.app',
  phone: '+44 7000 000000',
  role: 'camper' as const,
  festival_id: 'demo-festival-1',
  arrival_date: '2027-05-23',
  departure_date: '2027-05-26',
  created_at: '2026-01-01T00:00:00Z',
};

export const DEMO_ASSISTANT_PROFILE = {
  id: 'demo-assistant-1',
  name: 'Chidi',
  email: 'chidi@campAssist.app',
  phone: '+44 7000 000001',
  role: 'assistant' as const,
  festival_id: 'demo-festival-1',
  arrival_date: '2027-05-23',
  departure_date: '2027-05-26',
  created_at: '2026-01-01T00:00:00Z',
};

export const DEMO_FESTIVAL = {
  id: 'demo-festival-1',
  name: 'In It Together 2027',
  location: 'Margam Park, Wales',
  start_date: '2027-05-23',
  end_date: '2027-05-26',
  map_image_url: null,
  map_pois: [
    { id: '1', name: 'Big Smoke Burgers', category: 'food' as const, lat: 130, lng: 110, notes: 'Award-winning smash burgers, loaded fries' },
    { id: '2', name: 'Pizza Republic', category: 'food' as const, lat: 170, lng: 95, notes: 'Wood-fired Neapolitan pizza' },
    { id: '3', name: 'Vibe & Vegan', category: 'food' as const, lat: 215, lng: 125, notes: '100% plant-based wraps and bowls' },
    { id: '4', name: 'Main Stage', category: 'stage' as const, lat: 60, lng: 80, notes: 'Headliners 8pm nightly' },
    { id: '5', name: 'Jazz & Soul Tent', category: 'stage' as const, lat: 270, lng: 95, notes: 'Doors 6pm daily' },
    { id: '6', name: 'Electronic Arena', category: 'stage' as const, lat: 40, lng: 190, notes: 'Late night, runs till 3am' },
    { id: '7', name: 'Toilet Block A', category: 'toilet' as const, lat: 140, lng: 200, notes: 'Cleaned every 2 hours' },
    { id: '8', name: 'Showers & Toilets B', category: 'toilet' as const, lat: 290, lng: 170, notes: 'Hot showers available (£2 token)' },
    { id: '9', name: 'The Green Bar', category: 'bar' as const, lat: 155, lng: 160, notes: 'Craft beer, cocktails, live DJ from 8pm' },
    { id: '10', name: 'Prosecco Garden', category: 'bar' as const, lat: 195, lng: 138, notes: 'Garden seating, wine and prosecco' },
    { id: '11', name: 'Festival Barbers', category: 'other' as const, lat: 230, lng: 155, notes: 'Cuts, trims, braiding. Walk-in welcome' },
    { id: '12', name: 'Giant Games Zone', category: 'other' as const, lat: 100, lng: 170, notes: 'Giant Jenga, Connect 4, axe throwing' },
    { id: '13', name: 'Charging Hub', category: 'other' as const, lat: 155, lng: 185, notes: '100 charging points, all cables available' },
    { id: '14', name: 'First Aid', category: 'first_aid' as const, lat: 175, lng: 195, notes: 'Paramedics on site 24/7' },
    { id: '15', name: 'Water Refill', category: 'water' as const, lat: 138, lng: 172, notes: 'Free water refills all day' },
  ],
  created_at: '2026-01-01T00:00:00Z',
};

export const DEMO_TENT_TYPES = [
  {
    id: 'tent-1',
    festival_id: 'demo-festival-1',
    name: 'Solo Explorer',
    capacity: 1,
    description: 'Complete privacy for one. Lightweight, fast setup, mesh inner for airflow.',
    price_per_day: 1800,
    damage_deposit: 3500,
    available_quantity: 10,
    images: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tent-2',
    festival_id: 'demo-festival-1',
    name: 'Buddy Duo',
    capacity: 2,
    description: 'Two sleeping spaces, shared porch, dual entry. Social and spacious.',
    price_per_day: 2500,
    damage_deposit: 5000,
    available_quantity: 10,
    images: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tent-3',
    festival_id: 'demo-festival-1',
    name: 'Privacy Pod',
    capacity: 2,
    description: 'Two completely separate compartments with individual zip entries and a shared vestibule.',
    price_per_day: 3200,
    damage_deposit: 6000,
    available_quantity: 8,
    images: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tent-4',
    festival_id: 'demo-festival-1',
    name: 'Family Dome',
    capacity: 4,
    description: 'Full standing height. Separate bedroom compartment plus large living area.',
    price_per_day: 4000,
    damage_deposit: 7500,
    available_quantity: 6,
    images: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tent-5',
    festival_id: 'demo-festival-1',
    name: 'Festival Lodge',
    capacity: 6,
    description: 'Three sleeping zones around a communal hub. The ultimate group base camp.',
    price_per_day: 5500,
    damage_deposit: 10000,
    available_quantity: 4,
    images: [],
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const DEMO_BOOKING = {
  id: 'demo-booking-1',
  camper_id: 'demo-user-1',
  tent_type_id: 'tent-2',
  festival_id: 'demo-festival-1',
  arrival_date: '2027-05-23',
  departure_date: '2027-05-26',
  status: 'pending' as const,
  assigned_assistant_id: null,
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
  tent_type: DEMO_TENT_TYPES[1],
};

export const DEMO_REQUESTS = [
  {
    id: 'demo-req-1',
    camper_id: 'demo-user-1',
    festival_id: 'demo-festival-1',
    type: 'tent_setup' as const,
    description: 'Please set up near the main stage',
    location_description: 'Near main stage, section B, green tent with blue flag',
    status: 'complete' as const,
    assigned_assistant_id: 'demo-assistant-1',
    rating: 5,
    created_at: '2027-05-23T10:00:00Z',
  },
  {
    id: 'demo-req-2',
    camper_id: 'demo-user-1',
    festival_id: 'demo-festival-1',
    type: 'general' as const,
    description: 'Need help finding the jazz tent',
    location_description: 'Near the food court area, wearing yellow jacket',
    status: 'in_progress' as const,
    assigned_assistant_id: 'demo-assistant-1',
    rating: null,
    created_at: '2027-05-24T14:30:00Z',
  },
];

export const DEMO_JOBS = [
  {
    id: 'demo-job-1',
    camper_id: 'demo-user-2',
    festival_id: 'demo-festival-1',
    type: 'tent_setup' as const,
    description: '',
    location_description: 'Near main stage, section B, green tent with blue flag',
    status: 'pending' as const,
    assigned_assistant_id: null,
    rating: null,
    created_at: '2027-05-23T09:00:00Z',
    camper: { name: 'Marcus T.', phone: '+44 7700 123456' },
  },
  {
    id: 'demo-job-2',
    camper_id: 'demo-user-3',
    festival_id: 'demo-festival-1',
    type: 'general' as const,
    description: 'Lost near food court, needs navigation help',
    location_description: 'Near food court, yellow jacket',
    status: 'pending' as const,
    assigned_assistant_id: null,
    rating: null,
    created_at: '2027-05-23T09:05:00Z',
    camper: { name: 'Priya S.', phone: '+44 7700 654321' },
  },
  {
    id: 'demo-job-3',
    camper_id: 'demo-user-4',
    festival_id: 'demo-festival-1',
    type: 'tent_collection' as const,
    description: 'Leaving today, please collect tent',
    location_description: 'Water refill area, red hoodie',
    status: 'pending' as const,
    assigned_assistant_id: null,
    rating: null,
    created_at: '2027-05-23T09:10:00Z',
    camper: { name: 'Dele O.', phone: '+44 7700 112233' },
  },
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
  { profile: { ...DEMO_ASSISTANT_PROFILE, id: 'a1', name: 'Chidi M.' }, available: true },
  { profile: { ...DEMO_ASSISTANT_PROFILE, id: 'a2', name: 'Amara L.' }, available: false },
  { profile: { ...DEMO_ASSISTANT_PROFILE, id: 'a3', name: 'Tobi R.' }, available: true },
];
