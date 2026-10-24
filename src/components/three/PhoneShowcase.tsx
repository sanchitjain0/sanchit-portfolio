import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Float, RoundedBox } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Theme } from '../../store/uiStore'

export type FeatureId = 'feed' | 'chat' | 'checkout' | 'delivery'
export interface Listing {
  id: string
  title: string
  price: number
  currency: string
}

/* ── the app screen, drawn to a canvas ───────────────────────────────────── */

const W = 540
const H = 1140
const EMOJI: Record<string, string> = { desk: '🪑', fridge: '🧊', bike: '🚲', shelf: '📚' }
const emojiFor = (t: string) => EMOJI[Object.keys(EMOJI).find((k) => t.toLowerCase().includes(k)) ?? ''] ?? '📦'

function createScreen() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')!
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8

  const ACCENT = '#f97316'
  const font = (w: number, px: number) => `${w} ${px}px "Inter", system-ui, sans-serif`
  const pill = (x: number, y: number, w: number, h: number, r: number, fill: string) => {
    g.fillStyle = fill
    g.beginPath()
    g.roundRect(x, y, w, h, r)
    g.fill()
  }
  const text = (s: string, x: number, y: number, w: number, px: number, color: string, align: CanvasTextAlign = 'left') => {
    g.font = font(w, px)
    g.fillStyle = color
    g.textAlign = align
    g.fillText(s, x, y)
    g.textAlign = 'left'
  }

  const chrome = (title: string, t: number) => {
    g.fillStyle = '#f8fafc'
    g.fillRect(0, 0, W, H)
    text('9:41', 40, 52, 700, 24, '#0f172a')
    text('●●● 5G ▮', W - 40, 52, 600, 20, '#0f172a', 'right')
    text(title, 36, 128, 800, 40, '#0f172a')
    pill(W - 250, 96, 214, 44, 22, '#fff7ed')
    text('📍 Boston Univ. ▾', W - 143, 126, 600, 19, ACCENT, 'center')
    // tab bar
    pill(0, H - 120, W, 120, 0, '#ffffff')
    g.fillStyle = '#e2e8f0'
    g.fillRect(0, H - 120, W, 2)
    ;['🏠', '💬', '➕', '🧾', '👤'].forEach((ic, i) => {
      g.font = font(400, 36)
      g.textAlign = 'center'
      g.fillText(ic, 54 + i * 108, H - 60)
    })
    g.textAlign = 'left'
    void t
  }

  let listings: Listing[] = []
  const draw = (feature: FeatureId, t: number) => {
    if (feature === 'feed') {
      chrome('Marketplace', t)
      pill(36, 168, W - 72, 64, 18, '#e2e8f0')
      text('🔍  Search desks, bikes, fridges…', 62, 210, 500, 22, '#64748b')
      const items = listings.length ? listings : [{ id: '-', title: 'Loading…', price: 0, currency: 'USD' }]
      items.slice(0, 4).forEach((it, i) => {
        const x = 36 + (i % 2) * 240
        const y = 262 + Math.floor(i / 2) * 330
        pill(x, y, 228, 310, 22, '#ffffff')
        const grad = g.createLinearGradient(x, y, x + 228, y + 200)
        grad.addColorStop(0, ['#fde68a', '#bae6fd', '#c7d2fe', '#fbcfe8'][i % 4])
        grad.addColorStop(1, ['#fdba74', '#7dd3fc', '#a5b4fc', '#f9a8d4'][i % 4])
        g.fillStyle = grad
        g.beginPath()
        g.roundRect(x + 10, y + 10, 208, 190, 16)
        g.fill()
        g.font = font(400, 72)
        g.textAlign = 'center'
        g.fillText(emojiFor(it.title), x + 114, y + 130)
        g.textAlign = 'left'
        text(it.title, x + 18, y + 240, 700, 24, '#0f172a')
        text(it.price ? `$${it.price}` : '', x + 18, y + 280, 800, 26, ACCENT)
        if (i === 0) {
          pill(x + 134, y + 22, 74, 30, 15, '#16a34a')
          text('NEW', x + 171, y + 43, 800, 16, '#ffffff', 'center')
        }
      })
      text('GET /taghawk/listings · 4 items', 36, H - 150, 600, 18, '#94a3b8')
    } else if (feature === 'chat') {
      chrome('Anonymous chat', t)
      pill(36, 170, W - 72, 92, 20, '#ffffff')
      text('🪑  IKEA desk · $45', 60, 226, 700, 24, '#0f172a')
      const msgs: [boolean, string][] = [
        [false, 'Hi! Is the desk still available?'],
        [true, 'Yes! Pickup at Warren Towers?'],
        [false, 'Perfect, can I pay through escrow?'],
        [true, 'Sure, reserving it for you now 👍'],
      ]
      const shown = 1 + (Math.floor(t / 1.2) % (msgs.length + 1))
      msgs.slice(0, Math.min(shown, msgs.length)).forEach(([mine, m], i) => {
        const y = 300 + i * 118
        g.font = font(500, 23)
        const w = Math.min(380, g.measureText(m).width + 48)
        const x = mine ? W - 36 - w : 36
        pill(x, y, w, 80, 26, mine ? ACCENT : '#e2e8f0')
        text(m, x + 24, y + 49, 500, 23, mine ? '#ffffff' : '#0f172a')
        text(mine ? 'You' : 'Buyer #2841', mine ? W - 40 : 40, y - 10, 600, 16, '#94a3b8', mine ? 'right' : 'left')
      })
      if (shown > msgs.length || shown % 2 === 1) {
        const y = 300 + Math.min(shown, msgs.length) * 118
        pill(36, y, 110, 60, 26, '#e2e8f0')
        for (let d = 0; d < 3; d++) {
          g.fillStyle = `rgba(100,116,139,${0.4 + 0.6 * Math.abs(Math.sin(t * 5 + d))})`
          g.beginPath()
          g.arc(66 + d * 25, y + 30, 7, 0, Math.PI * 2)
          g.fill()
        }
      }
      pill(36, H - 210, W - 72, 66, 33, '#ffffff')
      text('Message…  (numbers stay hidden)', 64, H - 168, 500, 20, '#94a3b8')
    } else if (feature === 'checkout') {
      chrome('Checkout', t)
      pill(36, 170, W - 72, 150, 22, '#ffffff')
      text('🪑', 64, 268, 400, 60, '#000')
      text('IKEA desk', 150, 232, 700, 28, '#0f172a')
      text('Seller: Anonymous #1093', 150, 270, 500, 20, '#64748b')
      text('$45.00', W - 64, 232, 800, 28, ACCENT, 'right')
      const steps = ['Stock reserved', 'Paid into escrow', 'Item handed over', 'Payment released']
      const active = Math.floor(t / 1.4) % (steps.length + 1)
      steps.forEach((st, i) => {
        const y = 400 + i * 120
        const done = i < active
        g.fillStyle = done ? '#16a34a' : '#e2e8f0'
        g.beginPath()
        g.arc(76, y, 22, 0, Math.PI * 2)
        g.fill()
        text(done ? '✓' : String(i + 1), 76, y + 9, 800, 22, done ? '#ffffff' : '#64748b', 'center')
        if (i < steps.length - 1) {
          g.fillStyle = done ? '#16a34a' : '#e2e8f0'
          g.fillRect(73, y + 24, 6, 72)
        }
        text(st, 120, y + 9, done ? 700 : 500, 25, done ? '#0f172a' : '#64748b')
      })
      pill(36, H - 250, W - 72, 92, 24, '#0f172a')
      text('🔒  Pay $45 with escrow', W / 2, H - 193, 700, 26, '#ffffff', 'center')
    } else {
      chrome('Move it', t)
      // stylised map
      pill(36, 170, W - 72, 470, 26, '#e0f2fe')
      g.strokeStyle = '#bae6fd'
      g.lineWidth = 14
      for (let i = 0; i < 5; i++) {
        g.beginPath()
        g.moveTo(36, 230 + i * 90)
        g.lineTo(W - 36, 200 + i * 100)
        g.stroke()
      }
      g.strokeStyle = ACCENT
      g.lineWidth = 8
      g.setLineDash([18, 14])
      g.lineDashOffset = -t * 40
      g.beginPath()
      g.moveTo(110, 560)
      g.bezierCurveTo(180, 380, 360, 470, 430, 250)
      g.stroke()
      g.setLineDash([])
      text('📦', 90, 590, 400, 50, '#000')
      text('🏠', 410, 260, 400, 50, '#000')
      const u = (t * 0.15) % 1
      const bx = 110 + (430 - 110) * u
      const by = 560 + (250 - 560) * u - Math.sin(u * Math.PI) * 60
      text('🚚', bx - 25, by + 18, 400, 46, '#000')
      pill(36, 670, W - 72, 200, 24, '#ffffff')
      text('Local mover booked', 64, 726, 700, 28, '#0f172a')
      text('Mini fridge · Warren Towers → Allston', 64, 768, 500, 21, '#64748b')
      text(`ETA ${18 - Math.floor((t * 2) % 6)} min`, 64, 830, 800, 34, ACCENT)
    }
    texture.needsUpdate = true
  }

  return {
    texture,
    draw,
    setListings: (l: Listing[]) => {
      listings = l
    },
  }
}

