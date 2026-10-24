// All content for Sanchit Jain's portfolio.
// Items marked "VERIFY" are assumptions – keep them only if they are true.
// Client projects: describe the problem and your work, never internal code,
// credentials, or private numbers your employer hasn't approved.

export const meta = {
  title: 'Sanchit Jain | Full-Stack Engineer (Node.js, React, Distributed Systems)',
  description:
    'Full-stack engineer with 4.5+ years building scalable Node.js microservices and React interfaces for restaurant tech, fintech, aviation and e-commerce.',
}

export const profile = {
  name: 'Sanchit Jain',
  firstName: 'Sanchit',
  role: 'Full-Stack Engineer',
  subRole: 'Backend-heavy · Node.js · React · Distributed Systems',
  location: 'Noida, India',
  email: 'sanchitj439@gmail.com',
  phone: '+91 9634810733',
  resumeUrl: '/Sanchit_Jain_Resume.pdf',
  social: {
    github: 'https://github.com/', // VERIFY: add your username
    linkedin: 'https://www.linkedin.com/in/sanchitjain01',
  },
  availability: 'Open to senior backend and full-stack roles',
  heroHeadline: 'I build the systems behind millions of food orders.',
  heroSubtext:
    "Full-stack engineer with 4.5+ years shipping Node.js microservices, real-time APIs and React interfaces for brands like KFC, Pizza Hut and Hardee's across 10+ countries.",
  ctaPrimary: { label: 'View my work', href: '#projects' },
  ctaSecondary: { label: 'Download resume', href: '/Sanchit_Jain_Resume.pdf' },
}

export const stats = [
  { value: '4.5+', label: 'Years building production software' },
  { value: '21+', label: 'Microservices worked across' },
  { value: '200K+', label: 'Orders per day on platforms I built for' },
  { value: '10+', label: 'Countries with live kiosk ordering' },
]

export const about = [
  "I'm a full-stack engineer who started on the backend and still lives closest to it. For the last four and a half years I've built ordering, payment and delivery systems for quick-service restaurant brands across the Middle East, Central Asia and the U.S.",
  'Most of my work sits where scale meets reliability: microservices that talk over gRPC and Kafka, data layers on MongoDB, Aerospike and Redis, and the monitoring that tells you something is wrong before customers do.',
  'On the frontend, I build with React and TypeScript, and I like owning a feature end to end, from the database schema to the screen the user taps.',
  'Today I informally lead a team of 7 senior developers at Americana Restaurants, review code, and interview engineers for senior Node.js roles.',
]

export interface SkillGroup {
  group: string
  items: string[]
}

