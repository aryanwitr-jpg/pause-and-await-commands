// Dummy data for sustainability events app

export const dummyCoaches = [
  {
    id: 'coach-1',
    name: 'Dr. Sarah Green',
    email: 'sarah.green@ecosolutions.com',
    bio: 'Environmental scientist with 15+ years in sustainable development',
    specialties: ['Climate Action', 'Renewable Energy', 'Carbon Footprint'],
    image_url: '/api/placeholder/150/150'
  },
  {
    id: 'coach-2', 
    name: 'Marcus Silva',
    email: 'marcus.silva@greentech.org',
    bio: 'Sustainable technology innovator and green business consultant',
    specialties: ['Green Technology', 'Sustainable Business', 'Eco Innovation'],
    image_url: '/api/placeholder/150/150'
  },
  {
    id: 'coach-3',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@conservationleague.net',
    bio: 'Wildlife conservation expert and ecosystem restoration specialist',
    specialties: ['Conservation', 'Biodiversity', 'Ecosystem Restoration'],
    image_url: '/api/placeholder/150/150'
  },
  {
    id: 'coach-4',
    name: 'David Thompson',
    email: 'david.thompson@sustainablecities.gov',
    bio: 'Urban planning specialist focused on sustainable city development',
    specialties: ['Urban Planning', 'Smart Cities', 'Sustainable Transport'],
    image_url: '/api/placeholder/150/150'
  },
  {
    id: 'coach-5',
    name: 'Aria Patel',
    email: 'aria.patel@oceansafe.org',
    bio: 'Marine biologist dedicated to ocean conservation and plastic waste reduction',
    specialties: ['Ocean Conservation', 'Waste Reduction', 'Marine Ecosystems'],
    image_url: '/api/placeholder/150/150'
  }
];

export const dummyEvents = [
  {
    id: 'event-1',
    title: 'Community Solar Garden Workshop',
    description: 'Learn how to start a community solar project in your neighborhood. We\'ll cover planning, funding, and implementation strategies.',
    event_date: '2024-01-20',
    location: 'Green Community Center, Downtown',
    total_seats: 50,
    available_seats: 23,
    coach_id: 'coach-1',
    category: 'Renewable Energy',
    image_url: '/api/placeholder/400/250',
    status: 'active'
  },
  {
    id: 'event-2',
    title: 'Zero Waste Lifestyle Challenge',
    description: 'Join our 30-day zero waste challenge! Learn practical tips to reduce household waste and live more sustainably.',
    event_date: '2024-01-25',
    location: 'Eco Living Space, Midtown',
    total_seats: 30,
    available_seats: 8,
    coach_id: 'coach-2',
    category: 'Waste Reduction',
    image_url: '/api/placeholder/400/250',
    status: 'active'
  },
  {
    id: 'event-3',
    title: 'Urban Beekeeping for Beginners',
    description: 'Discover the world of urban beekeeping and learn how you can support local bee populations while producing honey.',
    event_date: '2024-02-01',
    location: 'City Garden Rooftop, Eastside',
    total_seats: 25,
    available_seats: 12,
    coach_id: 'coach-3',
    category: 'Biodiversity',
    image_url: '/api/placeholder/400/250',
    status: 'active'
  },
  {
    id: 'event-4',
    title: 'Sustainable Transportation Expo',
    description: 'Explore electric vehicles, bike-sharing programs, and public transit innovations making our city more sustainable.',
    event_date: '2024-02-05',
    location: 'Convention Center, Central Plaza',
    total_seats: 200,
    available_seats: 156,
    coach_id: 'coach-4',
    category: 'Sustainable Transport',
    image_url: '/api/placeholder/400/250',
    status: 'active'
  },
  {
    id: 'event-5',
    title: 'Ocean Cleanup Volunteer Day',
    description: 'Join us for a hands-on beach cleanup and learn about marine conservation efforts. All materials provided.',
    event_date: '2024-02-10',
    location: 'Seaside Beach, Coastal District',
    total_seats: 75,
    available_seats: 31,
    coach_id: 'coach-5',
    category: 'Ocean Conservation',
    image_url: '/api/placeholder/400/250',
    status: 'active'
  },
  {
    id: 'event-6',
    title: 'Green Building Design Workshop',
    description: 'Learn about sustainable architecture, energy-efficient design, and green building materials from industry experts.',
    event_date: '2024-02-15',
    location: 'Architecture Institute, University District',
    total_seats: 40,
    available_seats: 15,
    coach_id: 'coach-4',
    category: 'Green Technology',
    image_url: '/api/placeholder/400/250',
    status: 'active'
  },
  {
    id: 'event-7',
    title: 'Permaculture Garden Setup',
    description: 'Hands-on workshop to create a permaculture food forest. Learn sustainable farming techniques and soil restoration.',
    event_date: '2024-02-20',
    location: 'Community Farm, Riverside',
    total_seats: 35,
    available_seats: 22,
    coach_id: 'coach-1',
    category: 'Sustainable Agriculture',
    image_url: '/api/placeholder/400/250',
    status: 'active'
  }
];

