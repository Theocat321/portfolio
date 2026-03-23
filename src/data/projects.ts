export type ProjectType = 'project' | 'hackathon'

export interface Project {
  id: string
  title: string
  description: string
  link?: string
  tag?: string
  status?: string
  date?: string
  type: ProjectType
  thumbnail?: string
  position: [number, number] // [lat, lng] in degrees
}

export const MOON_RADIUS = 0.75

export function getBeaconColor(project: Project): string {
  if (project.type === 'hackathon') return '#e040fb' // purple/magenta for hackathons

  switch (project.status) {
    case 'Active': return '#4cf0a0'
    case 'Completed': return '#4cc9f0'
    default: return '#f0a04c'
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
  // ---- Projects ----
  {
    // ---- Projects (spread around full sphere) ----
    id: 'stag',
    title: 'Stag AI',
    description: 'AI platform revolutionising commercial real estate underwriting',
    link: 'https://usestag.com',
    tag: 'AI',
    status: 'Active',
    date: 'Jun 2025 – Present',
    type: 'project',
    position: [15, 30],
  },
  {
    id: 'meta',
    title: 'Meta',
    description: 'SWE Intern on Ads team. Shipped 4 projects in 3 months. Received return offer.',
    tag: 'SWE',
    status: 'Completed',
    date: 'Jun – Sep 2025',
    type: 'project',
    position: [-20, 150],
  },
  {
    id: 'alethium',
    title: 'Alethium',
    description: 'B2B health & wellness supply chain. 6 figures in 3 months of trading.',
    link: 'https://alethium.io',
    tag: 'SaaS',
    status: 'Completed',
    date: 'Apr 2024 – Apr 2025',
    type: 'project',
    position: [35, -60],
  },
  {
    id: 'gov-contracting',
    title: 'Government Contracting',
    description: 'Data processing and analytics in campaigning',
    tag: 'Classified',
    status: 'Completed',
    date: '2025',
    type: 'project',
    position: [-10, -140],
  },
  {
    id: 'zoey',
    title: 'Zoey',
    description: 'LLM-powered financial assistant in WhatsApp',
    tag: 'AI',
    status: 'No longer maintained',
    date: 'Q1 2025',
    type: 'project',
    position: [40, 100],
  },
  {
    id: 'shots',
    title: 'Shots',
    description: 'Events & parties mobile platform. Connecting users in new ways.',
    tag: 'Mobile',
    status: 'No longer maintained',
    date: 'Aug 2023 – Sep 2024',
    type: 'project',
    position: [-35, -20],
  },
  {
    id: 'fund-watcher',
    title: 'Fund Watcher',
    description: 'Fund & portfolio management tool for private equity clients',
    tag: 'Fintech',
    status: 'Completed',
    date: '2025',
    type: 'project',
    position: [5, -100],
  },

  {
    id: 'roi-or-die',
    title: 'ROI or Die',
    description: 'Enterprise sales cycle game, powered by Mistral',
    link: 'https://roi-or-die.com',
    tag: 'AI',
    status: 'Active',
    type: 'project',
    position: [50, 60],
  },

  // ---- Hackathons (interleaved around the sphere) ----
  {
    id: 'tiger-mom',
    title: 'Tiger MOM',
    description: 'Realtime MOM test assistant for crucial customer calls',
    tag: 'Tech:Europe 2025',
    type: 'hackathon',
    position: [-40, 70],
  },
  {
    id: 'clueless',
    title: 'Clueless',
    description: 'AI onboarding engine for anything on your computer. Won $45k.',
    tag: 'AI Engine 2025',
    status: 'Winner - $45k',
    type: 'hackathon',
    position: [25, -170],
  },
  {
    id: 'yappah',
    title: 'Yappah.ai',
    description: 'Social awareness assistant tackling the loneliness epidemic',
    tag: 'Bolt/Elevenlabs 2025',
    status: 'Track Winner',
    type: 'hackathon',
    position: [-15, 120],
  },
  {
    id: 'fireline',
    title: 'Fireline',
    description: 'Visualising and understanding wildfire data in California',
    tag: 'Hack South West 2024',
    status: 'Overall Winner',
    type: 'hackathon',
    position: [45, -30],
  },
  {
    id: 'logisti',
    title: 'Logisti',
    description: 'Bulk buying management system to save the environment',
    tag: 'Google SDC 2023',
    status: 'Overall Winner',
    type: 'hackathon',
    position: [-30, -110],
  },
]
