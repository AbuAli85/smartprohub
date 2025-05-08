// Demo data for when database access fails or is unavailable

export const demoRevenueData = [
  { name: "Jan", total: 4000 },
  { name: "Feb", total: 3000 },
  { name: "Mar", total: 5000 },
  { name: "Apr", total: 4000 },
  { name: "May", total: 7000 },
  { name: "Jun", total: 6000 },
  { name: "Jul", total: 8000 },
  { name: "Aug", total: 9000 },
  { name: "Sep", total: 8000 },
  { name: "Oct", total: 10000 },
  { name: "Nov", total: 12000 },
  { name: "Dec", total: 15000 },
]

export const demoBookings = [
  {
    id: "demo-1",
    date: "2023-05-15",
    time: "10:00",
    status: "completed",
    service_name: "Business Consultation",
    provider: {
      full_name: "Jane Smith",
      avatar_url: null,
    },
  },
  {
    id: "demo-2",
    date: "2023-05-20",
    time: "14:30",
    status: "upcoming",
    service_name: "Tax Planning",
    provider: {
      full_name: "John Davis",
      avatar_url: null,
    },
  },
  {
    id: "demo-3",
    date: "2023-05-25",
    time: "11:00",
    status: "upcoming",
    service_name: "Financial Review",
    provider: {
      full_name: "Sarah Johnson",
      avatar_url: null,
    },
  },
  {
    id: "demo-4",
    date: "2023-06-01",
    time: "09:30",
    status: "upcoming",
    service_name: "Legal Consultation",
    provider: {
      full_name: "Michael Brown",
      avatar_url: null,
    },
  },
  {
    id: "demo-5",
    date: "2023-06-10",
    time: "15:00",
    status: "upcoming",
    service_name: "Marketing Strategy",
    provider: {
      full_name: "Emily Wilson",
      avatar_url: null,
    },
  },
]

// Demo user profile data
export const demoUserProfile = {
  id: "demo-user",
  full_name: "Demo User",
  email: "demo@example.com",
  role: "client",
  avatar_url: null,
  created_at: new Date().toISOString(),
}

// Demo services data
export const demoServices = [
  {
    id: "service-1",
    name: "Business Consultation",
    description: "Expert advice on business strategy and growth",
    price: 150,
    duration: 60,
  },
  {
    id: "service-2",
    name: "Tax Planning",
    description: "Strategic tax planning for businesses and individuals",
    price: 200,
    duration: 90,
  },
  {
    id: "service-3",
    name: "Financial Review",
    description: "Comprehensive review of financial health and strategies",
    price: 175,
    duration: 75,
  },
  {
    id: "service-4",
    name: "Legal Consultation",
    description: "Legal advice for business operations and compliance",
    price: 225,
    duration: 60,
  },
  {
    id: "service-5",
    name: "Marketing Strategy",
    description: "Develop effective marketing strategies for your business",
    price: 180,
    duration: 90,
  },
]