export const predefinedHabits = [
  {
    name: 'Use reusable water bottle',
    description: 'Replace single-use plastic bottles with a reusable alternative',
    category: 'Waste Reduction',
    points: 10
  },
  {
    name: 'Take public transport or bike',
    description: 'Choose sustainable transportation for daily commutes',
    category: 'Sustainable Transport',
    points: 15
  },
  {
    name: 'Eat a plant-based meal',
    description: 'Include at least one plant-based meal in your daily diet',
    category: 'Sustainable Diet',
    points: 12
  },
  {
    name: 'Unplug electronics when not in use',
    description: 'Reduce energy consumption by unplugging devices',
    category: 'Energy Conservation',
    points: 8
  },
  {
    name: 'Use cold water for laundry',
    description: 'Wash clothes in cold water to save energy',
    category: 'Energy Conservation',
    points: 10
  },
  {
    name: 'Bring reusable bags for shopping',
    description: 'Avoid plastic bags by bringing your own reusable bags',
    category: 'Waste Reduction',
    points: 8
  },
  {
    name: 'Compost organic waste',
    description: 'Turn food scraps into nutrient-rich compost',
    category: 'Waste Reduction',
    points: 15
  },
  {
    name: 'Take shorter showers',
    description: 'Reduce water usage with 5-minute showers',
    category: 'Water Conservation',
    points: 12
  },
  {
    name: 'Support local/organic products',
    description: 'Choose locally sourced and organic products when shopping',
    category: 'Sustainable Consumption',
    points: 10
  },
  {
    name: 'Turn off lights when leaving room',
    description: 'Simple habit to reduce electricity consumption',
    category: 'Energy Conservation',
    points: 5
  }
];

export const dummyTeams = [
  {
    id: 'team-1',
    name: 'Green Warriors',
    description: 'Passionate about environmental conservation and sustainable living',
    member_count: 12,
    total_points: 847,
    efficiency: 78,
    admin_email: 'admin@greenwarriors.com',
    created_at: '2024-01-15',
    members: [
      { name: 'Alex Chen', points: 120, efficiency: 85 },
      { name: 'Maria Rodriguez', points: 98, efficiency: 72 },
      { name: 'James Wilson', points: 134, efficiency: 89 },
      { name: 'Sarah Kumar', points: 87, efficiency: 65 },
      { name: 'David Park', points: 156, efficiency: 94 }
    ]
  },
  {
    id: 'team-2',
    name: 'Eco Champions',
    description: 'Champions of renewable energy and zero waste lifestyle',
    member_count: 18,
    total_points: 1184,
    efficiency: 82,
    admin_email: 'lead@ecochampions.org',
    created_at: '2024-01-20',
    members: [
      { name: 'Emma Thompson', points: 167, efficiency: 91 },
      { name: 'Michael Brown', points: 143, efficiency: 87 },
      { name: 'Lisa Anderson', points: 128, efficiency: 76 },
      { name: 'Ryan Martinez', points: 112, efficiency: 69 },
      { name: 'Jennifer Lee', points: 189, efficiency: 95 }
    ]
  },
  {
    id: 'team-3',
    name: 'Planet Protectors',
    description: 'Dedicated to protecting our planet for future generations',
    member_count: 8,
    total_points: 632,
    efficiency: 71,
    admin_email: 'team@planetprotectors.net',
    created_at: '2024-02-01',
    members: [
      { name: 'Sophie Taylor', points: 145, efficiency: 83 },
      { name: 'Mark Johnson', points: 98, efficiency: 62 },
      { name: 'Amy Zhang', points: 167, efficiency: 88 },
      { name: 'Chris Davis', points: 76, efficiency: 54 }
    ]
  },
  {
    id: 'team-4',
    name: 'Sustainability Squad',
    description: 'Making sustainability fun and accessible for everyone',
    member_count: 15,
    total_points: 898,
    efficiency: 75,
    admin_email: 'squad@sustainability.com',
    created_at: '2024-02-10',
    members: [
      { name: 'Jordan Smith', points: 134, efficiency: 79 },
      { name: 'Taylor Kim', points: 156, efficiency: 86 },
      { name: 'Casey Miller', points: 98, efficiency: 67 },
      { name: 'Morgan Wang', points: 123, efficiency: 74 },
      { name: 'Quinn Garcia', points: 187, efficiency: 92 }
    ]
  },
  {
    id: 'team-5',
    name: 'Carbon Cutters',
    description: 'Focused on reducing carbon footprint through daily actions',
    member_count: 10,
    total_points: 756,
    efficiency: 68,
    admin_email: 'info@carboncutters.org',
    created_at: '2024-02-15',
    members: [
      { name: 'Adrian Lopez', points: 145, efficiency: 81 },
      { name: 'Zoe Carter', points: 89, efficiency: 58 },
      { name: 'Noah Wright', points: 134, efficiency: 75 },
      { name: 'Mia Scott', points: 167, efficiency: 89 },
      { name: 'Ethan Hill', points: 98, efficiency: 63 }
    ]
  },
  {
    id: 'team-6',
    name: 'Renewable Rebels',
    description: 'Rebels for renewable energy and clean technology',
    member_count: 14,
    total_points: 923,
    efficiency: 79,
    admin_email: 'rebels@renewable.org',
    created_at: '2024-01-25',
    members: [
      { name: 'Luna Rivera', points: 178, efficiency: 93 },
      { name: 'Felix Chen', points: 134, efficiency: 76 },
      { name: 'Iris Patel', points: 145, efficiency: 82 },
      { name: 'Oscar Kim', points: 98, efficiency: 65 }
    ]
  },
  {
    id: 'team-7',
    name: 'Ocean Guardians',
    description: 'Protecting marine life and reducing ocean pollution',
    member_count: 11,
    total_points: 678,
    efficiency: 73,
    admin_email: 'guardians@ocean.org',
    created_at: '2024-02-05',
    members: [
      { name: 'Marina Blue', points: 156, efficiency: 87 },
      { name: 'Reef Johnson', points: 123, efficiency: 71 },
      { name: 'Coral Davis', points: 134, efficiency: 78 },
      { name: 'Wave Smith', points: 98, efficiency: 61 }
    ]
  }
];