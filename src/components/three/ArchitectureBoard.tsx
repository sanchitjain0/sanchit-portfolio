import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, OrbitControls, RoundedBox } from '@react-three/drei'
import { boardPos, boardPosPortrait, edges, nodes, tierRowsPortrait, tiers, type NodeKind } from '../../data/architecture'
import type { Theme } from '../../store/uiStore'
import { Label } from './Label'

/* A clean, layered 3D board: one column per tier, request flow left → right,
   data stores in a front lane, observability at the back. */

const KIND_COLORS: Record<Theme, Record<NodeKind, string>> = {
  dark: { client: '#94a3b8', edge: '#fbbf24', service: '#22d3ee', messaging: '#e879f9', data: '#818cf8', platform: '#34d399' },
  light: { client: '#64748b', edge: '#d97706', service: '#0e7490', messaging: '#a21caf', data: '#4f46e5', platform: '#059669' },
}

const BOARD = { w: 15.6, d: 9.6 }
const BOARD_PORTRAIT = { w: 9.2, d: 15.4 }
const TILE = { w: 1.5, h: 0.26, d: 0.95 }
const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
type Layout = Record<string, [number, number]>
const pos3 = (layout: Layout, id: string, y = TILE.h) => new THREE.Vector3(layout[id][0], y, layout[id][1])

/** arched curve between two tiles */
function edgeCurve(layout: Layout, a: string, b: string) {
  const p0 = pos3(layout, a, TILE.h + 0.02)
  const p2 = pos3(layout, b, TILE.h + 0.02)
  const mid = p0.clone().lerp(p2, 0.5)
  mid.y += 0.45 + p0.distanceTo(p2) * 0.07
  return new THREE.QuadraticBezierCurve3(p0, mid, p2)
}

export interface Trace {
  from: string
  to: string
  startedAt: number
}

interface Props {
  theme: Theme
  selected: string | null
  onSelect: (id: string) => void
  trace: Trace | null
  visited: string[]
  paused: boolean
  interactive: boolean
  reducedMotion: boolean
}

