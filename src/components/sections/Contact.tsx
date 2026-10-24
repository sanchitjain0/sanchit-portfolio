import { useState, type FormEvent } from 'react'
import { contact, profile } from '../../data/portfolio'

import { ApiError, sendContact, type ApiSource } from '../../lib/api'

type Fields = { name: string; email: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'That email doesn’t look right.'
  if (f.message.trim().length < 10) e.message = 'Tell me a little more (10+ characters).'
  return e
}

export function Contact() {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [result, setResult] = useState<{ source: ApiSource; id: string; ms: number } | null>(null)
  const [serverError, setServerError] = useState('')
  const [trap, setTrap] = useState('')
  const [copied, setCopied] = useState(false)
  const [slow, setSlow] = useState(false)

  const update = (k: keyof Fields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (trap) return
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`contact-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    setStatus('sending')
    // free hosting sleeps when idle – tell the visitor if the first request is slow
    const slowTimer = setTimeout(() => setSlow(true), 3500)
    setServerError('')
    try {
      const res = await sendContact(fields)
      setResult({ source: res.source, id: res.data.id, ms: res.ms })
      setStatus('sent')
      setFields({ name: '', email: '', message: '' })
    } catch (err) {
      console.error(err)
      setServerError(err instanceof ApiError ? err.message : '')
      setStatus('error')
    } finally {
      clearTimeout(slowTimer)
      setSlow(false)
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked */
    }
  }

  const input = (bad?: string) =>
    `w-full rounded-xl border bg-bg px-4 py-3 text-fg placeholder:text-muted outline-none transition focus:border-accent ${bad ? 'border-rose-500' : 'border-line'}`

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <p className="kicker">Contact</p>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="reveal">
          <h2 id="contact-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            {contact.heading}
          </h2>
          <p className="mt-4 text-lg text-fg-2">{contact.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`mailto:${contact.email}`} className="btn-primary">
              {contact.email}
            </a>
            <button type="button" onClick={copyEmail} className="btn-ghost" aria-live="polite">
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <ul className="mt-8 space-y-2 text-fg-2">
            <li>
              📞{' '}
              <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="hover:text-accent">
                {profile.phone}
              </a>
            </li>
            <li>📍 {profile.location}</li>
            <li>
              💼{' '}
              <a href={profile.social.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent">
                LinkedIn
              </a>{' '}
              ·{' '}
              <a href={profile.social.github} target="_blank" rel="noreferrer" className="hover:text-accent">
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <form className="reveal card space-y-4 p-6 sm:p-8" onSubmit={onSubmit} noValidate>
          <div aria-hidden className="hidden">
            <label>
              Leave empty <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </label>
          </div>
          {(['name', 'email'] as const).map((k) => (
            <div key={k}>
              <label htmlFor={`contact-${k}`} className="mb-1.5 block text-sm font-medium text-fg">
                {k === 'name' ? 'Name' : 'Email'}
              </label>
              <input
                id={`contact-${k}`}
                type={k === 'email' ? 'email' : 'text'}
                autoComplete={k}
                value={fields[k]}
                onChange={update(k)}
                aria-invalid={!!errors[k]}
                aria-describedby={errors[k] ? `contact-${k}-error` : undefined}
                className={input(errors[k])}
                placeholder={k === 'name' ? 'Your name' : 'you@company.com'}
              />
              {errors[k] && (
                <p id={`contact-${k}-error`} className="mt-1 text-sm text-rose-500">
                  {errors[k]}
                </p>
              )}
            </div>
          ))}
          <div>
            <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-fg">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              value={fields.message}
              onChange={update('message')}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              className={`${input(errors.message)} resize-y`}
              placeholder="What are you building?"
            />
            {errors.message && (
              <p id="contact-message-error" className="mt-1 text-sm text-rose-500">
                {errors.message}
              </p>
            )}
          </div>
          <button type="submit" className="btn-primary w-full disabled:opacity-60" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          {slow && <p className="text-xs text-muted">Waking up the server (free hosting naps when idle). This can take up to a minute…</p>}
          <p role="status" aria-live="polite" className="min-h-[1.25rem] text-sm">
            {status === 'sent' && result && (
              <span className="text-emerald-500">
                Thanks! I’ll get back to you soon.{' '}
                <span className="font-mono text-xs text-muted">
                  POST /contact → 201 · {result.id} · {result.ms}ms{result.source === 'mock' ? ' · mock' : ''}
                </span>
              </span>
            )}
            {status === 'error' && (
              <span className="text-rose-500">
                {serverError || 'Something went wrong.'}{' '}
                <a className="underline" href={`mailto:${contact.email}?subject=${encodeURIComponent('Portfolio message')}&body=${encodeURIComponent(fields.message)}`}>
                  Email me instead
                </a>
              </span>
            )}
          </p>
        </form>
      </div>
    </section>
  )
}
