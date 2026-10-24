import { aiTools, experience, profile, projects, restaurantBrands, skills } from '../data/portfolio'

/** Tiny keyword router over portfolio data – the offline stand-in for the Claude-backed /ai/ask. */
export function localAnswer(question: string): string {
  const q = question.toLowerCase()
  const has = (...w: string[]) => w.some((x) => q.includes(x))
  const now = experience[0]

  if (has('taghawk', 'tag hawk', 'marketplace')) {
    const p = projects.find((x) => x.slug === 'taghawk')!
    return `${p.title}: ${p.tagline}. ${p.solution} Stack: ${p.stack.join(', ')}.`
  }
  if (has('ai', 'claude', 'gemini', 'codex', 'copilot', 'llm')) {
    return `He uses AI across his workflow: ${aiTools
      .slice(0, 5)
      .map((t) => t.name)
      .join(', ')} and more. For example: ${aiTools[0].use}`
  }
  if (has('stack', 'skill', 'tech', 'language')) {
    return skills
      .slice(0, 4)
      .map((g) => `${g.group}: ${g.items.slice(0, 5).join(', ')}`)
      .join('. ') + '.'
  }
  if (has('kfc', 'pizza', 'hardee', 'wimpy', 'krispy', 'restaurant', 'americana', 'now', 'current', 'work on')) {
    return `He's a ${now.role} at ${now.company} (${now.period}). ${now.summary} Brands include ${restaurantBrands.map((b) => b.name).join(', ')}.`
  }
  if (has('experience', 'year', 'career', 'appinventiv')) {
    return experience.map((j) => `${j.role} at ${j.company} (${j.period})`).join('; ') + '. 4.5+ years in total.'
  }
  if (has('hire', 'open', 'role', 'job', 'available', 'contact', 'email')) {
    return `${profile.availability}. The fastest way to reach him is ${profile.email}.`
  }
  if (has('project')) {
    return `Highlights: ${projects
      .filter((p) => p.featured)
      .map((p) => p.title)
      .join(', ')}. Scroll to Projects for the full case studies.`
  }
  return `${profile.name} is a ${profile.role} (${profile.subRole}). ${profile.heroSubtext} Try asking about his stack, TagHawk, AI tools or current role.`
}