// Ordered by how a full-stack recruiter scans. Remove anything you can't discuss in an interview.
export const skills: SkillGroup[] = [
  {
    group: 'Frontend',
    // VERIFY: keep only what you've actually used. Add Next.js once you've built something with it.
    items: ['React', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux / Context API', 'REST & GraphQL clients'],
  },
  {
    group: 'Backend',
    items: ['Node.js', 'NestJS', 'Express.js', 'Koa', 'REST APIs', 'GraphQL', 'gRPC / Protobuf', 'WebSockets (Socket.IO)', 'Go', 'Python'],
  },
  {
    group: 'Architecture',
    items: ['Microservices', 'Event-Driven Architecture', 'System Design', 'Low-Level Design', 'Multi-tenancy', 'Idempotency & Retries'],
  },
  { group: 'Data', items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Aerospike', 'Redis', 'Elasticsearch'] },
  { group: 'Messaging', items: ['Kafka', 'RabbitMQ'] },
  {
    group: 'Cloud & DevOps',
    items: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linkerd', 'Jenkins', 'Bitbucket Pipelines', 'GitHub Actions'],
  },
  { group: 'Quality & Observability', items: ['Jest', 'SonarQube', 'New Relic', 'Kibana', 'Azure Key Vault'] },
]

export interface Job {
  company: string
  role: string
  period: string
  location: string
  summary: string
  highlights: string[]
  stack: string[]
}

export const experience: Job[] = [
  {
    company: 'Americana Restaurants',
    role: 'Senior Backend Developer',
    period: 'Jan 2026 – Present',
    location: 'India',
    summary:
      "Building on a 21+ microservice ordering platform behind KFC, Pizza Hut, Hardee's and Krispy Kreme across MENA and Central Asia.",
    highlights: [
      'Rebuilt the Aerospike connection layer for every service with retry, reconnection and self-healing.',
      'Blocked 50K+ abusive requests per day with rate limiting, validation and gateway rules.',
      'Cut production incidents ~40% and response time from 30 to under 10 minutes with centralized monitoring.',
      'Delivered the Kazakhstan launch: Epay and Kaspi payments, RU/KK localization, currency precision.',
      'Designing a multi-tenant NestJS SaaS for onboarding new restaurant brands.',
      'Lead 7 senior developers informally and interviewed 20+ candidates.',
    ],
    stack: ['Node.js', 'TypeScript', 'Koa', 'NestJS', 'gRPC', 'Kafka', 'Aerospike', 'Kubernetes', 'Azure'],
  },
  {
    company: 'Appinventiv',
    role: 'Backend Developer',
    period: 'Feb 2022 – Jan 2026',
    location: 'Noida, India',
    summary: 'Built backend systems for restaurant, fintech, aviation and e-commerce clients at a global product-engineering company.',
    highlights: [
      'Built order, cart, payment and delivery services handling 200K+ orders per day for Americana.',
      'Cut critical API latency from ~2.5s to ~300ms with parallel async, indexing and Redis caching.',
      'Built backends for a stock-investing app, an airline crew platform and an e-commerce inventory system.',
      'Supported backend APIs for KFC U.S. self-service kiosk ordering.',
    ],
    stack: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'AWS'],
  },
]

export interface Project {
  slug: string
  title: string
  tagline: string
  category: string
  featured: boolean
  problem: string
  solution: string
  impact: string[]
  stack: string[]
  links: { live?: string; repo?: string; caseStudy?: string }
}

// Case-study format: problem → what I did → result. The 3 strongest come first.
export const projects: Project[] = [
  {
    slug: 'restaurant-ordering-platform',
    title: 'Multi-Brand Restaurant Ordering Platform',
    tagline: 'Online, kiosk and delivery ordering for global QSR brands',
    category: 'Distributed Systems',
    featured: true,
    problem:
      'Four restaurant brands across many countries needed one platform for online, kiosk and delivery orders, each with its own menus, currencies, payments and POS systems.',
    solution:
      'Worked across 21+ Node.js microservices communicating over gRPC, Kafka and RabbitMQ on Kubernetes. Built order, cart, payment and delivery flows, delivery-ETA integration and currency-aware totals for POS systems.',
    impact: ['200K+ orders/day at platform level', 'Kiosk ordering live in 10+ countries', 'Linked to $10M+ in revenue'],
    stack: ['Node.js', 'TypeScript', 'Koa', 'gRPC', 'Kafka', 'RabbitMQ', 'MongoDB', 'Kubernetes'],
    links: {}, // Client work: no public links. Add an architecture diagram image instead.
  },
  {
    slug: 'aerospike-resilience',
    title: 'Self-Healing Data Layer',
    tagline: 'Making every microservice survive database blips',
    category: 'Reliability',
    featured: true,
    problem:
      'Dropped Aerospike connections were causing failed requests across services, and on-call engineers had no visibility into connection health.',
    solution:
      'Rebuilt the shared connection layer with automatic retry, background reconnection and self-healing client operations, upgraded the client, and emitted New Relic custom events for every connect and reconnect cycle.',
    impact: ['Rolled out to every microservice', 'Connection health visible in production dashboards'],
    stack: ['Node.js', 'Aerospike', 'New Relic'],
    links: {},
  },
  {
    slug: 'brand-onboarding-saas',
    title: 'Restaurant Brand Onboarding SaaS',
    tagline: 'Bring a new restaurant brand online in days, not months',
    category: 'Full-Stack · In progress',
    featured: true,
    problem: 'Onboarding a new restaurant brand onto the ordering ecosystem was slow and expensive.',
    // VERIFY: add the React admin dashboard here if you build one; it is your strongest full-stack proof.
    solution: 'Designing from scratch a multi-tenant NestJS backend with tenant-aware configuration and role-based access.',
    impact: ['Lower onboarding cost for new brands'], // VERIFY: add numbers when available
    stack: ['NestJS', 'TypeScript', 'React'], // VERIFY React
    links: {},
  },
  {
    slug: 'snowball',
    title: 'Snowball',
    tagline: 'Stock investing app for retail investors',
    category: 'Fintech',
    featured: false,
    problem: 'Retail investors needed a simple way to onboard, invest and track a portfolio.',
    solution: 'Built the investment backend: onboarding and KYC flows, portfolio and holdings APIs, and live price updates pushed over Socket.IO.', // VERIFY features
    impact: ['Real-time portfolio updates'],
    stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'Socket.IO'], // VERIFY stack
    links: {},
  },
  {
    slug: 'crew-connex',
    title: 'Crew Connex',
    tagline: 'Day-to-day logistics for airline crews',
    category: 'Aviation',
    featured: false,
    problem: 'Airline crew juggled flight duty times, hotel check-ins and cab pickups across scattered channels.',
    solution:
      'Developed APIs for crew rosters, duty times, hotel check-ins and cab schedules, with real-time alerts so crew always had the latest update.',
    impact: ["One app for a crew member's full trip schedule"],
    stack: ['Node.js', 'Express.js', 'GraphQL', 'MongoDB', 'AWS SNS'], // VERIFY stack
    links: {},
  },
  {
    slug: 'taghawk',
    title: 'TagHawk',
    tagline: 'Community marketplace to buy, sell and move used items',
    category: 'E-commerce · Full-Stack',
    featured: true,
    problem:
      'Students and apartment residents needed a trusted way to buy and sell used items inside their own community, without meeting strangers or handling cash, and without listings overselling stock.',
    // VERIFY: adjust to exactly what you built on TagHawk
    solution:
      'Built the marketplace backend: community-scoped listings and search, inventory and order management with transactional stock updates, anonymous buyer–seller chat over Socket.IO, and escrow-style cashless payments.',
    impact: ['No overselling under concurrent checkout', 'Real-time anonymous chat', 'Cashless escrow payments'], // VERIFY
    stack: ['Node.js', 'TypeScript', 'MongoDB', 'MySQL', 'Elasticsearch', 'Socket.IO', 'React'], // VERIFY stack
    links: {},
  },
]

