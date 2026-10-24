import { useEffect, useState, type RefObject } from 'react'

/** IntersectionObserver as a hook. `once` keeps it true after the first hit. */
export function useInView(ref: RefObject<Element | null>, { threshold = 0, rootMargin = '0px', once = false } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) io.disconnect()
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold, rootMargin, once])
  return inView
}

export function usePageVisible() {
  const [visible, setVisible] = useState(() => (typeof document === 'undefined' ? true : !document.hidden))
  useEffect(() => {
    const on = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}
