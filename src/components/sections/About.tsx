import { about, education, profile } from '../../data/portfolio'

export function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <p className="kicker">About</p>
      <h2 id="about-title" className="section-title">
        Backend at heart, <span className="gradient-text">full-stack by habit.</span>
      </h2>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="reveal space-y-5 text-lg leading-relaxed text-fg-2">
          {about.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <aside className="reveal card h-fit space-y-5 p-6">
          <div>
            <p className="text-sm text-muted">Currently</p>
            <p className="font-display text-lg font-semibold text-fg">Senior Backend Developer · Americana Restaurants</p>
          </div>
          <div>
            <p className="text-sm text-muted">Based in</p>
            <p className="font-medium text-fg">{profile.location}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Education</p>
            <p className="font-medium text-fg">{education.degree}</p>
            <p className="text-sm text-fg-2">
              {education.school} · {education.year}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Looking for</p>
            <p className="font-medium text-fg">{profile.availability}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