/** Feature tour for the interactive TagHawk phone showcase. `api` is the call the screen makes. */
export const taghawkFeatures = [
  { id: 'feed', label: 'Community feed', api: 'GET /taghawk/listings?community=…', detail: 'Listings scoped to your campus or building, with full-text search on Elasticsearch.' },
  { id: 'chat', label: 'Anonymous chat', api: 'WS  /chat  (Socket.IO)', detail: 'Buyers and sellers talk without sharing phone numbers; messages are delivered in real time.' },
  { id: 'checkout', label: 'Escrow checkout', api: 'POST /orders  → POST /escrow/hold', detail: 'Stock is reserved transactionally, then payment is held in escrow until the hand-off.' },
  { id: 'delivery', label: 'Move it', api: 'POST /deliveries', detail: 'Book a local mover for bulky items straight from the order.' },
] as const

// Short engineering write-ups. Each one is a strong talking point in interviews.
export const engineeringNotes = [
  { title: 'Why every write should be idempotent', summary: 'How upsert-based keys stopped duplicate entries from breaking order processing.', tag: 'Reliability' },
  { title: 'Rounding money across 10 currencies', summary: 'Currency precision bugs between an ordering platform and POS systems, and the fix.', tag: 'Payments' },
  { title: 'Self-healing database connections in Node.js', summary: 'Retry, reconnection and observability patterns for Aerospike clients.', tag: 'Node.js' },
  { title: 'From 2.5s to 300ms', summary: 'Parallel async calls, compound indexes and caching on a critical API.', tag: 'Performance' },
]

export const education = {
  degree: 'B.Tech, Computer Science and Engineering',
  school: 'Hindustan College of Science and Technology (Sharda Group of Institutions)',
  year: '2022',
}

