import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, RoundedBox, useGLTF } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { Theme } from '../../store/uiStore'
import { createCodeScreen, createDashboardScreen, createPosterTexture, createSkyTexture } from './screenTextures'

/* ── palettes ─────────────────────────────────────────────────────────────── */

const PALETTE = {
  dark: {
    floor: '#2a3366', wall: '#222a52', trim: '#323c70', desk: '#3b3253', deskTop: '#4a4068', metal: '#59627f',
    frame: '#0f1324', chair: '#2c2f52', chairSeat: '#e879f9', rack: '#11152b', rackPanel: '#1b2140', rug: '#3a2d6b',
    pot: '#3b3253', leaf: '#34d399', books: ['#22d3ee', '#e879f9', '#818cf8', '#fbbf24', '#f472b6', '#38bdf8'],
    accent: '#22d3ee', accent2: '#e879f9', keyGlow: '#e879f9', sofa: '#a855f7',
  },
  light: {
    floor: '#e7d8c4', wall: '#f4efe8', trim: '#e3d6c5', desk: '#b98b5e', deskTop: '#cfa274', metal: '#8d97ab',
    frame: '#1f2937', chair: '#334155', chairSeat: '#0e7490', rack: '#2b3245', rackPanel: '#3a4258', rug: '#cde6ec',
    pot: '#d6c2a8', leaf: '#3f9d6a', books: ['#0e7490', '#a21caf', '#4f46e5', '#d97706', '#db2777', '#0284c7'],
    accent: '#0e7490', accent2: '#a21caf', keyGlow: '#0e7490', sofa: '#5b7fa6',
  },
}
type Palette = (typeof PALETTE)['dark']

/** hotspots that scroll to a section */
export type HotspotId = 'projects' | 'experience' | 'architecture' | 'notes' | 'about' | 'contact' | 'taghawk'
/** hotspots that do something in the room */
export type RoomAction = 'theme' | 'ship' | 'chair'
type SpotId = HotspotId | RoomAction
const NAV_IDS = new Set<string>(['projects', 'experience', 'architecture', 'notes', 'about', 'contact', 'taghawk'])

/** camera close-ups when an object is clicked: [camera position, look target] */
const FOCUS: Record<HotspotId, [THREE.Vector3Tuple, THREE.Vector3Tuple]> = {
  projects: [[0.05, 1.45, -0.15], [-0.2, 1.33, -1.72]],
  experience: [[1.45, 1.45, -0.55], [0.65, 1.25, -1.6]],
  architecture: [[0.7, 1.5, 1.0], [-1.35, 1.0, 0.1]],
  notes: [[-0.45, 1.95, -0.1], [-1.15, 1.8, -1.88]],
  about: [[-0.2, 1.75, -0.55], [-1.94, 1.75, -0.95]],
  contact: [[1.35, 1.25, -0.35], [0.72, 0.86, -1.22]],
  taghawk: [[0.4, 1.1, 2.1], [-0.75, 0.5, 1.3]],
}

const TARGET = new THREE.Vector3(-0.15, 0.85, 0.1)
const VIEW_DIR = new THREE.Vector3(1, 0.74, 1.05).normalize()

/* ── small building blocks ────────────────────────────────────────────────── */

function Mat({ color, rough = 0.75, metal = 0.05 }: { color: string; rough?: number; metal?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
}

function Box({ size, position, color, rotation, radius = 0.015, rough, metal, shadow = true }: {
  size: THREE.Vector3Tuple
  position: THREE.Vector3Tuple
  color: string
  rotation?: THREE.Vector3Tuple
  radius?: number
  rough?: number
  metal?: number
  shadow?: boolean
}) {
  return (
    <RoundedBox args={size} radius={radius} smoothness={2} position={position} rotation={rotation} castShadow={shadow} receiveShadow>
      <Mat color={color} rough={rough} metal={metal} />
    </RoundedBox>
  )
}

/** pulsing ring that marks something as clickable */
function PulseDot({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock, camera }) => {
    const t = (clock.elapsedTime * 0.8) % 1
    ref.current.scale.setScalar(0.6 + t * 0.9)
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t)
    ref.current.quaternion.copy(camera.quaternion)
  })
  return (
    <mesh ref={ref}>
      <ringGeometry args={[0.045, 0.06, 32]} />
      <meshBasicMaterial color={color} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

interface HotspotProps {
  id: SpotId
  label: string
  /** invisible hit box: size + centre (world) */
  hit: [THREE.Vector3Tuple, THREE.Vector3Tuple]
  labelAt: THREE.Vector3Tuple
  hovered: SpotId | null
  setHovered: (id: SpotId | null) => void
  onSelect: (id: SpotId) => void
  color: string
  ink: string
  showHints: boolean
  children: ReactNode
}

const _glow = new THREE.Color()

/** pill label drawn to a canvas (no DOM overlay → no extra React roots, crisp at any dpr) */
function useLabelTexture(text: string, bg: string, fg: string) {
  const [fontsReady, setFontsReady] = useState(false)
  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true))
  }, [])
  const res = useMemo(() => {
    const k = 3
    const c = document.createElement('canvas')
    const g = c.getContext('2d')!
    const font = `600 ${12 * k}px "Inter", system-ui, sans-serif`
    g.font = font
    const w = Math.ceil(g.measureText(text).width) + 26 * k
    const h = 28 * k
    c.width = w
    c.height = h
    g.fillStyle = bg
    g.beginPath()
    g.roundRect(0, 0, w, h, h / 2)
    g.fill()
    g.font = font
    g.fillStyle = fg
    g.textBaseline = 'middle'
    g.textAlign = 'center'
    g.fillText(`${text}  →`, w / 2, h / 2 + k)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return { tex, aspect: w / h }
  }, [text, bg, fg, fontsReady]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => res.tex.dispose(), [res])
  return res
}

