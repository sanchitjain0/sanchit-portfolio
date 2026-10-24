/**
 * Frontend ↔ backend contract (see docs/API.md).
 *
 * The real backend isn't deployed yet, so VITE_API_BASE_URL defaults to a dummy URL and
 * every call falls back to a local mock when the request fails or times out. Once the BE is
 * live, set VITE_API_BASE_URL in .env (or Vercel) and the site uses it with no code changes.
 */

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'https://api.example.com/v1' // TODO: real URL

/** true while the base URL is still the placeholder – skip the network entirely */
export const API_IS_PLACEHOLDER = API_BASE_URL.includes('example.com')

export type ApiSource = 'api' | 'mock'
export interface ApiResult<T> {
  data: T
  source: ApiSource
  ms: number
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown, timeoutMs = 4000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(res.status, json?.error?.message ?? res.statusText)
    return json as T
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Try the real API; on network failure / placeholder URL use the mock. Validation (4xx) errors are re-thrown.
 * `fallback: false` is for writes that must never be silently dropped (contact form): once a real backend
 * is configured, a failure surfaces as an error instead of a fake success.
 */
async function withMock<T>(call: () => Promise<T>, mock: () => T | Promise<T>, { fallback = true } = {}): Promise<ApiResult<T>> {
  const t0 = performance.now()
  if (!API_IS_PLACEHOLDER) {
    try {
      const data = await call()
      return { data, source: 'api', ms: Math.round(performance.now() - t0) }
    } catch (err) {
      if (!fallback || (err instanceof ApiError && err.status >= 400 && err.status < 500)) throw err
      console.warn('[api] falling back to mock:', err)
    }
  }
  const data = await mock()
  return { data, source: 'mock', ms: Math.round(performance.now() - t0) }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/* ── endpoints ─────────────────────────────────────────────────────────────── */

export interface HealthResponse {
  status: 'ok' | 'degraded'
  version: string
  uptimeSec: number
}
/**
 * The free Render instance sleeps after 15 idle minutes and needs ~30-60 s to boot.
 * Pinging /health as soon as the page opens wakes it up while the visitor reads the hero.
 */
export function warmUpApi() {
  if (API_IS_PLACEHOLDER) return
  fetch(`${API_BASE_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {})
}

export const getHealth = () =>
  withMock<HealthResponse>(
    () => request('GET', '/health', undefined, 2500),
    () => ({ status: 'ok', version: 'mock', uptimeSec: Math.round(performance.now() / 1000) }),
  )

export interface ContactRequest {
  name: string
  email: string
  message: string
}
export interface ContactResponse {
  id: string
  receivedAt: string
}
export const sendContact = (body: ContactRequest) =>
  withMock<ContactResponse>(
    () => request('POST', '/contact', body, 60000), // allow for a cold start
    async () => {
      await wait(500)
      return { id: `mock_${Date.now().toString(36)}`, receivedAt: new Date().toISOString() }
    },
    { fallback: false },
  )

export interface TraceStep {
  service: string
  message: string
  ms: number
}
export interface DemoOrderResponse {
  orderId: string
  status: 'PAID' | 'FAILED'
  trace: TraceStep[]
}
export const createDemoOrder = (body: { source: 'kiosk' | 'web'; city: string }, mockTrace: TraceStep[]) =>
  withMock<DemoOrderResponse>(
    () => request('POST', '/demo/orders', body),
    () => ({ orderId: `ord_${Math.random().toString(36).slice(2, 8)}`, status: 'PAID', trace: mockTrace }),
  )

export interface ListingsResponse {
  items: { id: string; title: string; price: number; currency: string; community: string }[]
}
export const getTagHawkListings = (community: string) =>
  withMock<ListingsResponse>(
    () => request('GET', `/taghawk/listings?community=${encodeURIComponent(community)}&limit=4`),
    async () => {
      await wait(180)
      return {
        items: [
          { id: 'l1', title: 'IKEA desk', price: 45, currency: 'USD', community },
          { id: 'l2', title: 'Mini fridge', price: 60, currency: 'USD', community },
          { id: 'l3', title: 'Road bike', price: 180, currency: 'USD', community },
          { id: 'l4', title: 'Bookshelf', price: 25, currency: 'USD', community },
        ],
      }
    },
  )

/* ── AI: "Ask my portfolio" ───────────────────────────────────────────────── */

export interface AskRequest {
  question: string
  /** previous turns, newest last (the backend should cap this) */
  history?: { role: 'user' | 'assistant'; content: string }[]
}
export interface AskResponse {
  answer: string
  model: string
}

/**
 * The backend answers with the Claude API (see docs/API.md). Until it is live, a small local
 * retrieval over portfolio.ts answers instead, so the widget always works.
 */
export const askPortfolio = (body: AskRequest, localAnswer: (q: string) => string) =>
  withMock<AskResponse>(
    () => request('POST', '/ai/ask', body, 20000),
    async () => {
      await wait(450)
      return { answer: localAnswer(body.question), model: 'local-mock' }
    },
  )

/* ── site config (edited from the admin dashboard) ───────────────────────────── */

export interface PublicConfig {
  available: boolean
  availabilityText: string
  currentlyWorkingOn: string
  banner: { text: string; link: string | null } | null
  guestbookEnabled: boolean
}
export const getPublicConfig = (fallback: PublicConfig) =>
  withMock<PublicConfig>(() => request('GET', '/public/config', undefined, 8000), () => fallback)

/* ── guestbook ─────────────────────────────────────────────────────────────── */

export interface GuestbookNote {
  id: string
  name: string
  message: string
  createdAt: string
}
export const getGuestbook = () =>
  withMock<{ items: GuestbookNote[] }>(
    () => request('GET', '/guestbook', undefined, 8000),
    () => ({ items: [] }),
  )
export const postGuestbook = (body: { name: string; message: string; website?: string }) =>
  withMock<{ status: 'pending'; message: string }>(
    () => request('POST', '/guestbook', body, 60000),
    async () => {
      await wait(400)
      return { status: 'pending', message: 'Thanks! Your note will appear once it’s approved.' }
    },
    { fallback: false },
  )

/* ── project reactions ─────────────────────────────────────────────────────── */

export interface ReactionsResponse {
  counts: Record<string, number>
  mine: string[]
}
const LOCAL_LIKES = 'sanchit.likes'
const localLikes = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_LIKES) ?? '[]')
  } catch {
    return []
  }
}
export const getReactions = () =>
  withMock<ReactionsResponse>(
    () => request('GET', '/reactions', undefined, 8000),
    () => {
      const mine = localLikes()
      return { counts: Object.fromEntries(mine.map((m) => [m, 1])), mine }
    },
  )
export const toggleReaction = (project: string) =>
  withMock<{ project: string; liked: boolean; count: number }>(
    () => request('POST', '/reactions', { project }, 20000),
    () => {
      const mine = localLikes()
      const liked = !mine.includes(project)
      const next = liked ? [...mine, project] : mine.filter((m) => m !== project)
      try {
        localStorage.setItem(LOCAL_LIKES, JSON.stringify(next))
      } catch {
        /* private mode */
      }
      return { project, liked, count: liked ? 1 : 0 }
    },
  )

/* ── anonymous analytics (no cookies, no personal data; honours Do Not Track) ── */

export type TrackEvent = 'page_view' | 'section_view' | 'resume_download' | 'theme_toggle' | 'room_click' | 'outbound_click' | 'project_reaction'
const dnt = typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1')

export function track(type: TrackEvent, label?: string) {
  if (API_IS_PLACEHOLDER || dnt) return
  const body: Record<string, string> = { type, path: location.pathname.slice(0, 120) }
  if (label) body.label = label.slice(0, 80)
  if (type === 'page_view') {
    body.device = matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop'
    try {
      const ref = document.referrer ? new URL(document.referrer).hostname : ''
      if (ref && ref !== location.hostname) body.referrer = ref.slice(0, 120)
    } catch {
      /* ignore */
    }
  }
  // keepalive lets the request finish even if the visitor navigates away
  fetch(`${API_BASE_URL}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {})
}