export const contact = {
  heading: "Let's build something reliable.",
  text: "I'm open to senior backend and full-stack roles. The fastest way to reach me is email.",
  email: 'sanchitj439@gmail.com',
}

/* ── Restaurant tech (globe section) ──────────────────────────────────────── */

/**
 * Brands whose ordering platforms you work on. Names + brand colours only – no logos
 * (trademarks belong to their owners; using logos can imply endorsement).
 * VERIFY: keep only brands you can talk about publicly.
 */
export const restaurantBrands = [
  { id: 'kfc', name: 'KFC', color: '#E4002B', food: 'chicken', note: 'Online, app and self-service kiosk ordering' },
  { id: 'pizzahut', name: 'Pizza Hut', color: '#EE3A43', food: 'pizza', note: 'Delivery (PHD) and dine-in ordering' },
  { id: 'hardees', name: "Hardee's", color: '#FFB81C', food: 'burger', note: 'Ordering, menus and POS integration' },
  { id: 'wimpy', name: 'Wimpy', color: '#D6001C', food: 'fries', note: 'Ordering platform onboarding' },
  { id: 'krispykreme', name: 'Krispy Kreme', color: '#00A651', food: 'donut', note: 'Ordering and delivery flows' },
] as const

/** Markets on the platform (VERIFY). `hub` is where the arcs start. */
export const markets = [
  { city: 'Dubai', country: 'UAE', lat: 25.2, lng: 55.27, hub: true },
  { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.71, lng: 46.68 },
  { city: 'Jeddah', country: 'Saudi Arabia', lat: 21.49, lng: 39.19 },
  { city: 'Kuwait City', country: 'Kuwait', lat: 29.38, lng: 47.99 },
  { city: 'Doha', country: 'Qatar', lat: 25.29, lng: 51.53 },
  { city: 'Manama', country: 'Bahrain', lat: 26.23, lng: 50.59 },
  { city: 'Muscat', country: 'Oman', lat: 23.59, lng: 58.41 },
  { city: 'Cairo', country: 'Egypt', lat: 30.04, lng: 31.24 },
  { city: 'Amman', country: 'Jordan', lat: 31.95, lng: 35.93 },
  { city: 'Casablanca', country: 'Morocco', lat: 33.57, lng: -7.59 },
  { city: 'Almaty', country: 'Kazakhstan', lat: 43.24, lng: 76.89 },
] as const

/* ── AI in my workflow ────────────────────────────────────────────────────── */

/**
 * Logos come from src/data/aiIcons.ts (slug = key there).
 * VERIFY: keep only the tools you actually use and describe them in your own words.
 */
export const aiTools = [
  { slug: 'claude', name: 'Claude API', ring: 0, use: 'Claude integrated into Node.js backends: summarisation, structured extraction and assistants behind an API.' },
  { slug: 'anthropic', name: 'Claude Code', ring: 0, use: 'Agentic coding in the terminal: refactors, test generation and code review.' },
  { slug: 'openai', name: 'Codex', ring: 0, use: 'Code generation and quick prototypes.' },
  { slug: 'googlegemini', name: 'Gemini', ring: 0, use: 'Research, long-document reading and second opinions on designs.' },
  { slug: 'githubcopilot', name: 'GitHub Copilot', ring: 1, use: 'Inline completions while writing services and tests.' },
  { slug: 'langchain', name: 'LangChain', ring: 1, use: 'Prototyping retrieval and tool-calling pipelines.' },
  { slug: 'ollama', name: 'Ollama', ring: 1, use: 'Running open models locally for private experiments.' },
  { slug: 'huggingface', name: 'Hugging Face', ring: 1, use: 'Exploring open models and datasets.' },
  { slug: 'perplexity', name: 'Perplexity', ring: 1, use: 'Fast, cited research on libraries and incidents.' },
  { slug: 'n8n', name: 'n8n', ring: 1, use: 'Automating small workflows and notifications.' },
] as const

export const aiSuggestedQuestions = [
  'What does Sanchit work on right now?',
  'What is his tech stack?',
  'Tell me about TagHawk',
  'How does he use AI?',
  'Is he open to new roles?',
]
