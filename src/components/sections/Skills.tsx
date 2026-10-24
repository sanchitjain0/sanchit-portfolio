import { lazy, Suspense, useState } from 'react'
import { skills } from '../../data/portfolio'

// logos (~50 KB) load in their own chunk
const SkillGlobe = lazy(() => import('../SkillGlobe').then((m) => ({ default: m.SkillGlobe })))

/** loose match between globe icon titles and skill names ("Node.js" ↔ "Node.js", "Amazon Web Services" ↔ "AWS") */
const ALIAS: Record<string, string[]> = {
  'Amazon Web Services': ['AWS'],
  'Apache Kafka': ['Kafka'],
  'Socket.io': ['WebSockets (Socket.IO)'],
  Express: ['Express.js'],
  HTML5: ['HTML5'],
  'GitHub Actions': ['GitHub Actions'],
  Bitbucket: ['Bitbucket Pipelines'],
  Redux: ['Redux / Context API'],
  JavaScript: ['JavaScript (ES6+)'],
}
const matches = (skill: string, hovered: string | null) =>
  !!hovered && (skill.toLowerCase() === hovered.toLowerCase() || (ALIAS[hovered] ?? []).includes(skill))

export function Skills() {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <p className="kicker">Skills</p>
      <h2 id="skills-title" className="section-title">
        The toolbox. <span className="gradient-text">Spin it.</span>
      </h2>
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-24">
          <Suspense fallback={<div className="mx-auto aspect-square w-full max-w-[460px]" />}>
            <SkillGlobe onHover={setHovered} />
          </Suspense>
          <p className="mt-2 text-center font-mono text-xs text-muted">drag to spin · hover a logo</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {skills.map((g) => (
            <div key={g.group} className="reveal card p-5">
              <h3 className="font-display text-base font-semibold text-fg">{g.group}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <li key={s} className={`chip transition ${matches(s, hovered) ? '!border-accent !text-accent shadow-[0_0_0_1px_var(--accent)]' : ''}`}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
