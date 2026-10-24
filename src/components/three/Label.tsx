import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

interface LabelStyle {
  bg: string
  fg: string
  border?: string
  /** CSS font weight + family; size is fixed (scaled by `height`) */
  font?: string
  mono?: boolean
}

/** Draws a pill label to a canvas texture. Re-draws once web fonts are ready. */
export function useLabel(text: string, { bg, fg, border, mono }: LabelStyle) {
  const [fontsReady, setFontsReady] = useState(false)
  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true))
  }, [])
  const res = useMemo(() => {
    const k = 3
    const family = mono ? '"JetBrains Mono", ui-monospace, monospace' : '"Inter", system-ui, sans-serif'
    const font = `600 ${12 * k}px ${family}`
    const c = document.createElement('canvas')
    const g = c.getContext('2d')!
    g.font = font
    const w = Math.ceil(g.measureText(text).width) + 18 * k
    const h = 24 * k
    c.width = w
    c.height = h
    g.fillStyle = bg
    g.beginPath()
    g.roundRect(k, k, w - 2 * k, h - 2 * k, 7 * k)
    g.fill()
    if (border) {
      g.strokeStyle = border
      g.lineWidth = 1.5 * k
      g.stroke()
    }
    g.font = font
    g.fillStyle = fg
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(text, w / 2, h / 2 + k)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return { tex, aspect: w / h }
  }, [text, bg, fg, border, mono, fontsReady]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => res.tex.dispose(), [res])
  return res
}

/** Screen-space label sprite (same pixel size at any depth). */
export function Label({ text, position, height = 0.045, style, opacity = 1 }: { text: string; position: THREE.Vector3Tuple; height?: number; style: LabelStyle; opacity?: number }) {
  const { tex, aspect } = useLabel(text, style)
  return (
    <sprite position={position} scale={[height * aspect, height, 1]} renderOrder={10}>
      <spriteMaterial map={tex} transparent opacity={opacity} depthTest={false} sizeAttenuation={false} toneMapped={false} />
    </sprite>
  )
}