function HoverLabel({ text, show, color, ink }: { text: string; show: boolean; color: string; ink: string }) {
  const { tex, aspect } = useLabelTexture(text, color, ink)
  const sprite = useRef<THREE.Sprite>(null!)
  useFrame((_, dt) => {
    const m = sprite.current.material
    m.opacity += ((show ? 1 : 0) - m.opacity) * Math.min(1, dt * 12)
    sprite.current.visible = m.opacity > 0.02
    const h = 0.042 * (0.9 + m.opacity * 0.1)
    sprite.current.scale.set(h * aspect, h, 1)
    sprite.current.position.y = 0.06 * m.opacity
  })
  return (
    <sprite ref={sprite} renderOrder={20}>
      <spriteMaterial map={tex} transparent opacity={0} depthTest={false} sizeAttenuation={false} toneMapped={false} />
    </sprite>
  )
}

function Hotspot({ id, label, hit, labelAt, hovered, setHovered, onSelect, color, ink, showHints, children }: HotspotProps) {
  const group = useRef<THREE.Group>(null!)
  const isHover = hovered === id
  useFrame((_, dt) => {
    const target = isHover ? 0.035 : 0
    group.current.position.y += (target - group.current.position.y) * Math.min(1, dt * 10)
  })
  // hover glow: tint every standard material in the group
  useEffect(() => {
    _glow.set(color)
    group.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (!m || !('emissive' in m)) return
      if (o.userData.baseEmissive === undefined) o.userData.baseEmissive = [m.emissive.getHex(), m.emissiveIntensity]
      const [hex, intensity] = o.userData.baseEmissive as [number, number]
      if (isHover) {
        m.emissive.copy(_glow)
        m.emissiveIntensity = 0.35
      } else {
        m.emissive.setHex(hex)
        m.emissiveIntensity = intensity
      }
    })
  }, [isHover, color])
  return (
    <group>
      <group ref={group}>{children}</group>
      <mesh
        position={hit[1]}
        visible={false}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(null)
          document.body.style.cursor = ''
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onSelect(id)
        }}
      >
        <boxGeometry args={hit[0]} />
        <meshBasicMaterial />
      </mesh>
      <group position={labelAt}>
        {showHints && !isHover && <PulseDot color={color} />}
        <HoverLabel text={label} show={isHover} color={color} ink={ink} />
      </group>
    </group>
  )
}

/* ── downloaded props (Kenney Furniture Kit, CC0) ─────────────────────────── */

const PROPS_URL = '/models/props.glb'

