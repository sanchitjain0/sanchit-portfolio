import { engineeringNotes } from '../../data/portfolio'
import { Tilt } from '../ui/Tilt'

export function Notes() {
  return (
    <section id="notes" className="section" aria-labelledby="notes-title">
      <p className="kicker">Engineering notes</p>
      <h2 id="notes-title" className="section-title">
        Things I learned the hard way.
      </h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {engineeringNotes.map((n) => (
          <Tilt as="li" key={n.title} className="reveal card p-6 hover:border-accent">
            <p className="font-mono text-xs text-accent">{n.tag}</p>
            <h3 className="mt-2 text-lg font-semibold">{n.title}</h3>
            <p className="mt-2 text-fg-2">{n.summary}</p>
            <p className="mt-4 text-sm text-muted">Write-up coming soon</p>
          </Tilt>
        ))}
      </ul>
    </section>
  )
}
