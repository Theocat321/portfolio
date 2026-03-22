export interface Project {
  id: string
  title: string
  description: string
  link?: string
  tag?: string
  status?: string
  date?: string
  thumbnail?: string
  position: [number, number] // [lat, lng] in degrees
}

export const MOON_RADIUS = 0.75

export function getBeaconColor(status?: string): string {
  switch (status) {
    case 'Active': return '#4cf0a0'        // green
    case 'Completed': return '#4cc9f0'     // cyan/blue
    default: return '#f0a04c'              // amber (no longer maintained)
  }
}

export function latLngToCartesian(
  lat: number,
  lng: number,
  radius: number
): [number, number, number] {
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const x = radius * Math.cos(latRad) * Math.sin(lngRad)
  const y = radius * Math.sin(latRad)
  const z = radius * Math.cos(latRad) * Math.cos(lngRad)
  return [x, y, z]
}

export const projects: Project[] = [
  {
    id: 'stag',
    title: 'Stag',
    description: 'AI for real estate teams',
    link: 'https://usestag.com',
    tag: 'AI',
    status: 'Active',
    date: 'Present',
    position: [20, -30],
  },
  {
    id: 'meta',
    title: 'Meta',
    description: 'Software Engineering Intern',
    tag: 'SWE',
    status: 'Completed',
    date: 'Summer 2025',
    position: [-15, 45],
  },
  {
    id: 'alethium',
    title: 'Alethium',
    description: 'Marketplace for health & wellness supply chain in Europe',
    link: 'https://alethium.io',
    tag: 'SaaS',
    status: 'Completed',
    date: '2024–2025',
    position: [35, 10],
  },
  {
    id: 'gov-contracting',
    title: 'Government Contracting',
    description: 'Redacted',
    tag: 'Classified',
    status: 'Completed',
    date: '2025',
    position: [-10, -60],
  },
  {
    id: 'zoey',
    title: 'Zoey',
    description: 'LLM-powered financial assistant in WhatsApp',
    tag: 'AI',
    status: 'No longer maintained',
    date: 'Q1 2025',
    position: [5, 70],
  },
  {
    id: 'shots',
    title: 'Shots',
    description: 'Mobile app',
    tag: 'Mobile',
    status: 'No longer maintained',
    date: '2023',
    position: [-30, -15],
  },
]