/** Places one model from props.glb: centred on x/z, sitting on `position.y`, with lit materials. */
function Prop({ name, position, rotation = 0, scale = 1.6, tint, dim = 1 }: { name: string; position: THREE.Vector3Tuple; rotation?: number; scale?: number; tint?: string; dim?: number }) {
  const gltf = useGLTF(PROPS_URL)
  const object = useMemo(() => {
    const src = gltf.scenes.find((sc) => sc.name === name) ?? gltf.scene
    const obj = src.clone(true)
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const old = mesh.material as THREE.MeshBasicMaterial
      // Kenney ships unlit materials – swap for lit ones so they react to the theme lighting
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(tint && old.name === 'carpet' ? tint : old.color).multiplyScalar(dim),
        roughness: 0.7,
        metalness: old.name?.startsWith('metal') ? 0.4 : 0.05,
        // lamp shades glow at night
        emissive: old.name === 'lamp' && dim < 1 ? new THREE.Color('#ffcf8a') : new THREE.Color(0),
        emissiveIntensity: old.name === 'lamp' && dim < 1 ? 1.6 : 0,
      })
      mesh.castShadow = true
      mesh.receiveShadow = true
    })
    const box = new THREE.Box3().setFromObject(obj)
    const c = box.getCenter(new THREE.Vector3())
    obj.position.set(-c.x, -box.min.y, -c.z)
    return obj
  }, [gltf, name, tint, dim])
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <primitive object={object} />
    </group>
  )
}
useGLTF.preload(PROPS_URL)

/* ── the room ─────────────────────────────────────────────────────────────── */

