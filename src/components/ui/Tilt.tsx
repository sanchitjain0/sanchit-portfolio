import { useRef, type ReactNode } from 'react'

const canTilt = () => typeof window !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches

/** Card that tilts toward the pointer in 3D with a soft glare. Pure CSS transforms (GPU-cheap). */
export function Tilt({ as = 'div', className = '', max = 7, children }: { as?: 'div' | 'li' | 'article'; className?: string; max?: number; children: ReactNode }) {
  const Tag = as as 'div'
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const onMove = (e: React.PointerEvent) => {
    if (!canTilt()) return
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - y) * max}deg`)
      el.style.setProperty('--ry', `${(x - 0.5) * max}deg`)
      el.style.setProperty('--gx', `${x * 100}%`)
      el.style.setProperty('--gy', `${y * 100}%`)
      el.style.setProperty('--glare', '1')
    })
  }
  const onLeave = () => {
    const el = ref.current!
    cancelAnimationFrame(frame.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--glare', '0')
  }
  return (
    <Tag ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </Tag>
  )
}
