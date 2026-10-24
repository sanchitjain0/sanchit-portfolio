import { useSiteStore } from '../../store/siteStore'

/** ❤ button with a live count – one like per visitor per project (enforced by the API) */
export function ReactionButton({ project, title }: { project: string; title: string }) {
  const count = useSiteStore((s) => s.reactions[project] ?? 0)
  const liked = useSiteStore((s) => s.liked.includes(project))
  const react = useSiteStore((s) => s.react)
  return (
    <button
      type="button"
      onClick={() => void react(project)}
      aria-pressed={liked}
      aria-label={`${liked ? 'Unlike' : 'Like'} ${title} (${count} likes)`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition active:scale-95 ${
        liked ? 'border-rose-400/60 bg-rose-500/10 text-rose-500' : 'border-line text-fg-2 hover:border-rose-400/60 hover:text-rose-500'
      }`}
    >
      <span aria-hidden className={liked ? 'animate-[pop_300ms_ease-out]' : ''}>
        {liked ? '♥' : '♡'}
      </span>
      <span className="tabular-nums">{count}</span>
    </button>
  )
}