function Room({ theme, onSelect, lite, reducedMotion, hints }: { theme: Theme; onSelect: (id: SpotId) => void; lite: boolean; reducedMotion: boolean; hints: boolean }) {
  const p: Palette = PALETTE[theme]
  const night = theme === 'dark'
  const [hovered, setHovered] = useState<SpotId | null>(null)
  const [fontsReady, setFontsReady] = useState(false)
  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true))
  }, [])

  const code = useMemo(createCodeScreen, [])
  const dash = useMemo(createDashboardScreen, [])
  const sky = useMemo(() => createSkyTexture(night), [night])
  const poster = useMemo(() => createPosterTexture(p.accent, p.accent2), [p.accent, p.accent2, fontsReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // server rack LEDs
  const leds = useRef<THREE.InstancedMesh>(null!)
  const LED_ROWS = 9
  const LED_COLS = 5
  const ledColor = useMemo(() => new THREE.Color(), [])
  const steam = useRef<THREE.Group>(null!)
  const lampLight = useRef<THREE.PointLight>(null!)
  const dimProps = night ? 0.62 : 1
  const chair = useRef<THREE.Group>(null!)
  const boxes = useRef<THREE.Group>(null!)
  const fx = useRef({ chairSpin: 0, shipAt: -10 })
  const select = (id: SpotId) => {
    if (id === 'chair') fx.current.chairSpin += Math.PI * 2
    if (id === 'ship') {
      fx.current.shipAt = performance.now() / 1000
      dash.bump()
    }
    onSelect(id)
  }
  const hs = { hovered, setHovered, onSelect: select, color: p.accent, ink: night ? '#06121c' : '#ffffff', showHints: hints && !hovered }

  useEffect(() => {
    const m = new THREE.Matrix4()
    let i = 0
    for (let r = 0; r < LED_ROWS; r++)
      for (let c = 0; c < LED_COLS; c++) {
        m.makeTranslation(0, 0.18 + r * 0.19, -0.2 + c * 0.04)
        leds.current.setMatrixAt(i++, m)
      }
    leds.current.instanceMatrix.needsUpdate = true
  }, [])

  const tick = useRef(0)
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    code.draw(t, !reducedMotion)
    dash.draw(t, !reducedMotion)
    tick.current += dt
    if (tick.current > 0.12) {
      tick.current = 0
      const palette = ['#22c55e', '#22d3ee', '#22c55e', '#fbbf24', '#22c55e']
      for (let i = 0; i < LED_ROWS * LED_COLS; i++) {
        const on = reducedMotion ? i % 3 !== 0 : Math.random() > 0.3
        ledColor.set(palette[i % palette.length]).multiplyScalar(on ? (night ? 2.2 : 1.3) : 0.15)
        leds.current.setColorAt(i, ledColor)
      }
      leds.current.instanceColor!.needsUpdate = true
    }
    steam.current.children.forEach((s, i) => {
      const u = (t * 0.35 + i / 3) % 1
      s.position.set(Math.sin(t * 2 + i) * 0.015, 0.08 + u * 0.22, 0)
      s.scale.setScalar(0.02 + u * 0.03)
      ;((s as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - u)
    })
    if (lampLight.current) lampLight.current.intensity = night ? 2.2 + Math.sin(t * 3) * 0.05 : 0
    // chair spin
    const c = chair.current
    c.rotation.y += (fx.current.chairSpin - c.rotation.y) * Math.min(1, dt * 4)
    // shipped box: hop + spin
    const u = performance.now() / 1000 - fx.current.shipAt
    const top = boxes.current.children[1]
    if (top) {
      const k = u < 0.9 ? Math.sin((u / 0.9) * Math.PI) : 0
      top.position.y = 0.45 + k * 0.45
      top.rotation.y = 0.35 + (u < 0.9 ? (u / 0.9) * Math.PI * 2 : 0)
    }
  })

  const keyboardKeys = useMemo(() => {
    const out: THREE.Vector3Tuple[] = []
    for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) out.push([-0.245 + c * 0.0377, 0.022, -0.06 + r * 0.04])
    return out
  }, [])

  return (
    <group>
      {/* shell */}
      <Box size={[4.2, 0.2, 4.2]} position={[0, -0.1, 0]} color={p.floor} radius={0.04} shadow={false} />
      <Box size={[4.2, 2.8, 0.14]} position={[0, 1.4, -2.03]} color={p.wall} radius={0.02} shadow={false} />
      <Box size={[0.14, 2.8, 4.2]} position={[-2.03, 1.4, 0]} color={p.wall} radius={0.02} shadow={false} />
      <Box size={[4.2, 0.08, 0.04]} position={[0, 0.04, -1.94]} color={p.trim} shadow={false} />
      <Box size={[0.04, 0.08, 4.2]} position={[-1.94, 0.04, 0]} color={p.trim} shadow={false} />
      <mesh position={[0.15, 0.006, -0.45]} receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.012, 64]} />
        <Mat color={p.rug} rough={1} />
      </mesh>

      {/* window */}
      <group position={[1.15, 1.7, -1.95]}>
        <Box size={[1.12, 0.92, 0.06]} position={[0, 0, 0]} color={p.frame} shadow={false} />
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.0, 0.8]} />
          <meshBasicMaterial map={sky} toneMapped={false} />
        </mesh>
        <Box size={[0.03, 0.8, 0.03]} position={[0, 0, 0.05]} color={p.frame} shadow={false} />
        <Box size={[1.0, 0.03, 0.03]} position={[0, 0, 0.05]} color={p.frame} shadow={false} />
      </group>

      {/* desk */}
      <Box size={[2.05, 0.07, 0.8]} position={[0, 0.76, -1.5]} color={p.deskTop} rough={0.55} />
      {[-0.95, 0.95].map((x) =>
        [-1.83, -1.17].map((z) => <Box key={`${x}${z}`} size={[0.05, 0.73, 0.05]} position={[x, 0.365, z]} color={p.metal} metal={0.6} rough={0.4} />),
      )}
      <Box size={[0.45, 0.55, 0.7]} position={[-0.68, 0.3, -1.5]} color={p.desk} />
      <Box size={[0.36, 0.015, 0.02]} position={[-0.68, 0.45, -1.14]} color={p.metal} />
      <Box size={[0.36, 0.015, 0.02]} position={[-0.68, 0.25, -1.14]} color={p.metal} />

      {/* main monitor – projects */}
      <Hotspot id="projects" label="Projects" hit={[[1.05, 0.75, 0.3], [-0.2, 1.3, -1.7]]} labelAt={[-0.2, 1.75, -1.7]} {...hs}>
        <group position={[-0.2, 0.795, -1.72]} rotation={[0, 0.08, 0]}>
          <Box size={[0.3, 0.02, 0.2]} position={[0, 0.01, 0]} color={p.metal} metal={0.5} />
          <Box size={[0.05, 0.3, 0.04]} position={[0, 0.16, -0.02]} color={p.metal} metal={0.5} />
          <Box size={[1.0, 0.6, 0.04]} position={[0, 0.56, 0]} color={p.frame} radius={0.02} />
          <mesh position={[0, 0.56, 0.0215]}>
            <planeGeometry args={[0.95, 0.556]} />
            <meshBasicMaterial map={code.texture} toneMapped={false} />
          </mesh>
        </group>
      </Hotspot>

      {/* second monitor – live dashboard / experience */}
      <Hotspot id="experience" label="Experience" hit={[[0.8, 0.6, 0.35], [0.65, 1.25, -1.6]]} labelAt={[0.68, 1.62, -1.6]} {...hs}>
        <group position={[0.68, 0.795, -1.6]} rotation={[0, -0.42, 0]}>
          <Box size={[0.22, 0.02, 0.16]} position={[0, 0.01, 0]} color={p.metal} metal={0.5} />
          <Box size={[0.04, 0.26, 0.04]} position={[0, 0.14, -0.02]} color={p.metal} metal={0.5} />
          <Box size={[0.72, 0.46, 0.035]} position={[0, 0.46, 0]} color={p.frame} radius={0.02} />
          <mesh position={[0, 0.46, 0.019]}>
            <planeGeometry args={[0.68, 0.425]} />
            <meshBasicMaterial map={dash.texture} toneMapped={false} />
          </mesh>
        </group>
      </Hotspot>

      {/* keyboard + mouse */}
      <group position={[-0.15, 0.795, -1.3]}>
        <Box size={[0.58, 0.025, 0.19]} position={[0, 0.0125, 0]} color={p.frame} />
        {keyboardKeys.map((k, i) => (
          <mesh key={i} position={k}>
            <boxGeometry args={[0.03, 0.012, 0.032]} />
            <meshStandardMaterial color={night ? '#2a3152' : '#e5e7eb'} emissive={night && i % 9 === 0 ? p.keyGlow : '#000000'} emissiveIntensity={0.8} />
          </mesh>
        ))}
        {night && (
          <mesh position={[0, 0.002, 0.1]}>
            <boxGeometry args={[0.58, 0.004, 0.006]} />
            <meshBasicMaterial color={[2.2, 0.8, 2.4]} toneMapped={false} />
          </mesh>
        )}
      </group>
      <Box size={[0.07, 0.03, 0.11]} position={[0.32, 0.81, -1.3]} color={p.frame} radius={0.014} />

      {/* coffee – contact */}
      <Hotspot id="contact" label="Say hi" hit={[[0.25, 0.3, 0.25], [0.78, 0.92, -1.22]]} labelAt={[0.78, 1.2, -1.22]} {...hs}>
        <group position={[0.78, 0.795, -1.22]}>
          <mesh position={[0, 0.055, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.11, 24]} />
            <Mat color={p.accent2} rough={0.4} />
          </mesh>
          <mesh position={[0.05, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.025, 0.008, 8, 16]} />
            <Mat color={p.accent2} rough={0.4} />
          </mesh>
          <mesh position={[0, 0.108, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.038, 20]} />
            <Mat color="#3b2414" rough={0.3} />
          </mesh>
          <group ref={steam}>
            {[0, 1, 2].map((i) => (
              <mesh key={i}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
              </mesh>
            ))}
          </group>
        </group>
      </Hotspot>

      {/* desk lamp */}
      <group position={[-0.86, 0.795, -1.72]}>
        <mesh position={[0, 0.015, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.03, 24]} />
          <Mat color={p.frame} />
        </mesh>
        <Box size={[0.02, 0.45, 0.02]} position={[0.02, 0.23, 0.03]} rotation={[0.25, 0, -0.1]} color={p.metal} metal={0.6} />
        <mesh position={[0.05, 0.45, 0.13]} rotation={[0.9, 0, 0]} castShadow>
          <coneGeometry args={[0.07, 0.12, 24, 1, true]} />
          <meshStandardMaterial color={p.accent} side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 0.42, 0.16]}>
          <sphereGeometry args={[0.025, 12, 10]} />
          <meshBasicMaterial color={night ? [3, 2.4, 1.4] : '#fef3c7'} toneMapped={false} />
        </mesh>
        <pointLight ref={lampLight} position={[0.05, 0.38, 0.2]} color="#ffcf8a" distance={2.4} decay={1.4} />
      </group>

      {/* chair – spins */}
      <Hotspot id="chair" label="Spin the chair" hit={[[0.6, 1.2, 0.6], [0.05, 0.6, -0.72]]} labelAt={[0.05, 1.35, -0.6]} {...hs}>
      <group ref={chair} position={[0.05, 0, -0.72]}>
        <Box size={[0.5, 0.08, 0.48]} position={[0, 0.5, 0]} color={p.chair} radius={0.03} />
        <Box size={[0.48, 0.03, 0.42]} position={[0, 0.545, 0]} color={p.chairSeat} radius={0.012} />
        <Box size={[0.5, 0.62, 0.07]} position={[0, 0.88, 0.24]} rotation={[-0.12, 0, 0]} color={p.chair} radius={0.03} />
        <mesh position={[0, 0.27, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.42, 12]} />
          <Mat color={p.metal} metal={0.7} rough={0.3} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <Box key={i} size={[0.3, 0.025, 0.04]} position={[Math.cos((i / 5) * Math.PI * 2) * 0.15, 0.05, Math.sin((i / 5) * Math.PI * 2) * 0.15]} rotation={[0, -(i / 5) * Math.PI * 2, 0]} color={p.metal} metal={0.7} />
        ))}
      </group>
      </Hotspot>

      {/* server rack – architecture */}
      <Hotspot id="architecture" label="Architecture" hit={[[0.8, 2.0, 0.9], [-1.6, 1.0, 0.15]]} labelAt={[-1.55, 2.15, 0.15]} {...hs}>
        <group position={[-1.6, 0, 0.15]}>
          <Box size={[0.62, 1.95, 0.78]} position={[0, 0.975, 0]} color={p.rack} radius={0.03} metal={0.4} rough={0.5} />
          {Array.from({ length: LED_ROWS }, (_, r) => (
            <Box key={r} size={[0.02, 0.15, 0.66]} position={[0.31, 0.2 + r * 0.19, 0]} color={p.rackPanel} radius={0.005} metal={0.5} rough={0.4} shadow={false} />
          ))}
          <instancedMesh ref={leds} args={[undefined, undefined, LED_ROWS * LED_COLS]} position={[0.325, 0, 0.08]}>
            <boxGeometry args={[0.008, 0.018, 0.018]} />
            <meshBasicMaterial toneMapped={false} />
          </instancedMesh>
          <mesh position={[0.326, 1.82, -0.18]}>
            <planeGeometry args={[0.18, 0.05]} />
            <meshBasicMaterial color={p.accent} toneMapped={false} />
          </mesh>
        </group>
      </Hotspot>

      {/* cable from rack to desk */}
      <mesh>
        <tubeGeometry
          args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-1.3, 0.05, -0.15),
              new THREE.Vector3(-1.0, 0.012, -0.6),
              new THREE.Vector3(-0.6, 0.012, -1.1),
              new THREE.Vector3(-0.45, 0.3, -1.75),
              new THREE.Vector3(-0.3, 0.79, -1.8),
            ]),
            48,
            0.012,
            6,
            false,
          ]}
        />
        <Mat color={p.accent2} rough={0.5} />
      </mesh>

      {/* bookshelf – engineering notes */}
      <Hotspot id="notes" label="Engineering notes" hit={[[1.1, 0.75, 0.35], [-1.15, 1.85, -1.85]]} labelAt={[-1.15, 2.35, -1.85]} {...hs}>
        <group position={[-1.15, 0, -1.86]}>
          {[1.55, 2.05].map((y, s) => (
            <group key={y}>
              <Box size={[1.05, 0.035, 0.24]} position={[0, y, 0]} color={p.desk} />
              {Array.from({ length: 7 }, (_, i) => {
                const h = 0.24 + ((i * 7 + s * 3) % 5) * 0.03
                const lean = s === 1 && i === 6 ? -0.35 : 0
                return (
                  <Box
                    key={i}
                    size={[0.07, h, 0.18]}
                    position={[-0.42 + i * 0.1 + (lean ? 0.04 : 0), y + 0.0175 + h / 2 - (lean ? 0.01 : 0), 0]}
                    rotation={[0, 0, lean]}
                    color={p.books[(i + s * 2) % p.books.length]}
                    radius={0.008}
                  />
                )
              })}
            </group>
          ))}
        </group>
      </Hotspot>

      {/* poster – about */}
      <Hotspot id="about" label="About me" hit={[[0.2, 0.85, 0.7], [-1.9, 1.75, -0.9]]} labelAt={[-1.9, 2.25, -0.9]} {...hs}>
        <group position={[-1.95, 1.75, -0.9]} rotation={[0, Math.PI / 2, 0]}>
          <Box size={[0.62, 0.8, 0.03]} position={[0, 0, 0]} color={p.frame} shadow={false} />
          <mesh position={[0, 0, 0.017]}>
            <planeGeometry args={[0.56, 0.74]} />
            <meshBasicMaterial map={poster} toneMapped={false} />
          </mesh>
        </group>
      </Hotspot>

      {/* plant */}
      <group position={[1.6, 0, -1.55]}>
        <mesh position={[0, 0.17, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.13, 0.34, 24]} />
          <Mat color={p.pot} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.1, 0.5 + (i % 3) * 0.08, Math.sin(a) * 0.1]} rotation={[Math.sin(a) * 0.6, a, Math.cos(a) * 0.6]} scale={[0.07, 0.22, 0.03]} castShadow>
              <sphereGeometry args={[1, 10, 8]} />
              <Mat color={p.leaf} rough={0.6} />
            </mesh>
          )
        })}
      </group>

      {/* lounge corner: sofa + coffee table + the TagHawk laptop */}
      <Prop dim={dimProps} name="loungeSofa" position={[-1.6, 0, 1.38]} rotation={Math.PI / 2} scale={1.5} tint={p.sofa} />
      <Prop dim={dimProps} name="pillowBlue" position={[-1.68, 0.36, 1.0]} rotation={Math.PI / 2 + 0.3} scale={1.3} />
      <Prop dim={dimProps} name="tableCoffee" position={[-0.72, 0, 1.35]} rotation={Math.PI / 2} scale={1.5} />
      <Hotspot id="taghawk" label="TagHawk" hit={[[0.6, 0.5, 0.6], [-0.72, 0.5, 1.35]]} labelAt={[-0.72, 0.95, 1.35]} {...hs}>
        <Prop dim={dimProps} name="laptop" position={[-0.72, 0.345, 1.35]} rotation={Math.PI / 4} scale={1.7} />
      </Hotspot>

      {/* shipping boxes – "ship an order" */}
      <Hotspot id="ship" label="Ship an order" hit={[[0.6, 1.0, 0.9], [1.55, 0.45, 0.85]]} labelAt={[1.55, 1.15, 0.8]} {...hs}>
        <group ref={boxes}>
          <Prop dim={dimProps} name="cardboardBoxClosed" position={[1.55, 0, 0.6]} rotation={0.1} />
          <Prop dim={dimProps} name="cardboardBoxClosed" position={[1.55, 0.45, 0.62]} rotation={0.35} scale={1.4} />
          <Prop dim={dimProps} name="cardboardBoxOpen" position={[1.58, 0, 1.1]} rotation={-0.4} />
        </group>
      </Hotspot>

      {/* floor lamp – toggles day / night */}
      <Hotspot id="theme" label={night ? 'Lights on ☀' : 'Lights off ☾'} hit={[[0.45, 1.6, 0.45], [1.7, 0.8, 1.75]]} labelAt={[1.7, 1.75, 1.75]} {...hs}>
        <Prop dim={dimProps} name="lampRoundFloor" position={[1.7, 0, 1.75]} scale={1.8} />
        {night && <pointLight position={[1.7, 1.4, 1.75]} color="#ffcf8a" intensity={2.5} distance={3} decay={1.4} />}
      </Hotspot>
      <Prop dim={dimProps} name="speaker" position={[1.2, 0, -1.78]} scale={1.4} />

      {/* lights */}
      {night ? (
        <>
          <ambientLight intensity={1.1} color="#aab4ff" />
          <hemisphereLight args={['#7c8cf0', '#2a1850', 1.1]} />
          <directionalLight position={[4, 6, 3]} intensity={0.9} color="#a5b4fc" castShadow={!lite} shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
          <pointLight position={[0, 1.35, -1.1]} color={p.accent} intensity={3} distance={3} decay={1.3} />
          <pointLight position={[-1.0, 1.1, 0.5]} color={p.accent2} intensity={2.4} distance={2.6} decay={1.3} />
        </>
      ) : (
        <>
          <ambientLight intensity={1.0} />
          <hemisphereLight args={['#ffffff', '#e7d8c4', 0.9]} />
          <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff4e0" castShadow={!lite} shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-bias={-0.0005} />
        </>
      )}
    </group>
  )
}

