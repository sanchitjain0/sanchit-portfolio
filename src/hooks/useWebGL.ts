let cached: boolean | null = null

/** Checks WebGL support once (no three.js import needed). `?nowebgl` forces the 2D fallback for testing. */
export function hasWebGL() {
  if (cached !== null) return cached
  try {
    if (new URLSearchParams(window.location.search).has('nowebgl')) return (cached = false)
    const canvas = document.createElement('canvas')
    cached = !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    cached = false
  }
  return cached
}
