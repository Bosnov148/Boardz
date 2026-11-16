const STORAGE_KEY = 'boardz_db_v3';
const SESSION_KEY = 'boardz_session_v3';
const MAX_PRICE   = 25000;

const STREETS = [
  "Roxas Avenue","Ilustre Street","J.P. Laurel Avenue","McArthur Highway","Quimpo Boulevard",
  "Sales Street","Ponciano Street","Bonifacio Street","Bolton Street","Anda Street",
  "San Pedro Street","C.M. Recto Street","Claveria Street","Emilio Jacinto Street","Pelayo Street",
  "Palma Gil Street","V. Mapa Street","Mabini Street","Quezon Boulevard","Dacudao Avenue",
  "Buhangin Road","Torres Street","E. Quirino Avenue","Ramon Magsaysay Avenue","Sobrecarey Street",
  "Camus Street","Cabaguio Avenue","Milan Street","Monteverde Avenue","Rizal Street",
  "Legaspi Street","Lapu-Lapu Street","Magallanes Street","Pichon Street","Gempesaw Street",
  "Tionko Avenue","Circumferential Road","Elpidio Quirino Avenue","Lizada Street","Duterte Street"
];

const BARANGAYS = [
  "Poblacion","Obrero","Matina","Talomo","Buhangin","Lanang","Agdao","Sasa","Toril",
  "Calinan","Mintal","Bago Gallera","Catalunan Grande","Maa","Bangkal","Wilfredo Aquino",
  "Bajada","Ecoland","Bucana","19-B","20-B","40-D","Tugbok","Cabantian","Indangan","Panacan"
];

const TYPES = ["Bedspace","Room","Studio","Apartment","Boarding House","Dormitory"];

const AMENITIES = [
  "WiFi","Aircon","Electric Fan","Own CR","Shared CR","Water Included","Electricity Included",
  "Cooking Allowed","Parking","CCTV","Laundry Area","Study Desk","Bed Frame","Cabinet",
  "24/7 Security","Pet Friendly"
];

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop&auto=format&q=80'
];

let db = { users: [], listings: [], bookings: [], favorites: {}, messages: [] };
let session = null;

const state = {
  view: 'home',
  detailId: null,
  editId: null,
  authMode: 'login',
  adminTab: 'overview',
  conv: null,
  filter: { q:'', type:'all', barangay:'all', maxPrice: MAX_PRICE, sort:'newest' }
};

