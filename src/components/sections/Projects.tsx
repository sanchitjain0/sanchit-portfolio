import { projects, type Project } from '../../data/portfolio'
import { Tilt } from '../ui/Tilt'

function Links({ p }: { p: Project }) {
  const entries = Object.entries(p.links).filter(([, v]) => v) as [string, string][]
  if (!entries.length) return <p className="mt-5 text-xs text-muted">Client work – happy to walk through the design in an interview.</p>
  return (
    <div className="mt-5 flex gap-4 text-sm font-medium">
      {entries.map(([k, href]) => (
        <a key={k} href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
          {k === 'repo' ? 'Code' : k === 'live' ? 'Live' : 'Case study'} ↗
        </a>
      ))}
    </div>
  )
}

function Featured({ p, index }: { p: Project; index: number }) {
  return (
    <Tilt as="article" max={3} className="reveal card grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <p className="font-mono text-xs text-muted">
          0{index + 1} · {p.category}
        </p>
        <h3 className="mt-2 text-2xl font-semibold">{p.title}</h3>
        <p className="mt-2 text-fg-2">{p.tagline}</p>
        <ul className="mt-5 space-y-2">
          {p.impact.map((i) => (
            <li key={i} className="flex items-center gap-2 font-medium text-fg">
              <span aria-hidden className="text-accent">▲</span>
              {i}
            </li>
          ))}
        </ul>
        <Links p={p} />
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-accent-2">Problem</h4>
          <p className="mt-1.5 text-fg-2">{p.problem}</p>
        </div>
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-accent">What I did</h4>
          <p className="mt-1.5 text-fg-2">{p.solution}</p>
        </div>
        <ul className="flex flex-wrap gap-2 pt-1" aria-label="Tech stack">
          {p.stack.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Tilt>
  )
}

export function Projects() {
  const featured = projects.filter((p) => p.featured && p.slug !== 'taghawk')
  const more = projects.filter((p) => !p.featured)
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <p className="kicker">Selected work</p>
      <h2 id="projects-title" className="section-title">
        Problems I’ve solved, <span className="gradient-text">and how.</span>
      </h2>
      <div className="space-y-6">
        {featured.map((p, i) => (
          <Featured key={p.slug} p={p} index={i} />
        ))}
      </div>
      <h3 className="mt-16 mb-6 text-xl font-semibold">More projects</h3>
      <ul className="grid gap-5 md:grid-cols-3">
        {more.map((p) => (
          <Tilt as="li" key={p.slug} className="reveal card flex flex-col p-6">
            <p className="font-mono text-xs text-muted">{p.category}</p>
            <h4 className="mt-2 font-display text-lg font-semibold text-fg">{p.title}</h4>
            <p className="mt-1 text-sm text-fg-2">{p.tagline}</p>
            <p className="mt-3 text-sm text-fg-2">{p.solution}</p>
            <p className="mt-3 text-sm font-medium text-fg">▲ {p.impact[0]}</p>
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-4" aria-label="Tech stack">
              {p.stack.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          </Tilt>
        ))}
      </ul>
    </section>
  )
}
