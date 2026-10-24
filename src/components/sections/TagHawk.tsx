import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { projects, taghawkFeatures } from '../../data/portfolio'
import { getTagHawkListings, type ApiSource } from '../../lib/api'
import { useUIStore } from '../../store/uiStore'
import { useInView, usePageVisible } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { hasWebGL } from '../../hooks/useWebGL'
import { SceneBoundary } from '../ui/SceneBoundary'
import { ReactionButton } from '../ui/ReactionButton'
import type { FeatureId, Listing } from '../three/PhoneShowcase'

const PhoneShowcase = lazy(() => import('../three/PhoneShowcase'))
const project = projects.find((p) => p.slug === 'taghawk')!

export function TagHawk() {
  const theme = useUIStore((s) => s.theme)
  const stage = useRef<HTMLDivElement>(null)
  const near = useInView(stage, { rootMargin: '400px', once: true })
  const visible = useInView(stage)
  const pageVisible = usePageVisible()
  const reducedMotion = useReducedMotion()
  const [webgl] = useState(hasWebGL)
  const [feature, setFeature] = useState<FeatureId>('feed')
  const [auto, setAuto] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [call, setCall] = useState<{ source: ApiSource; ms: number } | null>(null)

  // real API call (mocked until the backend URL is set)
  useEffect(() => {
    if (!near) return
    getTagHawkListings('Boston University').then((r) => {
      setListings(r.data.items)
      setCall({ source: r.source, ms: r.ms })
    })
  }, [near])

  // tour the features until the visitor picks one
  useEffect(() => {
    if (!auto || !visible || reducedMotion) return
    const ids = taghawkFeatures.map((f) => f.id)
    const id = setInterval(() => setFeature((f) => ids[(ids.indexOf(f) + 1) % ids.length]), 5200)
    return () => clearInterval(id)
  }, [auto, visible, reducedMotion])

  const current = taghawkFeatures.find((f) => f.id === feature)!

  return (
    <section id="taghawk" className="section" aria-labelledby="taghawk-title">
      <p className="kicker">Case study · {project.category}</p>
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 id="taghawk-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            TagHawk: <span className="gradient-text">{project.tagline.toLowerCase()}.</span>
          </h2>
          <p className="mt-4 text-fg-2">{project.problem}</p>
          <p className="mt-3 text-fg-2">{project.solution}</p>

          <div className="mt-8 grid grid-cols-2 gap-2" role="tablist" aria-label="TagHawk features">
            {taghawkFeatures.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={feature === f.id}
                onClick={() => {
                  setAuto(false)
                  setFeature(f.id)
                }}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  feature === f.id ? 'border-accent bg-surface-2 text-fg shadow-[0_0_0_1px_var(--accent)]' : 'border-line bg-surface text-fg-2 hover:border-accent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="card mt-4 p-5" role="tabpanel" aria-live="polite">
            <p className="font-mono text-xs text-accent">{current.api}</p>
            <p className="mt-2 text-fg-2">{current.detail}</p>
            {feature === 'feed' && call && (
              <p className="mt-3 font-mono text-[11px] text-muted">
                fetched {listings.length} listings in {call.ms}ms · {call.source === 'mock' ? 'mock API' : 'live API'}
              </p>
            )}
          </div>
          <div className="mt-5">
            <ReactionButton project="taghawk" title="TagHawk" />
          </div>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
            {project.stack.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div ref={stage} className="relative h-[480px] sm:h-[560px]">
          <div aria-hidden className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,var(--glow-1),transparent_65%)] blur-2xl" />
          {webgl && near ? (
            <SceneBoundary fallback={<p className="grid h-full place-items-center text-sm text-muted">3D preview unavailable on this device.</p>}>
            <Suspense fallback={<p className="grid h-full place-items-center font-mono text-xs text-muted">loading phone…</p>}>
              <PhoneShowcase feature={feature} listings={listings} theme={theme} paused={!visible || !pageVisible} reducedMotion={reducedMotion} />
            </Suspense>
            </SceneBoundary>
          ) : null}
          <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center font-mono text-xs text-muted">drag the phone to rotate it</p>
        </div>
      </div>
    </section>
  )
}
