import { create } from 'zustand'
import { profile } from '../data/portfolio'
import { getPublicConfig, getReactions, toggleReaction, type PublicConfig } from '../lib/api'

/** used until the API answers (and forever while the backend isn't connected) */
const DEFAULT_CONFIG: PublicConfig = {
  available: true,
  availabilityText: profile.availability,
  currentlyWorkingOn: '',
  banner: null,
  guestbookEnabled: true,
}

interface SiteStore {
  config: PublicConfig
  reactions: Record<string, number>
  liked: string[]
  load: () => void
  react: (project: string) => Promise<void>
}

export const useSiteStore = create<SiteStore>((set, get) => ({
  config: DEFAULT_CONFIG,
  reactions: {},
  liked: [],
  load: () => {
    getPublicConfig(DEFAULT_CONFIG)
      .then((r) => set({ config: r.data }))
      .catch(() => {})
    getReactions()
      .then((r) => set({ reactions: r.data.counts, liked: r.data.mine }))
      .catch(() => {})
  },
  react: async (project) => {
    // optimistic toggle, then reconcile with the server's count
    const wasLiked = get().liked.includes(project)
    const prevCount = get().reactions[project] ?? 0
    set({
      liked: wasLiked ? get().liked.filter((p) => p !== project) : [...get().liked, project],
      reactions: { ...get().reactions, [project]: Math.max(0, prevCount + (wasLiked ? -1 : 1)) },
    })
    try {
      const r = await toggleReaction(project)
      set({
        liked: r.data.liked ? [...new Set([...get().liked, project])] : get().liked.filter((p) => p !== project),
        reactions: { ...get().reactions, [project]: r.data.count },
      })
    } catch {
      set({ liked: wasLiked ? [...get().liked, project] : get().liked.filter((p) => p !== project), reactions: { ...get().reactions, [project]: prevCount } })
    }
  },
}))
