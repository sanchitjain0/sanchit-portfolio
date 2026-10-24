// All content for Sanchit Jain's portfolio (kept in sync with the resume, Oct 2026).
// Items still marked "VERIFY" are assumptions – keep them only if they are true.
// Client projects: describe the problem and your work, never internal code,
// credentials, or private numbers your employer hasn't approved.

export const meta = {
  title: 'Sanchit Jain | Senior Backend Engineer (Node.js, TypeScript, Microservices)',
  description:
    'Senior Backend Engineer with 4.5+ years building Node.js and TypeScript microservices for high-volume ordering, payments and real-time systems across restaurant tech, fintech, aviation and e-commerce.',
}

export const profile = {
  name: 'Sanchit Jain',
  firstName: 'Sanchit',
  role: 'Senior Backend Engineer',
  subRole: 'Node.js · TypeScript · Microservices · Full-Stack (React)',
  location: 'Noida, India',
  email: 'sanchitj439@gmail.com',
  phone: '+91 9634810733',
  resumeUrl: '/Sanchit_Jain_Resume.pdf',
  social: {
    github: 'https://github.com/sanchitjain0',
    linkedin: 'https://www.linkedin.com/in/sanchitjain01',
    portfolio: 'https://sanchit-portfolio-chi.vercel.app',
  },
  availability: 'Open to senior backend and full-stack roles',
  heroHeadline: 'I build the systems behind millions of food orders.',
  heroSubtext:
    "Senior backend engineer with 4.5+ years shipping Node.js and TypeScript microservices for ordering, payments and real-time systems. Today I work on the 21+ service platform behind KFC, Pizza Hut, Hardee's and Krispy Kreme across MENA and Central Asia.",
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
  "I'm a backend engineer who also builds React frontends when a feature needs one owner end to end. For four and a half years I've worked on ordering, payment and real-time systems across restaurant tech, fintech, aviation and e-commerce.",
  'Most of my work sits where scale meets reliability: microservices talking over gRPC, Kafka and RabbitMQ on Kubernetes with a Linkerd service mesh, data layers on MongoDB, Aerospike and Redis, and the monitoring that tells you something is wrong before customers do.',
  'I care about API security and code health: rate limiting, validation and gateway rules that block 50K+ abusive requests a day, secrets in Azure Key Vault, and a SonarQube clean-up that removed a net 46K lines across the platform.',
  'At Americana Restaurants I informally lead 7 senior developers through code reviews and design discussions, and I have interviewed 20+ candidates for senior Node.js roles.',
]

export interface SkillGroup {
  group: string
  items: string[]
}

