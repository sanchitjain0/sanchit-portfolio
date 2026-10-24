import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { markets, restaurantBrands } from '../../data/portfolio'
import { useUIStore } from '../../store/uiStore'
import { useInView, usePageVisible } from '../../hooks/useInView'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery'
import { hasWebGL } from '../../hooks/useWebGL'
import { SceneBoundary } from '../ui/SceneBoundary'

const OrdersGlobe = lazy(() => import('../three/OrdersGlobe'))

/** simulated live counter, only animates while visible */
function useTicker(active: boolean, start: number) {
  const [n, setN] = useState(start)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setN((v) => v + 1 + Math.floor(Math.random() * 4)), 450)
    return () => clearInterval(id)
  }, [active])
  return n
}

export function RestaurantTech() {
  const theme = useUIStore((s) => s.theme)
  const stage = useRef<HTMLDivElement>(null)
  const near = useInView(stage, { rootMargin: '400px', once: true })
  const visible = useInView(stage)
  const pageVisible = usePageVisible()
  const fine = useFinePointer()
  const reducedMotion = useReducedMotion()
  const [webgl] = useState(hasWebGL)
  const [brand, setBrand] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>('Riyadh')
  const orders = useTicker(visible && !reducedMotion, 128_406)

  const b = restaurantBrands.find((x) => x.id === brand)
  const m = markets.find((x) => x.city === city)

  return (
    <section id="restaurants" className="section" aria-labelledby="restaurants-title">
      <p className="kicker">Restaurant tech · MENA &amp; Central Asia</p>
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <h2 id="restaurants-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            The ordering platforms behind <span className="gradient-text">your favourite meals.</span>
          </h2>
          <p className="mt-4 text-fg-2">
            I work on the multi-brand ordering platform for quick-service restaurants across the Middle East, North Africa and Central Asia: online, app, kiosk and delivery orders flowing into kitchens and POS systems.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="card p-4">
              <p className="text-xs text-muted">Orders (simulated)</p>
              <p className="mt-1 font-display text-xl font-bold tabular-nums text-fg">{orders.toLocaleString('en-US')}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-muted">Markets</p>
              <p className="mt-1 font-display text-xl font-bold text-fg">{markets.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-muted">Brands</p>
              <p className="mt-1 font-display text-xl font-bold text-fg">{restaurantBrands.length}</p>
            </div>
          </div>

          <p className="mt-6 mb-2 text-sm text-muted">Filter the live orders by brand, or click a dish on the globe:</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Brands">
            {restaurantBrands.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={brand === x.id}
                onClick={() => setBrand(brand === x.id ? null : x.id)}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition"
                style={brand === x.id ? { borderColor: x.color, background: `${x.color}22`, color: 'var(--fg)' } : { borderColor: 'var(--line)', color: 'var(--fg-2)' }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.color }} aria-hidden />
                {x.name}
              </button>
            ))}
          </div>

          <div className="card mt-4 p-5" aria-live="polite">
            {b ? (
              <>
                <p className="font-mono text-xs" style={{ color: b.color }}>
                  {b.name}
                </p>
                <p className="mt-1 text-fg-2">{b.note}</p>
              </>
            ) : m ? (
              <>
                <p className="font-mono text-xs text-accent">
                  {m.city}, {m.country}
                  {'hub' in m && m.hub ? ' · hub' : ''}
                </p>
                <p className="mt-1 text-fg-2">Orders from {m.city} flow through the same gateway, order and payment services, with local currency, language and POS rules.</p>
              </>
            ) : (
              <p className="text-fg-2">Click a city on the globe.</p>
            )}
          </div>
          <p className="mt-4 text-xs text-muted">
            Brand names belong to their respective owners and are used only to describe client work; this site isn’t affiliated with or endorsed by them. Order numbers here are simulated.
          </p>
        </div>

        <div ref={stage} className="relative h-[440px] sm:h-[560px]">
          <div aria-hidden className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,var(--glow-1),transparent_65%)] blur-2xl" />
          {webgl && near ? (
            <SceneBoundary fallback={<p className="grid h-full place-items-center text-sm text-muted">3D globe unavailable on this device.</p>}>
              <Suspense fallback={<p className="grid h-full place-items-center font-mono text-xs text-muted">spinning up the globe…</p>}>
                <OrdersGlobe
                  theme={theme}
                  brand={brand}
                  onBrand={setBrand}
                  city={city}
                  onCity={(c) => {
                    setCity(c)
                    setBrand(null)
                  }}
                  paused={!visible || !pageVisible}
                  interactive={fine}
                  reducedMotion={reducedMotion}
                />
              </Suspense>
            </SceneBoundary>
          ) : null}
          <p className="pointer-events-none absolute right-2 top-1 font-mono text-xs text-muted">{fine ? 'drag to rotate · ' : ''}click a city or a dish</p>
        </div>
      </div>
    </section>
  )
}