/* ── the phone ───────────────────────────────────────────────────────────── */

function Phone({ feature, listings, theme, reducedMotion }: { feature: FeatureId; listings: Listing[]; theme: Theme; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const screen = useMemo(createScreen, [])
  const drag = useRef({ active: false, x: 0, y: 0, rotY: 0, rotX: 0, velY: 0 })
  const flip = useRef(0)
  const { gl } = useThree()

  useEffect(() => {
    screen.setListings(listings)
  }, [listings, screen])
  useEffect(() => {
    flip.current = reducedMotion ? 0 : 1 // spin when the feature changes
  }, [feature, reducedMotion])

  // drag to rotate (pointer events on the canvas element)
  useEffect(() => {
    const el = gl.domElement
    const d = drag.current
    const down = (e: PointerEvent) => {
      d.active = true
      d.x = e.clientX
      d.y = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (!d.active) return
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      d.x = e.clientX
      d.y = e.clientY
      d.rotY += dx * 0.01
      d.velY = dx * 0.01
      d.rotX = THREE.MathUtils.clamp(d.rotX + dy * 0.006, -0.5, 0.5)
    }
    const up = () => (d.active = false)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  const acc = useRef(0)
  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime
    acc.current += dt
    if (acc.current > 0.1) {
      acc.current = 0
      screen.draw(feature, reducedMotion ? 4 : t)
    }
    const d = drag.current
    if (!d.active) {
      // momentum, then ease back toward a slight pointer-follow tilt
      d.rotY += d.velY
      d.velY *= 0.92
      d.rotY += (pointer.x * 0.35 - d.rotY) * Math.min(1, dt * 1.5)
      d.rotX += (-pointer.y * 0.15 - d.rotX) * Math.min(1, dt * 2)
    }
    if (flip.current > 0) flip.current = Math.max(0, flip.current - dt * 1.6)
    const spin = flip.current > 0 ? (1 - flip.current) * Math.PI * 2 : 0
    group.current.rotation.set(d.rotX, -0.35 + d.rotY + spin, 0)
  })

  const body = theme === 'dark' ? '#1f2937' : '#111827'
  return (
    <group ref={group}>
      <RoundedBox args={[0.8, 1.66, 0.085]} radius={0.1} smoothness={6} castShadow>
        <meshPhysicalMaterial color={body} metalness={0.6} roughness={0.25} clearcoat={1} clearcoatRoughness={0.15} />
      </RoundedBox>
      {/* bezel + screen */}
      <RoundedBox args={[0.76, 1.62, 0.002]} radius={0.085} smoothness={6} position={[0, 0, 0.043]}>
        <meshBasicMaterial color="#020617" />
      </RoundedBox>
      <mesh position={[0, 0, 0.0445]}>
        <planeGeometry args={[0.72, 1.52]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>
      {/* dynamic island */}
      <RoundedBox args={[0.2, 0.05, 0.002]} radius={0.024} smoothness={4} position={[0, 0.73, 0.0455]}>
        <meshBasicMaterial color="#020617" />
      </RoundedBox>
      {/* camera bump on the back */}
      <RoundedBox args={[0.3, 0.3, 0.03]} radius={0.06} smoothness={4} position={[-0.2, 0.6, -0.055]}>
        <meshPhysicalMaterial color={body} metalness={0.7} roughness={0.2} clearcoat={1} />
      </RoundedBox>
      {[
        [-0.27, 0.67],
        [-0.13, 0.67],
        [-0.27, 0.53],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -0.072]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.012, 24]} />
          <meshPhysicalMaterial color="#0b0f1a" metalness={0.9} roughness={0.1} clearcoat={1} />
        </mesh>
      ))}
      {/* side buttons */}
      <mesh position={[0.405, 0.3, 0]}>
        <boxGeometry args={[0.012, 0.2, 0.03]} />
        <meshStandardMaterial color={body} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** neutral studio reflections without downloading an HDRI */
function StudioEnvironment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

export default function PhoneShowcase({
  feature,
  listings,
  theme,
  paused,
  reducedMotion,
}: {
  feature: FeatureId
  listings: Listing[]
  theme: Theme
  paused: boolean
  reducedMotion: boolean
}) {
  return (
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 3.3], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      shadows="percentage"
      style={{ touchAction: 'pan-y', cursor: 'grab' }}
      aria-hidden
    >
      <StudioEnvironment />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 3]} intensity={1.5} castShadow />
      <pointLight position={[-2, -1, 2]} color={theme === 'dark' ? '#22d3ee' : '#0e7490'} intensity={8} />
      <pointLight position={[2, 1, -1]} color={theme === 'dark' ? '#e879f9' : '#a21caf'} intensity={6} />
      <Float enabled={!reducedMotion} speed={1.6} rotationIntensity={0.15} floatIntensity={0.5}>
        <Phone feature={feature} listings={listings} theme={theme} reducedMotion={reducedMotion} />
      </Float>
      <ContactShadows position={[0, -1.05, 0]} scale={3} blur={2.6} opacity={theme === 'dark' ? 0.6 : 0.3} far={2} resolution={256} />
    </Canvas>
  )
}
