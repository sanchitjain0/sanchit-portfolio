import { useState } from 'react'
import { useSiteStore } from '../../store/siteStore'

/** announcement strip under the navbar – text/link come from the admin dashboard */
export function Banner() {
  const banner = useSiteStore((s) => s.config.banner)
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem('sanchit.banner.hidden') === banner?.text
    } catch {
      return false
    }
  })
  if (!banner?.text || hidden) return null
  const dismiss = () => {
    setHidden(true)
    try {
      sessionStorage.setItem('sanchit.banner.hidden', banner.text)
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent to-accent-2 px-4 py-1.5 text-center text-sm font-medium text-white">
      {banner.link ? (
        <a href={banner.link} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
          {banner.text} →
        </a>
      ) : (
        <span>{banner.text}</span>
      )}
      <button type="button" onClick={dismiss} aria-label="Dismiss announcement" className="opacity-80 hover:opacity-100">
        ✕
      </button>
    </div>
  )
}
