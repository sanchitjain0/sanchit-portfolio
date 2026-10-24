import { useEffect } from 'react'
import { track, warmUpApi } from '../lib/api'
import { useSiteStore } from '../store/siteStore'

let booted = false

/** wakes the API, loads live site config, and records anonymous page / section / click events */
export function useSiteBootstrap() {
  useEffect(() => {
    if (!booted) {
      // once per page load (React StrictMode runs effects twice in dev)
      booted = true
      warmUpApi()
      useSiteStore.getState().load()
      track('page_view')
    }

    // each section counts once per visit
    const seen = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id
          if (e.isIntersecting && id && !seen.has(id)) {
            seen.add(id)
            track('section_view', id)
          }
        }
      },
      { threshold: 0.35 },
    )
    document.querySelectorAll('main section[id]').forEach((s) => io.observe(s))

    // resume downloads + outbound links
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a')
      if (!a) return
      const href = a.getAttribute('href') ?? ''
      if (href.endsWith('.pdf')) track('resume_download')
      else if (/^https?:\/\//.test(href) && !href.includes(location.hostname)) {
        try {
          track('outbound_click', new URL(href).hostname)
        } catch {
          /* ignore */
        }
      }
    }
    document.addEventListener('click', onClick)
    return () => {
      io.disconnect()
      document.removeEventListener('click', onClick)
    }
  }, [])
}
