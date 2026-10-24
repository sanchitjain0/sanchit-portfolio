import { useEffect, useMemo, useRef, useState } from 'react'
import { techIcons } from '../data/techIcons'
import { useUIStore } from '../store/uiStore'
import { useReducedMotion } from '../hooks/useMediaQuery'

/** brand colours that are too dark (or light) for the current background fall back to the text colour */
function readable(hex: string, theme: 'dark' | 'light') {
  const n = parseInt(hex.slice(1), 16)
  const l = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  if (theme === 'dark' && l < 0.32) return 'var(--fg)'
  if (theme === 'light' && l > 0.82) return 'var(--fg)'
  return hex
}

/**
 * A draggable 3D sphere of tech logos. Projection is done in JS and applied as 2D transforms,
 * so it's one cheap rAF loop – no WebGL needed.
 */
export function SkillGlobe({ onHover }: { onHover: (title: string | null) => void }) {
  const theme = useUIStore((s) => s.theme)
  const reducedMotion = useReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const nodes = useRef<(HTMLButtonElement | null)[]>([])
  const [active, setActive] = useState<string | null>(null)
  const items = useMemo(() => Object.entries(techIcons), [])

  // Fibonacci sphere points
  const points = useMemo(
    () =>
      items.map((_, i) => {
        const y = 1 - (i / (items.length - 1)) * 2
        const r = Math.sqrt(1 - y * y)
        const phi = i * Math.PI * (3 - Math.sqrt(5))
        return [Math.cos(phi) * r, y, Math.sin(phi) * r] as const
      }),
    [items],
  )

  useEffect(() => {
    const el = wrap.current!
    const st = { ax: -0.3, ay: 0, vx: 0, vy: reducedMotion ? 0 : 0.0035, drag: false, px: 0, py: 0, hover: false, visible: true }
    let raf = 0

    const io = new IntersectionObserver(([e]) => {
      st.visible = e.isIntersecting
      if (st.visible) loop()
    })
    io.observe(el)

    const down = (e: PointerEvent) => {
      st.drag = true
      st.px = e.clientX
      st.py = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (!st.drag) return
      st.vy = (e.clientX - st.px) * 0.004
      st.vx = (e.clientY - st.py) * 0.004
      st.px = e.clientX
      st.py = e.clientY
    }
    const up = () => (st.drag = false)
    const enter = () => (st.hover = true)
    const leave = () => (st.hover = false)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)

    const loop = () => {
      cancelAnimationFrame(raf)
      if (!st.visible) return
      const R = el.clientWidth * 0.38
      if (!st.drag) {
        // drift back to a gentle auto-spin (slower while hovered)
        const target = reducedMotion ? 0 : st.hover ? 0.0012 : 0.0035
        st.vy += (target - st.vy) * 0.04
        st.vx *= 0.94
      }
      st.ay += st.vy
      st.ax = Math.max(-1.2, Math.min(1.2, st.ax + st.vx))
      const cx = Math.cos(st.ax)
      const sx = Math.sin(st.ax)
      const cy = Math.cos(st.ay)
      const sy = Math.sin(st.ay)
      points.forEach(([x, y, z], i) => {
        const node = nodes.current[i]
        if (!node) return
        // rotate around Y then X
        const x1 = x * cy + z * sy
        const z1 = -x * sy + z * cy
        const y2 = y * cx - z1 * sx
        const z2 = y * sx + z1 * cx
        const scale = 0.55 + (z2 + 1) * 0.35
        node.style.transform = `translate(-50%, -50%) translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${scale})`
        node.style.opacity = String(0.25 + ((z2 + 1) / 2) * 0.75)
        node.style.zIndex = String(Math.round((z2 + 1) * 100))
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [points, reducedMotion])

  return (
    <div ref={wrap} className="relative mx-auto aspect-square w-full max-w-[460px] cursor-grab touch-pan-y select-none active:cursor-grabbing" aria-label="Tech stack globe">
      <div aria-hidden className="absolute inset-[14%] rounded-full border border-line bg-[radial-gradient(circle_at_35%_30%,var(--glow-1),transparent_70%)]" />
      {items.map(([slug, icon], i) => (
        <button
          key={slug}
          ref={(n) => void (nodes.current[i] = n)}
          type="button"
          className="absolute left-1/2 top-1/2 grid h-12 w-12 place-items-center rounded-xl border border-line bg-surface shadow-sm transition-[box-shadow,border-color] hover:border-accent focus-visible:border-accent"
          style={{ boxShadow: active === slug ? `0 0 0 2px ${readable(icon.hex, theme)}` : undefined }}
          onPointerEnter={() => {
            setActive(slug)
            onHover(icon.title)
          }}
          onPointerLeave={() => {
            setActive(null)
            onHover(null)
          }}
          onFocus={() => onHover(icon.title)}
          onBlur={() => onHover(null)}
          aria-label={icon.title}
          title={icon.title}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill={readable(icon.hex, theme)} aria-hidden>
            <path d={icon.path} />
          </svg>
        </button>
      ))}
      {active && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center font-mono text-sm text-accent">{techIcons[active].title}</p>
      )}
    </div>
  )
}