function seed() {
  const now = Date.now();
  const mk = (i, o) => Object.assign({
    id: 'l_' + i,
    createdAt: now - i * 86400000,
    cover: i % COVER_IMAGES.length,
    rating: 4.5,
    reviews: []
  }, o);

  const listings = [
    mk(1, {
      title: 'Sunny Bedspace near USEP', type: 'Bedspace', price: 1800,
      street: 'Emilio Jacinto Street', barangay: 'Obrero', ownerId: 'u_maria', rating: 4.7, cover: 0,
      description: 'A bright, airy bedspace just a 7-minute walk to the University of Southeastern Philippines. Comes with a study desk, a sturdy bed frame, and a cabinet. The house has a shared kitchen and a small garden where you can have your morning coffee. Very quiet neighborhood — perfect for students.',
      amenities: ['WiFi','Electric Fan','Shared CR','Water Included','Cooking Allowed','Study Desk','Bed Frame','Cabinet'],
      reviews: [
        { name: 'Aira D.', rating: 5, text: 'Super cozy and the owner is very approachable. Walking distance to school!' },
        { name: 'Ken M.', rating: 4.5, text: 'Good value for money. Water pressure is strong and WiFi is reliable.' }
      ]
    }),
    mk(2, {
      title: 'Cozy Studio at Abreeza Area', type: 'Studio', price: 15000,
      street: 'J.P. Laurel Avenue', barangay: 'Bajada', ownerId: 'u_jose', rating: 4.9, cover: 1,
      description: 'Fully furnished studio unit steps away from Abreeza Mall and walking distance to the Bajada business strip. Includes aircon, a queen bed, a kitchenette, and a balcony overlooking the city. Ideal for young professionals working in the Lanang–Bajada corridor.',
      amenities: ['WiFi','Aircon','Own CR','Water Included','Electricity Included','Cooking Allowed','Parking','CCTV','24/7 Security','Laundry Area'],
      reviews: [
        { name: 'Bea R.', rating: 5, text: 'Exactly as pictured. The balcony view at night is lovely.' },
        { name: 'Marco T.', rating: 4.8, text: 'Very safe building, and the mall is literally next door.' }
      ]
    }),
    mk(3, {
      title: 'Student-Friendly Room along Anda', type: 'Room', price: 3500,
      street: 'Anda Street', barangay: 'Poblacion', ownerId: 'u_maria', rating: 4.5, cover: 2,
      description: 'A private room in a shared boarding house right in the heart of downtown Davao. Walking distance to San Pedro Cathedral, the City Hall, and several universities. The room fits a single bed, a desk, and a closet. Shared comfort room and a common living area.',
      amenities: ['WiFi','Electric Fan','Shared CR','Water Included','Study Desk','Bed Frame','Cabinet'],
      reviews: [
        { name: 'Jessa L.', rating: 4.5, text: 'Very accessible. Everything is walking distance — jeepneys everywhere.' }
      ]
    }),
    mk(4, {
      title: 'Modern Apartment near SM Lanang', type: 'Apartment', price: 18000,
      street: 'J.P. Laurel Avenue', barangay: 'Lanang', ownerId: 'u_jose', rating: 4.8, cover: 3,
      description: 'Two-bedroom apartment in a quiet compound minutes from SM Lanang Premier and the airport road. Comes with a full kitchen, a dining area, and a small laundry space. Perfect for small families or a group of working friends.',
      amenities: ['WiFi','Aircon','Own CR','Water Included','Cooking Allowed','Parking','CCTV','24/7 Security','Laundry Area','Pet Friendly'],
      reviews: [
        { name: 'The Lim Family', rating: 5, text: 'Spacious and clean. Our kids love the little garden out front.' }
      ]
    }),
    mk(5, {
      title: 'Boarding House in Matina', type: 'Boarding House', price: 2500,
      street: 'Quimpo Boulevard', barangay: 'Matina', ownerId: 'u_admin', rating: 4.3, cover: 4,
      description: 'Affordable rooms in a well-kept boarding house along Quimpo Boulevard. Each room has its own electric fan and cabinet. Shared kitchen and two shared comfort rooms. Very near Matina Town Square, NCCC Mall, and jeepney routes going downtown.',
      amenities: ['WiFi','Electric Fan','Shared CR','Water Included','Cooking Allowed','Bed Frame','Cabinet'],
      reviews: [
        { name: 'Rico P.', rating: 4, text: 'Good location for the price. The owners are responsive to repairs.' }
      ]
    }),
    mk(6, {
      title: 'Quiet Room along Roxas Avenue', type: 'Room', price: 4500,
      street: 'Roxas Avenue', barangay: 'Poblacion', ownerId: 'u_maria', rating: 4.6, cover: 5,
      description: 'A calm, well-lit room on the upper floor of a family home along Roxas Avenue. You get your own comfort room and a small balcony facing the tree-lined street. The family downstairs is friendly and the area is very safe at night.',
      amenities: ['WiFi','Aircon','Own CR','Water Included','Electricity Included','Study Desk','Bed Frame','Cabinet','CCTV'],
      reviews: [
        { name: 'Nadine C.', rating: 4.6, text: 'Lovely room, lovely hosts. The balcony is my favorite spot.' }
      ]
    }),
    mk(7, {
      title: 'Budget Bedspace in Bangkal', type: 'Bedspace', price: 1500,
      street: 'McArthur Highway', barangay: 'Bangkal', ownerId: 'u_jose', rating: 4.2, cover: 6,
      description: 'The most affordable bedspace in the area — great for students on a tight budget. Bunk-style setup with a personal cabinet and a shared study table. Jeepneys going to downtown and Matina pass right in front of the house.',
      amenities: ['WiFi','Electric Fan','Shared CR','Water Included','Study Desk','Cabinet'],
      reviews: [
        { name: 'Tonio G.', rating: 4, text: 'Cheap and cheerful. Good for a student like me.' }
      ]
    }),
    mk(8, {
      title: 'Furnished Studio in Ecoland', type: 'Studio', price: 12000,
      street: 'Quimpo Boulevard', barangay: 'Talomo', ownerId: 'u_admin', rating: 4.8, cover: 7,
      description: 'A tidy studio unit inside a gated compound in Ecoland. Fully furnished with aircon, a double bed, a sofa, and a kitchenette. Minutes from SM City Davao, Ecoland Bus Terminal, and the Davao Coastal Road. Free water and a designated parking slot.',
      amenities: ['WiFi','Aircon','Own CR','Water Included','Cooking Allowed','Parking','CCTV','24/7 Security','Laundry Area'],
      reviews: [
        { name: 'Claire V.', rating: 5, text: 'Very clean and the compound is peaceful. Bus terminal is super near.' }
      ]
    }),
    mk(9, {
      title: 'Cozy Loft in Poblacion', type: 'Apartment', price: 9000,
      street: 'Bolton Street', barangay: 'Poblacion', ownerId: 'u_maria', rating: 4.9, cover: 8,
      description: 'A charming loft-style unit with a wooden staircase and warm lighting. Located along Bolton Street, a short walk to People\'s Park and the Davao City Hall. The loft has a reading nook, a small kitchen, and a private bathroom.',
      amenities: ['WiFi','Aircon','Own CR','Water Included','Electricity Included','Cooking Allowed','Study Desk','CCTV'],
      reviews: [
        { name: 'Ysa F.', rating: 5, text: 'The coziest place I have ever rented. The reading nook is a dream.' },
        { name: 'Paolo S.', rating: 4.8, text: 'Great location, walking distance to People\'s Park.' }
      ]
    }),
    mk(10, {
      title: 'Family Apartment in Buhangin', type: 'Apartment', price: 20000,
      street: 'Buhangin Road', barangay: 'Buhangin', ownerId: 'u_jose', rating: 4.6, cover: 9,
      description: 'Spacious three-bedroom apartment with a wide living area and a covered garage. Located along Buhangin Road near the public market, schools, and the diversion road. Ideal for a growing family that needs extra space and a safe neighborhood.',
      amenities: ['WiFi','Aircon','Own CR','Water Included','Cooking Allowed','Parking','CCTV','24/7 Security','Pet Friendly','Laundry Area'],
      reviews: [
        { name: 'The Delos Reyes Family', rating: 4.6, text: 'Very spacious. Our two dogs love the garage area.' }
      ]
    })
  ];

  return {
    users: [
      { id:'u_admin', name:'BOARDz Admin', email:'admin@boardz.ph', password:'admin123', role:'admin' },
      { id:'u_maria', name:'Maria Santos', email:'maria@boardz.ph', password:'maria123', role:'user' },
      { id:'u_jose',  name:'Jose Cruz',   email:'jose@boardz.ph',  password:'jose123',  role:'user' }
    ],
    listings,
    bookings: [
      {
        id: 'b_1', listingId: 'l_9', renterId: 'u_jose', ownerId: 'u_maria',
        moveIn: '2025-02-01', months: 6, message: 'Hi Maria! I am interested in the loft. Is it still available?',
        status: 'Pending', createdAt: now - 3600000
      }
    ],
    favorites: { u_maria: ['l_2', 'l_8'] },
    messages: [
      {
        id: 'msg_1', listingId: 'l_9', fromId: 'u_jose', toId: 'u_maria',
        text: "Hi Maria! I sent a booking request for the loft. Is the reading nook still there?",
        createdAt: now - 5400000, read: true
      },
      {
        id: 'msg_2', listingId: 'l_9', fromId: 'u_maria', toId: 'u_jose',
        text: "Hi Jose! Yes, it's exactly as pictured. I'll review your request tonight.",
        createdAt: now - 3600000, read: false
      },
      {
        id: 'msg_3', listingId: 'l_2', fromId: 'u_maria', toId: 'u_jose',
        text: "Hi Jose! Is the studio near Abreeza still available for March?",
        createdAt: now - 86400000, read: true
      },
      {
        id: 'msg_4', listingId: 'l_2', fromId: 'u_jose', toId: 'u_maria',
        text: "Yes Maria, it's open! Happy to schedule a viewing this weekend.",
        createdAt: now - 82800000, read: true
      }
    ]
  };
}