/* ── camera: drag to orbit (limited), fit to any aspect, fly-to on click ─── */

const BASE_AZ = Math.atan2(VIEW_DIR.x, VIEW_DIR.z)
const AZ_RANGE: [number, number] = [0.12, 1.45] // stay in front of the two walls
const _sph = new THREE.Spherical()

interface RigProps {
  focus: HotspotId | null
  reducedMotion: boolean
  interactive: boolean
  nudge: { id: number; dir: number }
}

function CameraRig({ focus, reducedMotion, interactive, nudge }: RigProps) {
  const controls = useRef<OrbitControlsImpl>(null!)
  const { size, camera, gl } = useThree()
  const lastInteract = useRef(performance.now())
  const returning = useRef(false)
  const az = useRef(BASE_AZ)
  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const tmpTarget = useMemo(() => new THREE.Vector3(), [])

  // OrbitControls forces touch-action:none; keep vertical page scrolling on touch screens
  useEffect(() => {
    gl.domElement.style.touchAction = 'pan-y'
  })

  // rotate buttons
  useEffect(() => {
    if (!nudge.id) return
    lastInteract.current = performance.now()
    az.current = THREE.MathUtils.clamp(_sph.setFromVector3(tmpPos.copy(camera.position).sub(controls.current.target)).theta + nudge.dir * 0.35, ...AZ_RANGE)
  }, [nudge]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    const cam = camera as THREE.PerspectiveCamera
    const half = THREE.MathUtils.degToRad(cam.fov / 2)
    const aspect = size.width / Math.max(1, size.height)
    const fitDist = Math.max(5.0 / (2 * Math.tan(half)), 6.3 / (2 * Math.tan(half) * aspect)) * 1.04
    const k = 1 - Math.exp(-3.5 * dt)

    if (focus) {
      returning.current = true
      c.enabled = false
      cam.position.lerp(tmpPos.fromArray(FOCUS[focus][0]), k)
      c.target.lerp(tmpTarget.fromArray(FOCUS[focus][1]), k)
    } else if (returning.current) {
      c.target.lerp(TARGET, k)
      tmpPos.copy(VIEW_DIR).multiplyScalar(fitDist).add(TARGET)
      cam.position.lerp(tmpPos, k)
      if (cam.position.distanceTo(tmpPos) < 0.05) {
        returning.current = false
        az.current = BASE_AZ
      }
    } else {
      c.enabled = interactive
      // keep the fitted distance while the user orbits
      _sph.setFromVector3(tmpPos.copy(cam.position).sub(c.target))
      _sph.radius += (fitDist - _sph.radius) * k
      const idle = performance.now() - lastInteract.current > 5000
      if (idle && !reducedMotion) {
        // slow drift so the scene reads as 3D even untouched
        az.current = BASE_AZ + Math.sin(performance.now() / 4200) * 0.28
      }
      if (az.current !== undefined && (idle || Math.abs(_sph.theta - az.current) > 0.002)) {
        _sph.theta += (az.current - _sph.theta) * Math.min(1, dt * (idle ? 1.2 : 5))
      }
      cam.position.setFromSpherical(_sph).add(c.target)
    }
    c.update()
  })

  return (
    <OrbitControls
      ref={controls}
      target={TARGET}
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
      minAzimuthAngle={AZ_RANGE[0]}
      maxAzimuthAngle={AZ_RANGE[1]}
      minPolarAngle={0.75}
      maxPolarAngle={1.3}
      onStart={() => (lastInteract.current = performance.now())}
      onChange={() => {
        // user drag: follow wherever they leave it
        if (performance.now() - lastInteract.current < 4900 && controls.current && !focus && !returning.current) {
          az.current = _sph.setFromVector3(tmpPos.copy(camera.position).sub(controls.current.target)).theta
          lastInteract.current = performance.now()
        }
      }}
    />
  )
}

