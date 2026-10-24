import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { profile, stats } from '../data/portfolio'
import { useUIStore } from '../store/uiStore'
import { useFinePointer, useIsMobile, useReducedMotion } from '../hooks/useMediaQuery'
import { useInView, usePageVisible } from '../hooks/useInView'
import { hasWebGL } from '../hooks/useWebGL'
import type { HotspotId } from './three/DevRoom'
import { Tilt } from './ui/Tilt'
import { SceneBoundary } from './ui/SceneBoundary'

// three.js + the room live in their own lazily-loaded chunk
const DevRoom = lazy(() => import('./three/DevRoom'))

function RoomLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center" role="status" aria-label="Loading 3D workspace">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" aria-hidden />
        <span className="font-mono text-xs text-muted">booting workspace…</span>
      </div>
    </div>
  )
}

function RoomImage({ theme }: { theme: string }) {
  return (
    <img
      src={`/room-${theme}.png`}
      alt="Illustration of Sanchit's developer workspace: desk with monitors, a server rack, bookshelf and plant"
      className="h-full w-full object-contain"
    />
  )
}

export function Hero() {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage)
  const pageVisible = usePageVisible()
  const isMobile = useIsMobile()
  const fine = useFinePointer()
  const reducedMotion = useReducedMotion()
  const [webgl] = useState(hasWebGL)
  const [mounted, setMounted] = useState(false)
  // mount the canvas after first paint so text renders first (better LCP)
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(id)
  }, [])

  const navigate = (id: HotspotId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <section id="top" className="relative mx-auto max-w-7xl px-4 pt-24 sm:px-6 md:pt-28">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="relative z-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg-2">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {profile.availability}
          </p>
          <p className="font-mono text-sm text-accent">
            {profile.name} · {profile.role}
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            I build the systems behind <span className="gradient-text">millions of food orders.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-2 sm:text-lg">{profile.heroSubtext}</p>
          <p className="mt-3 text-sm text-muted">{profile.subRole}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={profile.ctaPrimary.href} className="btn-primary">
              {profile.ctaPrimary.label} →
            </a>
            <a href={profile.ctaSecondary.href} download className="btn-ghost">
              {profile.ctaSecondary.label}
            </a>
            <a href={profile.social.linkedin} target="_blank" rel="noreferrer" className="btn-ghost !px-3.5" aria-label="LinkedIn">
              in
            </a>
            <a href={profile.social.github} target="_blank" rel="noreferrer" className="btn-ghost !px-3.5" aria-label="GitHub">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="relative">
          <div ref={stage} className="relative h-[360px] w-full sm:h-[460px] lg:h-[600px]">
            {webgl && mounted ? (
              <SceneBoundary fallback={<RoomImage theme={theme} />}>
                <Suspense fallback={<RoomLoading />}>
                  <DevRoom
                    theme={theme}
                    lite={isMobile || !fine}
                    reducedMotion={reducedMotion}
                    paused={!inView || !pageVisible}
                    onNavigate={navigate}
                    onToggleTheme={toggleTheme}
                  />
                </Suspense>
              </SceneBoundary>
            ) : !webgl ? (
              <RoomImage theme={theme} />
            ) : null}
            <p className="sr-only">
              Interactive 3D workspace. The monitor links to Projects, the dashboard to Experience, the server rack to Architecture, the bookshelf to Engineering notes, the poster to About, the laptop to TagHawk and the coffee mug to Contact. The floor lamp switches the theme.
            </p>
          </div>
          {webgl && (
            <p className="mt-1 text-center font-mono text-xs text-muted">
              drag to look around · click glowing objects · the floor lamp switches day / night
            </p>
          )}
        </div>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-3 pb-6 md:grid-cols-4">
        {stats.map((s) => (
          <Tilt key={s.label} className="card p-5" max={10}>
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-3xl font-bold text-fg">{s.value}</dd>
          </Tilt>
        ))}
      </dl>
    </section>
  )
}
