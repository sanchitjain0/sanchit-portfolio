import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { aiSuggestedQuestions, aiTools } from '../../data/portfolio'
import { aiIcons } from '../../data/aiIcons'
import { askPortfolio } from '../../lib/api'
import { localAnswer } from '../../lib/localAnswer'
import { useUIStore } from '../../store/uiStore'
import { useReducedMotion } from '../../hooks/useMediaQuery'

function readable(hex: string, theme: 'dark' | 'light') {
  const n = parseInt(hex.slice(1), 16)
  const l = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  if (theme === 'dark' && l < 0.32) return 'var(--fg)'
  if (theme === 'light' && l > 0.8) return 'var(--fg)'
  return hex
}

/** Two tilted orbits of AI tool logos around a glowing core – JS-projected 3D, no WebGL. */
function AIOrbit({ onFocus, focused }: { onFocus: (slug: string | null) => void; focused: string | null }) {
  const theme = useUIStore((s) => s.theme)
  const reducedMotion = useReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const paused = useRef(false)
  const rings = useMemo(() => [aiTools.filter((t) => t.ring === 0), aiTools.filter((t) => t.ring === 1)], [])

  useEffect(() => {
    const el = wrap.current!
    let raf = 0
    let t = 0
    let last = performance.now()
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    })
    io.observe(el)
    const loop = (now: number) => {
      if (!visible) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!paused.current && !reducedMotion) t += dt
      const W = el.clientWidth
      let i = 0
      rings.forEach((ring, r) => {
        const rx = W * (r === 0 ? 0.25 : 0.42)
        const ry = rx * 0.38
        const speed = r === 0 ? 0.35 : -0.22
        ring.forEach((_, k) => {
          const node = items.current[i++]
          if (!node) return
          const a = t * speed + (k / ring.length) * Math.PI * 2 + r * 0.4
          const depth = Math.sin(a) // -1 back … 1 front
          const s = 0.72 + (depth + 1) * 0.2
          node.style.transform = `translate(-50%, -50%) translate3d(${Math.cos(a) * rx}px, ${depth * ry}px, 0) scale(${s})`
          node.style.zIndex = String(depth > 0 ? 30 : 5)
          node.style.opacity = String(0.55 + (depth + 1) * 0.225)
        })
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [rings, reducedMotion])

  return (
    <div
      ref={wrap}
      className="relative mx-auto aspect-[1.3] w-full max-w-[560px]"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      {/* orbit paths */}
      {[0.5, 0.84].map((w) => (
        <div key={w} aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-line" style={{ width: `${w * 100}%`, height: `${w * 38}%` }} />
      ))}
      {/* core */}
      <div aria-hidden className="absolute left-1/2 top-1/2 z-10 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--accent),var(--accent-2))] font-display text-lg font-bold text-white shadow-[0_0_60px_-6px_var(--accent)]">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/20 [animation-duration:2.4s]" />
        SJ + AI
      </div>
      {rings.flat().map((tool, i) => {
        const icon = aiIcons[tool.slug]
        return (
          <button
            key={tool.slug + tool.name}
            ref={(n) => void (items.current[i] = n)}
            type="button"
            onPointerEnter={() => onFocus(tool.slug + tool.name)}
            onFocus={() => onFocus(tool.slug + tool.name)}
            onClick={() => onFocus(tool.slug + tool.name)}
            className={`absolute left-1/2 top-1/2 flex items-center gap-2 rounded-2xl border bg-surface px-3 py-2 shadow-sm backdrop-blur transition-[border-color,box-shadow] ${
              focused === tool.slug + tool.name ? 'border-accent shadow-[0_0_0_2px_var(--accent)]' : 'border-line'
            }`}
            aria-label={`${tool.name}: ${tool.use}`}
          >
            {icon && (
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill={readable(icon.hex, theme)} aria-hidden>
                <path d={icon.path} />
              </svg>
            )}
            <span className="whitespace-nowrap text-xs font-semibold text-fg">{tool.name}</span>
          </button>
        )
      })}
    </div>
  )
}

type Msg = { role: 'user' | 'assistant'; content: string; meta?: string }

export function AIWorkflow() {
  const [focused, setFocused] = useState<string | null>(aiTools[0].slug + aiTools[0].name)
  const tool = aiTools.find((t) => t.slug + t.name === focused) ?? aiTools[0]
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: "Hi! I'm Sanchit's portfolio assistant. Ask me about his work, stack or projects." }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  const ask = async (question: string) => {
    const q = question.trim()
    if (!q || busy) return
    setInput('')
    setBusy(true)
    const history = msgs.filter((m) => m.role === 'user' || m.role === 'assistant').map(({ role, content }) => ({ role, content }))
    setMsgs((m) => [...m, { role: 'user', content: q }])
    try {
      const res = await askPortfolio({ question: q, history: history.slice(-6) }, localAnswer)
      const meta = `${res.data.model} · ${res.ms}ms · ${res.source === 'mock' ? 'offline answer (backend not connected)' : 'live API'}`
      // type the answer out
      const full = res.data.answer
      setMsgs((m) => [...m, { role: 'assistant', content: '', meta }])
      const steps = Array.from({ length: Math.ceil(full.length / 3) }, (_, k) => (k + 1) * 3)
      for (const end of steps) {
        await new Promise((r) => setTimeout(r, 12))
        setMsgs((m) => [...m.slice(0, -1), { role: 'assistant', content: full.slice(0, end), meta }])
      }
      setMsgs((m) => [...m.slice(0, -1), { role: 'assistant', content: full, meta }])
    } catch (err) {
      setMsgs((m) => [...m, { role: 'assistant', content: `Sorry, that failed: ${(err as Error).message}` }])
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void ask(input)
  }

  return (
    <section id="ai" className="section" aria-labelledby="ai-title">
      <p className="kicker">AI-augmented engineering</p>
      <h2 id="ai-title" className="section-title">
        I ship faster with AI, <span className="gradient-text">and build with it too.</span>
      </h2>

      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <AIOrbit focused={focused} onFocus={setFocused} />
          <div className="card mt-4 p-5" aria-live="polite">
            <p className="font-mono text-xs text-accent">{tool.name}</p>
            <p className="mt-1 text-fg-2">{tool.use}</p>
          </div>
        </div>

        <div className="card flex h-[520px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div>
              <p className="font-display font-semibold text-fg">Ask my portfolio</p>
              <p className="font-mono text-[11px] text-muted">POST /ai/ask → Claude API (via my backend)</p>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden /> online
            </span>
          </div>
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-5" role="log" aria-live="polite" aria-label="Chat">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-accent text-on-accent' : 'border border-line bg-surface-2 text-fg'}`}>
                  {m.content || <span className="inline-block h-4 w-8 animate-pulse rounded bg-line" />}
                  {m.meta && <p className="mt-1.5 font-mono text-[10px] text-muted">{m.meta}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line p-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {aiSuggestedQuestions.map((q) => (
                <button key={q} type="button" disabled={busy} onClick={() => void ask(q)} className="chip shrink-0 whitespace-nowrap hover:border-accent disabled:opacity-50">
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex gap-2">
              <label htmlFor="ask-input" className="sr-only">
                Ask a question about Sanchit
              </label>
              <input
                id="ask-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Ask anything about my work…"
                className="flex-1 rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
              />
              <button type="submit" disabled={busy || !input.trim()} className="btn-primary !px-4 !py-2.5 disabled:opacity-50">
                Ask
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