// Same groups and order as the resume.
export const skills: SkillGroup[] = [
  { group: 'Languages', items: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'Go'] },
  {
    group: 'Backend',
    items: ['Node.js', 'NestJS', 'Express.js', 'Koa', 'REST APIs', 'GraphQL', 'gRPC / Protobuf', 'WebSockets (Socket.IO)'],
  },
  {
    group: 'Architecture',
    items: ['Microservices', 'Event-Driven Architecture', 'System Design (HLD/LLD)', 'Multi-tenancy', 'Idempotency', 'API Gateway'],
  },
  { group: 'Databases & Caching', items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Aerospike', 'Redis', 'Elasticsearch'] },
  { group: 'Messaging', items: ['Kafka', 'RabbitMQ'] },
  {
    group: 'Cloud & DevOps',
    items: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linkerd', 'Jenkins', 'Bitbucket Pipelines', 'GitHub Actions'],
  },
  { group: 'Observability & Quality', items: ['New Relic', 'Kibana', 'Jest', 'SonarQube', 'Azure Key Vault'] },
  {
    group: 'Payments & Domain',
    items: ['Payment Gateways (Epay, Kaspi)', 'POS Integration', 'Multi-currency', 'Localization', 'Kiosk Ordering'],
  },
  {
    group: 'Frontend',
    items: ['React 19', 'Redux / Context API', 'Tailwind CSS', 'HTML5', 'CSS3', 'Three.js / React Three Fiber', 'Vite'],
  },
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
    company: 'Americana Restaurants (India) Pvt. Ltd.',
    role: 'Senior Backend Developer',
    period: 'Jan 2026 – Present',
    location: 'India',
    summary:
      "Building features across the 21+ microservice ordering platform behind KFC, Pizza Hut, Hardee's and Krispy Kreme in MENA and Central Asia.",
    highlights: [
      'Platform: features across 21+ microservices (Koa, gRPC, Kafka, RabbitMQ) on Kubernetes with a Linkerd service mesh, streaming order events to delivery and POS.',
      'Resilience: rebuilt the Aerospike connection layer for every service with retry, background reconnection and self-healing, plus New Relic connection-health events.',
      'API security: blocked 50K+ abusive requests/day with rate limiting, Joi validation and gateway rules; moved secrets to Azure Key Vault and fixed JWT audience validation.',
      'Observability: ~40% fewer production incidents and incident response from 30 to under 10 minutes with centralized logging, monitoring and alerting.',
      'Market launch: delivered Kazakhstan with Epay and Kaspi payments, RU/KK localization and multi-currency precision for POS totals.',
      'New product: designing a multi-tenant NestJS SaaS with tenant-aware configuration and RBAC so new brands onboard faster and cheaper.',
      'Code quality: led a platform-wide SonarQube clean-up of vulnerabilities and duplicate code, a net 46K lines removed.',
      'Leadership: informally lead 7 senior developers; interviewed 20+ candidates for senior Node.js roles.',
    ],
    stack: ['Node.js', 'TypeScript', 'Koa', 'NestJS', 'gRPC', 'Kafka', 'RabbitMQ', 'Aerospike', 'Kubernetes', 'Linkerd', 'Azure'],
  },
  {
    company: 'Appinventiv',
    role: 'Backend Developer',
    period: 'Feb 2022 – Jan 2026',
    location: 'Noida, India',
    summary: 'Backend systems for restaurant, fintech, aviation and e-commerce clients at a global product-engineering company.',
    highlights: [
      "Ordering platform: order, cart, payment and delivery services handling 200K+ orders/day for Americana's brands, with delivery-ETA, delivery-charge and order-status flows.",
      'Kiosk ordering: self-service kiosk system rolled out in 10+ countries and linked to $10M+ revenue growth, including KFC U.S. (Yum! Brands) kiosk APIs for menu sync and POS orders.',
      'Performance: critical API latency from ~2.5s to ~300ms with parallel async processing, MongoDB compound indexes and Redis caching; idempotent order writes ended duplicate-entry failures.',
      'Cost: ~20% annual infrastructure savings by right-sizing VMs and improving caching and data-access patterns.',
      'TagHawk: campus and apartment resale backend with Elasticsearch search, transactional inventory, anonymous Socket.IO chat and escrow payments.',
      'Snowball: onboarding and KYC flows, portfolio and holdings APIs on PostgreSQL, live prices over WebSockets.',
      'Crew Connex: Express.js and GraphQL APIs for crew rosters, duty times, hotel check-ins and cab schedules, with real-time alerts through AWS SNS.',
    ],
    stack: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'GraphQL', 'Socket.IO', 'AWS'],
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
      'Worked across 21+ Node.js microservices talking over gRPC, Kafka and RabbitMQ on Kubernetes with a Linkerd mesh. Built order, cart, payment and delivery services with delivery-ETA, delivery-charge and order-status flows, idempotent order writes and currency-aware totals for POS systems.',
    impact: ['200K+ orders/day at platform level', 'Kiosk ordering live in 10+ countries', 'Linked to $10M+ in revenue'],
    stack: ['Node.js', 'TypeScript', 'Koa', 'gRPC', 'Kafka', 'RabbitMQ', 'MongoDB', 'Kubernetes', 'Linkerd'],
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
    solution: 'Designing from scratch a multi-tenant NestJS backend with tenant-aware configuration and role-based access (RBAC).',
    impact: ['Faster, cheaper onboarding for new brands'], // add numbers once it ships
    stack: ['NestJS', 'TypeScript', 'MongoDB'],
    links: {},
  },
  {
    slug: 'snowball',
    title: 'Snowball',
    tagline: 'Stock investing app for retail investors',
    category: 'Fintech',
    featured: false,
    problem: 'Retail investors needed a simple way to onboard, invest and track a portfolio.',
    solution: 'Built the investment backend: onboarding and KYC flows, portfolio and holdings APIs on PostgreSQL, and live price updates over WebSockets.',
    impact: ['Real-time portfolio updates'],
    stack: ['Node.js', 'PostgreSQL', 'WebSockets'],
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
    stack: ['Node.js', 'Express.js', 'GraphQL', 'AWS SNS'],
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
    solution:
      'Built the campus and apartment resale backend: Elasticsearch listing search, transactional inventory that prevents overselling, anonymous buyer–seller chat over Socket.IO, and escrow payments.',
    impact: ['No overselling under concurrent checkout', 'Real-time anonymous chat', 'Cashless escrow payments'],
    stack: ['Node.js', 'Elasticsearch', 'Socket.IO', 'Escrow payments'],
    links: {},
  },
  {
    slug: 'sonarqube-cleanup',
    title: 'Platform-wide Code Clean-up',
    tagline: 'Paying down security and duplication debt across 21+ services',
    category: 'Code Quality',
    featured: false,
    problem: 'SonarQube was reporting vulnerabilities and large amounts of duplicated code across the ordering platform.',
    solution: 'Led a clean-up across services: fixed flagged vulnerabilities, pulled duplicated logic into shared modules and deleted dead code.',
    impact: ['Net 46K lines of code removed'],
    stack: ['SonarQube', 'Node.js', 'TypeScript'],
    links: {},
  },
  {
    slug: 'portfolio-platform',
    title: 'This Portfolio + Admin API',
    tagline: '3D portfolio with its own backend and dashboard',
    category: 'Full-Stack · Open source',
    featured: false,
    problem: 'I wanted a portfolio that shows full-stack work instead of describing it.',
    solution:
      'React 19 + Three.js frontend on Vercel, and a Fastify + MongoDB API on Render that stores messages, chat questions, guestbook notes and analytics, with a React admin dashboard and GitHub Actions CI.',
    impact: ['Rate-limited, validated public API', 'Admin dashboard with live site settings'],
    stack: ['React', 'Three.js', 'Fastify', 'MongoDB', 'Vercel', 'Render'],
    links: { live: 'https://sanchit-portfolio-chi.vercel.app', repo: 'https://github.com/sanchitjain0/sanchit-portfolio' },
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

/** Logos come from src/data/aiIcons.ts (slug = key there). Same list as the resume. */
export const aiTools = [
  { slug: 'claude', name: 'Claude API', ring: 0, use: 'Claude integrated into Node.js backends behind an API.' },
  { slug: 'anthropic', name: 'Claude Code', ring: 0, use: 'Agentic coding in the terminal: refactors, tests and code review.' },
  { slug: 'githubcopilot', name: 'GitHub Copilot', ring: 0, use: 'Inline completions while writing services and tests.' },
  { slug: 'openai', name: 'OpenAI Codex', ring: 1, use: 'Code generation and quick prototypes.' },
  { slug: 'googlegemini', name: 'Gemini', ring: 1, use: 'Research, long documents and a second opinion on designs.' },
] as const

export const aiSuggestedQuestions = [
  'What does Sanchit work on right now?',
  'What is his tech stack?',
  'Tell me about TagHawk',
  'How does he use AI?',
  'Is he open to new roles?',
]