/* ── canvas ───────────────────────────────────────────────────────────────── */

export interface DevRoomProps {
  theme: Theme
  lite: boolean
  reducedMotion: boolean
  paused: boolean
  onNavigate: (id: HotspotId) => void
  onToggleTheme: () => void
  /** dev-only: transparent capture for the fallback image */
  capture?: boolean
}

export default function DevRoom({ theme, lite, reducedMotion, paused, onNavigate, onToggleTheme, capture = false }: DevRoomProps) {
  const [focus, setFocus] = useState<HotspotId | null>(null)
  const [nudge, setNudge] = useState({ id: 0, dir: 0 })
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const select = (id: SpotId) => {
    if (id === 'theme') return onToggleTheme()
    if (!NAV_IDS.has(id)) return
    const nav = id as HotspotId
    timers.current.forEach(clearTimeout)
    if (reducedMotion) return onNavigate(nav)
    setFocus(nav)
    timers.current = [setTimeout(() => onNavigate(nav), 750), setTimeout(() => setFocus(null), 1900)]
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        frameloop={paused ? 'never' : 'always'}
        shadows={lite ? false : 'percentage'}
        dpr={[1, lite ? 1.5 : 1.75]}
        camera={{ position: VIEW_DIR.clone().multiplyScalar(14).add(TARGET).toArray(), fov: 30, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: capture, powerPreference: 'high-performance' }}
        style={{ touchAction: 'pan-y' }}
        aria-hidden
      >
        <CameraRig focus={focus} reducedMotion={reducedMotion || capture} interactive={!capture} nudge={nudge} />
        <Suspense fallback={null}>
          <Room theme={theme} onSelect={select} lite={lite} reducedMotion={reducedMotion} hints={!capture} />
        </Suspense>
        {!lite && theme === 'dark' && !capture && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={1} intensity={0.7} />
          </EffectComposer>
        )}
      </Canvas>
      {!capture && (
        <div className="absolute bottom-2 right-2 flex gap-1.5" role="group" aria-label="Rotate the room">
          {[
            [-1, '⟲', 'Rotate room left'],
            [1, '⟳', 'Rotate room right'],
          ].map(([dir, icon, label]) => (
            <button
              key={label as string}
              type="button"
              aria-label={label as string}
              onClick={() => setNudge((n) => ({ id: n.id + 1, dir: dir as number }))}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-fg shadow-sm backdrop-blur transition hover:border-accent hover:text-accent"
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