function Board({ theme, selected, onSelect, trace, visited, reducedMotion }: Omit<Props, 'paused' | 'interactive'>) {
  const { size } = useThree()
  const small = size.width < 640
  const portrait = size.width / Math.max(1, size.height) < 0.95
  const layout = portrait ? boardPosPortrait : boardPos
  const dark = theme === 'dark'
  const colors = KIND_COLORS[theme]
  const accent = dark ? '#22d3ee' : '#0e7490'
  const [hovered, setHovered] = useState<string | null>(null)
  const focus = hovered ?? selected
  const curves = useMemo(
    () =>
      edges.map(([a, b]) => {
        const curve = edgeCurve(layout, a, b)
        return { a, b, curve, points: curve.getPoints(32) }
      }),
    [layout],
  )
  const traceCurve = useMemo(() => (trace ? (curves.find((c) => (c.a === trace.from && c.b === trace.to) || (c.a === trace.to && c.b === trace.from)) ?? null) : null), [trace, curves])

  // ambient traffic
  const PACKETS = 34
  const packets = useRef<THREE.InstancedMesh>(null!)
  const traffic = useMemo(() => Array.from({ length: PACKETS }, (_, i) => ({ edge: i % edges.length, t: Math.random(), speed: 0.18 + Math.random() * 0.25 })), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tracer = useRef<THREE.Mesh>(null!)
  const tiles = useRef<Record<string, THREE.Group | null>>({})
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    traffic.forEach((p, i) => {
      if (!reducedMotion) p.t += p.speed * dt
      if (p.t > 1) {
        p.t = 0
        p.edge = (Math.random() * edges.length) | 0
      }
      curves[p.edge].curve.getPoint(p.t, tmp)
      dummy.position.copy(tmp)
      dummy.scale.setScalar(focus && curves[p.edge].a !== focus && curves[p.edge].b !== focus ? 0.03 : 0.05)
      dummy.updateMatrix()
      packets.current.setMatrixAt(i, dummy.matrix)
    })
    packets.current.instanceMatrix.needsUpdate = true

    tracer.current.visible = !!traceCurve
    if (trace && traceCurve) {
      let u = Math.min(1, (performance.now() - trace.startedAt) / 450)
      if (traceCurve.a !== trace.from) u = 1 - u
      traceCurve.curve.getPoint(u, tracer.current.position)
    }
    for (const n of nodes) {
      const g = tiles.current[n.id]
      if (!g) continue
      const up = n.id === focus || n.id === trace?.to ? 0.16 : 0
      g.position.y += (up - g.position.y) * Math.min(1, dt * 10)
    }
  })

  const boardColor = dark ? '#121935' : '#ffffff'
  const laneColor = dark ? '#18214a' : '#eef2f8'
  const lineIdle = dark ? '#3b4a7a' : '#cbd5e1'
  const labelStyle = (active: boolean) => ({
    bg: active ? accent : dark ? 'rgba(11,16,32,0.9)' : 'rgba(255,255,255,0.95)',
    fg: active ? (dark ? '#06121c' : '#ffffff') : dark ? '#f1f5f9' : '#0f172a',
    border: active ? undefined : dark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.14)',
  })

  return (
    <group>
      {/* board + lanes */}
      {portrait ? (
        <>
          <RoundedBox args={[BOARD_PORTRAIT.w, 0.3, BOARD_PORTRAIT.d]} radius={0.12} smoothness={4} position={[0, -0.15, -0.9]} receiveShadow>
            <meshStandardMaterial color={boardColor} roughness={0.85} />
          </RoundedBox>
          {[-7.2, -5.1, -2.0, 1.1, 3.2, 5.4].map((z, i) => (
            <mesh key={z} position={[0, 0.005, z]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[8.6, i === 2 ? 3.9 : 1.6]} />
              <meshStandardMaterial color={laneColor} roughness={1} />
            </mesh>
          ))}
          {tierRowsPortrait.map((t) => (
            <Label key={t.label} text={t.label.toUpperCase()} position={[-3.6, 0.05, t.z - (t.label === 'Services' ? 1.75 : 0.62)]} height={0.022} style={{ bg: 'rgba(0,0,0,0)', fg: dark ? '#7c8bb8' : '#64748b', mono: true }} />
          ))}
        </>
      ) : (
        <>
          <RoundedBox args={[BOARD.w, 0.3, BOARD.d]} radius={0.12} smoothness={4} position={[0, -0.15, 0.1]} receiveShadow>
            <meshStandardMaterial color={boardColor} roughness={0.85} />
          </RoundedBox>
          {[-6, -3.6, 0, 3.6, 6].map((x, i) => (
            <mesh key={x} position={[x, 0.005, -0.15]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[i === 2 ? 4.3 : 2.1, 5.2]} />
              <meshStandardMaterial color={laneColor} roughness={1} />
            </mesh>
          ))}
          <mesh position={[0.4, 0.005, 3.4]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[7.2, 1.4]} />
            <meshStandardMaterial color={laneColor} roughness={1} />
          </mesh>
          {tiers.map((t) => (
            <Label key={t.label} text={t.label.toUpperCase()} position={[t.x, 0.05, t.z]} height={0.03} style={{ bg: 'rgba(0,0,0,0)', fg: dark ? '#7c8bb8' : '#64748b', mono: true }} />
          ))}
        </>
      )}

      {/* edges */}
      {curves.map(({ a, b, points }) => {
        const active = focus === a || focus === b || (!!trace && ((trace.from === a && trace.to === b) || (trace.from === b && trace.to === a)))
        return <Line key={`${a}-${b}`} points={points} color={active ? accent : lineIdle} lineWidth={active ? 2.4 : 1.3} transparent opacity={active ? 1 : focus ? 0.35 : 0.8} />
      })}
      <instancedMesh ref={packets} args={[undefined, undefined, PACKETS]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </instancedMesh>
      <mesh ref={tracer} visible={false} scale={0.13}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color={dark ? '#fbbf24' : '#d97706'} toneMapped={false} />
      </mesh>

      {/* tiles */}
      {nodes.map((n) => {
        const [x, z] = layout[n.id]
        const color = colors[n.kind]
        const active = n.id === focus || n.id === trace?.to
        const done = visited.includes(n.id)
        return (
          <group key={n.id} position={[x, 0, z]}>
            <group ref={(g) => void (tiles.current[n.id] = g)}>
              <RoundedBox
                args={[TILE.w, TILE.h, TILE.d]}
                radius={0.08}
                smoothness={3}
                position={[0, TILE.h / 2, 0]}
                castShadow
                onPointerOver={(e) => {
                  e.stopPropagation()
                  setHovered(n.id)
                  document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                  setHovered(null)
                  document.body.style.cursor = ''
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(n.id)
                }}
              >
                <meshStandardMaterial color={dark ? '#1c2550' : '#f8fafc'} roughness={0.5} metalness={0.1} emissive={color} emissiveIntensity={active ? 0.35 : done ? 0.18 : 0} />
              </RoundedBox>
              {/* coloured top strip = kind */}
              <mesh position={[0, TILE.h + 0.003, -TILE.d / 2 + 0.09]} rotation-x={-Math.PI / 2}>
                <planeGeometry args={[TILE.w - 0.16, 0.08]} />
                <meshBasicMaterial color={color} toneMapped={false} />
              </mesh>
              <Label text={byId[n.id].label} position={[0, TILE.h + 0.32, 0.05]} height={small ? 0.03 : 0.036} style={labelStyle(active)} />
            </group>
          </group>
        )
      })}
    </group>
  )
}

