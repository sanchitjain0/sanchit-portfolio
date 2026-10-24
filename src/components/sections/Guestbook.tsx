import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, getGuestbook, postGuestbook, type GuestbookNote } from '../../lib/api'
import { useSiteStore } from '../../store/siteStore'
import { Tilt } from '../ui/Tilt'

const ago = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 86_400_000
  if (d < 1) return 'today'
  if (d < 2) return 'yesterday'
  if (d < 30) return `${Math.floor(d)} days ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

export function Guestbook() {
  const enabled = useSiteStore((s) => s.config.guestbookEnabled)
  const [notes, setNotes] = useState<GuestbookNote[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [trap, setTrap] = useState('')
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'done' | 'error'; text?: string }>({ kind: 'idle' })

  useEffect(() => {
    getGuestbook()
      .then((r) => setNotes(r.data.items))
      .catch(() => {})
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (trap) return
    setState({ kind: 'sending' })
    try {
      const r = await postGuestbook({ name: name.trim(), message: message.trim() })
      setState({ kind: 'done', text: r.data.message })
      setName('')
      setMessage('')
    } catch (err) {
      setState({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not send right now. Please try again later.' })
    }
  }

  return (
    <section id="guestbook" className="section" aria-labelledby="guestbook-title">
      <p className="kicker">Guestbook</p>
      <h2 id="guestbook-title" className="section-title">
        Leave a note. <span className="gradient-text">Say hi.</span>
      </h2>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        {enabled ? (
          <form onSubmit={submit} className="reveal card h-fit space-y-4 p-6" noValidate>
            <div aria-hidden className="hidden">
              <label>
                Leave empty <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg">Name</span>
              <input
                className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-fg outline-none placeholder:text-muted focus:border-accent"
                required
                minLength={2}
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg">Note</span>
              <textarea
                className="w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-fg outline-none placeholder:text-muted focus:border-accent"
                required
                minLength={3}
                maxLength={280}
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What did you think of the site?"
              />
              <span className="mt-1 block text-right font-mono text-[11px] text-muted">{message.length}/280</span>
            </label>
            <button className="btn-primary w-full disabled:opacity-60" disabled={state.kind === 'sending' || name.trim().length < 2 || message.trim().length < 3}>
              {state.kind === 'sending' ? 'Posting…' : 'Post note'}
            </button>
            <p role="status" aria-live="polite" className={`min-h-[1.25rem] text-sm ${state.kind === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
              {state.text}
            </p>
            <p className="text-xs text-muted">Notes are reviewed before they appear. No links, please.</p>
          </form>
        ) : (
          <p className="card h-fit p-6 text-fg-2">The guestbook is closed for new notes right now.</p>
        )}

        {notes.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {notes.map((n) => (
              <Tilt as="li" key={n.id} max={5} className="card p-5">
                <p className="text-fg">“{n.message}”</p>
                <p className="mt-3 text-sm text-muted">
                  — {n.name} · {ago(n.createdAt)}
                </p>
              </Tilt>
            ))}
          </ul>
        ) : (
          <div className="card grid place-items-center p-10 text-center text-fg-2">
            <p>
              No notes yet.
              <br />
              <span className="text-muted">Be the first to leave one!</span>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
