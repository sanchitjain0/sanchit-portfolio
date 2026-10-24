import { experience } from '../../data/portfolio'

export function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <p className="kicker">Experience</p>
      <h2 id="experience-title" className="section-title">
        Where I’ve shipped.
      </h2>
      <ol className="relative space-y-8 border-l border-line pl-6 sm:pl-10">
        {experience.map((job) => (
          <li key={job.company} className="reveal relative">
            <span aria-hidden className="absolute -left-[31px] top-7 h-3.5 w-3.5 rounded-full border-2 border-accent bg-bg sm:-left-[47px]" />
            <article className="card p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-semibold">
                  {job.role} <span className="text-accent">@ {job.company}</span>
                </h3>
                <p className="font-mono text-sm text-muted">
                  {job.period} · {job.location}
                </p>
              </div>
              <p className="mt-3 text-fg-2">{job.summary}</p>
              <ul className="mt-4 grid gap-2.5 text-fg-2 md:grid-cols-2 md:gap-x-8">
                {job.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
                {job.stack.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
