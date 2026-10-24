import { useEffect, useState } from 'react'
import { profile } from '../../data/portfolio'
import { ThemeToggle } from './ThemeToggle'

const NAV = [
  { id: 'experience', label: 'Experience' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'projects', label: 'Projects' },
  { id: 'taghawk', label: 'TagHawk' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'ai', label: 'AI' },
  { id: 'contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition ${scrolled || open ? 'border-b border-line bg-bg/80 backdrop-blur-md' : ''}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent">
        Skip to content
      </a>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Primary">
        <a href="#top" className="font-display text-lg font-bold tracking-tight text-fg">
          {profile.firstName}
          <span className="text-accent">.</span>
          <span className="gradient-text">dev</span>
        </a>
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className="rounded-lg px-3 py-2 text-sm font-medium text-fg-2 transition hover:bg-surface-2 hover:text-fg">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href={profile.resumeUrl} download className="btn-primary hidden !px-4 !py-2 sm:inline-flex">
            Resume
          </a>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-fg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden>{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </nav>
      {open && (
        <ul id="mobile-nav" className="border-t border-line px-4 py-2 lg:hidden">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium text-fg hover:bg-surface-2">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
