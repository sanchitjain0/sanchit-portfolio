import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { contact, experience, profile, projects, skills } from '../data/portfolio'
import { useUIStore } from '../store/uiStore'

type Line = { kind: 'in' | 'out' | 'err'; text: string }

const HELP = [
  'help                    show this list',
  'whoami                  who is this',
  'experience              where I have worked',
  'projects                selected work',
  'skills                  the toolbox',
  'contact                 how to reach me',
  'theme                   toggle light / dark',
  'sudo make coffee        ☕',
  'clear / exit',
]

function run(cmd: string): Line[] {
  const c = cmd.trim().replace(/\s+/g, ' ')
  const out = (text: string): Line => ({ kind: 'out', text })
  switch (c) {
    case '':
      return []
    case 'help':
      return HELP.map(out)
    case 'whoami':
      return [out(`${profile.name} — ${profile.role}`), out(profile.subRole), out(profile.availability)]
    case 'experience':
      return experience.map((j) => out(`${j.period.padEnd(22)} ${j.role} @ ${j.company}`))
    case 'projects':
      return projects.map((p) => out(`${p.featured ? '★' : ' '} ${p.title} — ${p.tagline}`))
    case 'skills':
      return skills.map((g) => out(`${g.group.padEnd(24)} ${g.items.join(', ')}`))
    case 'contact':
      return [out(`email     ${contact.email}`), out(`linkedin  ${profile.social.linkedin}`)]
    case 'theme':
      useUIStore.getState().toggleTheme()
      return [out(`theme → ${useUIStore.getState().theme}`)]
    case 'sudo make coffee':
      return [out('[sudo] password for recruiter: ********'), out('Brewing… ████████████ 100%'), out('☕ Coffee ready. Shall we talk about that senior role?')]
    case 'kubectl get pods':
      return [out('NAME              READY   STATUS    RESTARTS'), out('orders-7d9f8      1/1     Running   0'), out('payments-5c4b2    1/1     Running   0')]
    default:
      return [{ kind: 'err', text: `command not found: ${c.split(' ')[0]} — try "help"` }]
  }
}

export function Terminal() {
  const open = useUIStore((s) => s.terminalOpen)
  const setOpen = useUIStore((s) => s.setTerminalOpen)
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: 'sanchit-os v2 — type "help" to begin.' }])
  const [value, setValue] = useState('')
  const history = useRef<string[]>([])
  const hIndex = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      const typing = t.closest('input, textarea, [contenteditable="true"]') && t !== inputRef.current
      if ((e.key === '~' || e.key === '`') && !typing) {
        e.preventDefault()
        setOpen(!useUIStore.getState().terminalOpen)
      } else if (e.key === 'Escape' && useUIStore.getState().terminalOpen) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [lines])

  if (!open) return null

  const submit = () => {
    const cmd = value
    setValue('')
    hIndex.current = -1
    if (cmd.trim()) history.current.unshift(cmd)
    if (cmd.trim() === 'clear') return setLines([])
    if (cmd.trim() === 'exit') return setOpen(false)
    setLines((l) => [...l, { kind: 'in', text: cmd }, ...run(cmd)])
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const h = history.current
      hIndex.current = Math.max(-1, Math.min(h.length - 1, hIndex.current + (e.key === 'ArrowUp' ? 1 : -1)))
      setValue(hIndex.current >= 0 ? h[hIndex.current] : '')
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Terminal">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-line bg-[#070a15] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="font-mono text-xs text-slate-400">visitor@sanchit:~</span>
          <button type="button" onClick={() => setOpen(false)} className="font-mono text-xs text-slate-400 hover:text-rose-400" aria-label="Close terminal">
            ✕
          </button>
        </div>
        <div ref={scroller} className="h-64 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed" onClick={() => inputRef.current?.focus()}>
          {lines.map((l, i) => (
            <p key={i} className={`whitespace-pre-wrap ${l.kind === 'in' ? 'text-cyan-300' : l.kind === 'err' ? 'text-rose-400' : 'text-slate-300'}`}>
              {l.kind === 'in' ? `$ ${l.text}` : l.text}
            </p>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-fuchsia-400">$</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal command"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