function Rig({ interactive, reducedMotion }: { interactive: boolean; reducedMotion: boolean }) {
  const { size, camera, gl } = useThree()
  const portrait = size.width / Math.max(1, size.height) < 0.95
  const group = useRef<THREE.Group>(null!)
  const dir = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }) => {
    // phones look more top-down so the long (rotated) board doesn't foreshorten into a pile
    dir.set(0, portrait ? 1.7 : 0.95, 1).normalize()
    const cam = camera as THREE.PerspectiveCamera
    const half = THREE.MathUtils.degToRad(cam.fov / 2)
    const aspect = size.width / Math.max(1, size.height)
    const [w, d] = portrait ? [BOARD_PORTRAIT.w, BOARD_PORTRAIT.d] : [BOARD.w, BOARD.d]
    // board footprint as seen from ~45°: depth is foreshortened
    const dist = Math.max((d * (portrait ? 0.95 : 0.82)) / (2 * Math.tan(half)), (w * 1.12) / (2 * Math.tan(half) * aspect))
    if (!interactive) {
      const sway = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.25) * 0.08
      cam.position.set(Math.sin(sway) * dist * dir.z, dist * dir.y, Math.cos(sway) * dist * dir.z + (portrait ? -0.9 : 0))
      cam.lookAt(0, 0, portrait ? -0.9 : 0.3)
    } else if (Math.abs(cam.position.length() - dist) > 0.05) {
      cam.position.setLength(dist)
    }
    void group
    gl.domElement.style.touchAction = 'pan-y'
  })
  return (
    <group ref={group}>
      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          target={[0, 0, 0.3]}
          minAzimuthAngle={-0.6}
          maxAzimuthAngle={0.6}
          minPolarAngle={0.45}
          maxPolarAngle={1.05}
        />
      )}
    </group>
  )
}

export default function ArchitectureBoard({ paused, interactive, reducedMotion, ...rest }: Props) {
  return (
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.75]}
      shadows="percentage"
      camera={{ position: [0, 9, 9.5], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
      aria-hidden
    >
      <ambientLight intensity={rest.theme === 'dark' ? 0.9 : 1.2} />
      <directionalLight position={[4, 10, 6]} intensity={rest.theme === 'dark' ? 1.2 : 1.8} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={7} shadow-camera-bottom={-7} />
      <Rig interactive={interactive} reducedMotion={reducedMotion} />
      <Board reducedMotion={reducedMotion} {...rest} />
    </Canvas>
  )
}
