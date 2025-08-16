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
    description: 'Dedicated to reducing carbon footprint through daily actions',
    member_count: 12,
    total_points: 2840,
    admin_email: 'sarah.team@greenwarriors.com',
    created_at: '2024-01-01'
  },
  {
    id: 'team-2',
    name: 'Eco Champions',
    description: 'Champions of sustainable living and environmental awareness',
    member_count: 18,
    total_points: 3120,
    admin_email: 'admin@ecochampions.org',
    created_at: '2024-01-05'
  },
  {
    id: 'team-3',
    name: 'Planet Protectors',
    description: 'Protecting our planet one sustainable habit at a time',
    member_count: 9,
    total_points: 1890,
    admin_email: 'leader@planetprotectors.net',
    created_at: '2024-01-10'
  },
  {
    id: 'team-4',
    name: 'Sustainability Squad',
    description: 'Squad focused on innovative sustainability solutions',
    member_count: 15,
    total_points: 2650,
    admin_email: 'squad@sustainability.com',
    created_at: '2024-01-08'
  },
  {
    id: 'team-5',
    name: 'Earth Guardians',
    description: 'Guardians committed to preserving Earth for future generations',
    member_count: 21,
    total_points: 4200,
    admin_email: 'guardians@earth.org',
    created_at: '2024-01-03'
  }
];