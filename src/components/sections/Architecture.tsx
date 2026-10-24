import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { KIND_LABEL, nodes, orderPath } from '../../data/architecture'
import { useUIStore } from '../../store/uiStore'
import { useInView, usePageVisible } from '../../hooks/useInView'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery'
import { hasWebGL } from '../../hooks/useWebGL'
import { SceneBoundary } from '../ui/SceneBoundary'
import type { Trace } from '../three/ArchitectureBoard'
import { createDemoOrder, type ApiSource } from '../../lib/api'

const ArchitectureBoard = lazy(() => import('../three/ArchitectureBoard'))

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
// keep in sync with KIND_COLORS in ArchitectureBoard
const LEGEND = {
  dark: { client: '#94a3b8', edge: '#fbbf24', service: '#22d3ee', messaging: '#e879f9', data: '#818cf8', platform: '#34d399' },
  light: { client: '#64748b', edge: '#d97706', service: '#0e7490', messaging: '#a21caf', data: '#4f46e5', platform: '#059669' },
} as const

export function Architecture() {
  const theme = useUIStore((s) => s.theme)
  const stage = useRef<HTMLDivElement>(null)
  const near = useInView(stage, { rootMargin: '400px', once: true })
  const visible = useInView(stage)
  const pageVisible = usePageVisible()
  const fine = useFinePointer()
  const reducedMotion = useReducedMotion()
  const [webgl] = useState(hasWebGL)

  const [selected, setSelected] = useState<string>('order')
  const [trace, setTrace] = useState<Trace | null>(null)
  const [visited, setVisited] = useState<string[]>([])
  const [log, setLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const node = byId[selected]

  const [meta, setMeta] = useState<{ source: ApiSource; ms: number; orderId: string } | null>(null)

  const placeOrder = async () => {
    if (running) return
    setRunning(true)
    setLog(['→ POST /demo/orders { source: "kiosk", city: "Almaty" }'])
    setVisited([])
    setMeta(null)
    const mockTrace = orderPath.map((p, i) => ({ service: p.node, message: p.log, ms: [4, 2, 6, 11, 38, 3, 2, 9, 5][i] ?? 3 }))
    let steps = mockTrace
    try {
      const res = await createDemoOrder({ source: 'kiosk', city: 'Almaty' }, mockTrace)
      setMeta({ source: res.source, ms: res.ms, orderId: res.data.orderId })
      // only animate services the graph knows about
      steps = res.data.trace.filter((t) => byId[t.service])
    } catch (err) {
      setLog((l) => [...l, `✖ ${(err as Error).message}`])
      setRunning(false)
      return
    }
    const stepMs = reducedMotion ? 120 : 650
    steps.forEach((step, i) => {
      timers.current.push(
        setTimeout(() => {
          setLog((l) => [...l, `${step.message}  (${step.ms}ms)`])
          setSelected(step.service)
          setVisited((v) => [...v, step.service])
          const next = steps[i + 1]
          setTrace(next ? { from: step.service, to: next.service, startedAt: performance.now() } : null)
          if (!next) {
            setLog((l) => [...l, '← 201 Created · order PAID'])
            setRunning(false)
          }
        }, (i + 1) * stepMs),
      )
    })
  }

  return (
    <section id="architecture" className="section" aria-labelledby="architecture-title">
      <p className="kicker">Architecture</p>
      <h2 id="architecture-title" className="section-title">
        The kind of platform I work on, <span className="gradient-text">in 3D.</span>
      </h2>
      <p className="-mt-6 mb-8 max-w-2xl text-fg-2">
        A simplified map of a multi-brand ordering platform, laid out tier by tier. Hover or click a tile, drag to tilt the board, or send a test order through it. No internal details, just the shape of the system.
      </p>

      <div ref={stage} className="card relative h-[560px] overflow-hidden sm:h-[540px]">
        {webgl && near ? (
          <SceneBoundary fallback={<p className="grid h-full place-items-center text-sm text-muted">3D view unavailable. Use the component buttons below.</p>}>
            <Suspense fallback={<p className="grid h-full place-items-center font-mono text-xs text-muted">rendering architecture…</p>}>
              <ArchitectureBoard
                theme={theme}
                selected={selected}
                onSelect={setSelected}
                trace={trace}
                visited={visited}
                paused={!visible || !pageVisible}
                interactive={fine}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </SceneBoundary>
        ) : null}
        <ul className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5" aria-label="Legend">
          {(['client', 'edge', 'service', 'messaging', 'data', 'platform'] as const).map((k) => (
            <li key={k} className="flex items-center gap-1.5 rounded-md border border-line bg-surface/80 px-2 py-1 font-mono text-[10px] text-fg-2 backdrop-blur">
              <span className="h-2 w-2 rounded-sm" style={{ background: LEGEND[theme][k] }} aria-hidden />
              {KIND_LABEL[k]}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="card p-6" aria-live="polite">
          <p className="font-mono text-xs" style={{ color: LEGEND[theme][node.kind] }}>
            {KIND_LABEL[node.kind]}
          </p>
          <h3 className="mt-1 text-2xl font-semibold">{node.label}</h3>
          <p className="mt-2 text-fg-2">{node.description}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {node.tags.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="card flex flex-col p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={placeOrder} disabled={running} className="btn-primary disabled:opacity-60">
              {running ? 'Order in flight…' : 'Send a test order'}
            </button>
            {meta && (
              <p className="font-mono text-[11px] text-muted">
                {meta.orderId} · {meta.ms}ms · {meta.source === 'mock' ? 'mock API' : 'live API'}
              </p>
            )}
          </div>
          <div className="mt-3 min-h-[10rem] flex-1 rounded-xl border border-line bg-bg p-3 font-mono text-xs leading-relaxed" role="log" aria-label="Order trace">
            {log.length === 0 ? (
              <p className="text-muted">$ waiting for traffic…</p>
            ) : (
              log.map((l, i) => (
                <p key={i} className={i === log.length - 1 ? 'text-accent' : 'text-fg-2'}>
                  {l}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* every node as a button: keyboard/screen-reader access to the same content */}
      <div className="mt-5">
        <p className="mb-2 text-sm text-muted">Explore the components:</p>
        <ul className="flex flex-wrap gap-2">
          {nodes.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                aria-pressed={selected === n.id}
                onClick={() => setSelected(n.id)}
                className={`chip transition ${selected === n.id ? '!border-accent !text-accent' : 'hover:border-accent'}`}
              >
                {n.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
