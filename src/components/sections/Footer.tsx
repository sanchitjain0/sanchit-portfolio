import { useEffect, useState } from 'react'
import { profile } from '../../data/portfolio'
import { useUIStore } from '../../store/uiStore'
import { getHealth, type ApiSource } from '../../lib/api'

const YEAR = new Date().getFullYear()

export function Footer() {
  const openTerminal = useUIStore((s) => s.setTerminalOpen)
  const [api, setApi] = useState<{ source: ApiSource; ms: number } | null>(null)
  useEffect(() => {
    getHealth().then((r) => setApi({ source: r.source, ms: r.ms }))
  }, [])
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="text-sm text-muted">
          <p>© {YEAR} {profile.name} · Built with React, Three.js & TypeScript</p>
          {api && (
            <p className="mt-1 flex items-center gap-1.5 font-mono text-xs" title="GET /health">
              <span className={`h-2 w-2 rounded-full ${api.source === 'api' ? 'bg-emerald-500' : 'bg-amber-400'}`} aria-hidden />
              API {api.source === 'api' ? `online · ${api.ms}ms` : 'mock mode (backend not connected)'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a href={profile.social.linkedin} target="_blank" rel="noreferrer" className="text-fg-2 hover:text-accent">
            LinkedIn
          </a>
          <a href={profile.social.github} target="_blank" rel="noreferrer" className="text-fg-2 hover:text-accent">
            GitHub
          </a>
          <a href={`mailto:${profile.email}`} className="text-fg-2 hover:text-accent">
            Email
          </a>
          <button
            type="button"
            onClick={() => openTerminal(true)}
            className="rounded-md border border-line px-2 py-1 font-mono text-xs text-muted hover:border-accent hover:text-accent"
            aria-label="Open the terminal (shortcut: tilde key)"
          >
            ~ $
          </button>
        </div>
      </div>
    </footer>
  )
}
