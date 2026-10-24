import { Component, type ReactNode } from 'react'

const RELOAD_KEY = 'sanchit.chunk-reload'

/**
 * Keeps a 3D scene failure (WebGL context lost, a chunk that failed to download after a
 * redeploy, a dev-server dependency refresh…) from taking the page down. A failed lazy chunk
 * triggers one automatic reload; anything else shows the fallback.
 */
export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error('[3D] scene failed, showing fallback:', error)
    const chunkError = /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(error.message)
    try {
      if (chunkError && !sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        location.reload()
      }
    } catch {
      /* storage blocked */
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
