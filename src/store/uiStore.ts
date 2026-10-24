import { create } from 'zustand'

export type Theme = 'dark' | 'light'
const THEME_KEY = 'sanchit.theme'

function initialTheme(): Theme {
  // index.html sets data-theme before first paint; read it back so React agrees
  const attr = document.documentElement.dataset.theme
  return attr === 'light' ? 'light' : 'dark'
}

interface UIStore {
  theme: Theme
  toggleTheme: () => void
  terminalOpen: boolean
  setTerminalOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  theme: initialTheme(),
  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1020' : '#f6f7fb')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* private mode */
    }
    set({ theme })
  },
  terminalOpen: false,
  setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
}))
