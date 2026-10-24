import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, OrbitControls, useGLTF } from '@react-three/drei'
import { LAND_DOTS } from '../../data/landDots'
import { markets, restaurantBrands } from '../../data/portfolio'
import type { Theme } from '../../store/uiStore'
import { Label } from './Label'

const R = 2
const RING_R = 2.55
/** cities labelled by default (the Gulf is too dense to label every pin) */
const MAJOR = new Set(['Riyadh', 'Cairo', 'Casablanca', 'Almaty'])
const FOOD_URL = '/models/food.glb'
/** which Kenney Food Kit model represents each brand's food */
const FOOD_MODEL: Record<string, { name: string; scale: number; tilt: number }> = {
  chicken: { name: 'meat-cooked', scale: 1.15, tilt: 0.7 },
  pizza: { name: 'pizza', scale: 0.9, tilt: 1.0 },
  burger: { name: 'burger-cheese', scale: 1.1, tilt: 0.3 },
  fries: { name: 'fries', scale: 1.0, tilt: 0.15 },
  donut: { name: 'donut-sprinkles', scale: 1.3, tilt: 1.0 },
}

function latLng(lat: number, lng: number, r = R) {
  const phi = THREE.MathUtils.degToRad(lat)
  const lam = THREE.MathUtils.degToRad(lng)
  return new THREE.Vector3(r * Math.cos(phi) * Math.sin(lam), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(lam))
}

function arc(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const lift = 1 + a.distanceTo(b) * 0.28
  mid.setLength(R * lift)
  return new THREE.QuadraticBezierCurve3(a, mid, b)
}

/** round dot sprite for the land points */
function useDotTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 32
    const g = c.getContext('2d')!
    g.fillStyle = '#fff'
    g.beginPath()
    g.arc(16, 16, 14, 0, Math.PI * 2)
    g.fill()
    return new THREE.CanvasTexture(c)
  }, [])
}

function Food({ name, scale, tilt, color, active, onClick }: { name: string; scale: number; tilt: number; color: string; active: boolean; onClick: () => void }) {
  const { scenes, scene } = useGLTF(FOOD_URL)
  const obj = useMemo(() => {
    const o = (scenes.find((s) => s.name === name) ?? scene).clone(true)
    const box = new THREE.Box3().setFromObject(o)
    const c = box.getCenter(new THREE.Vector3())
    o.position.sub(c)
    return o
  }, [scenes, scene, name])
  const ring = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const s = active ? 1.25 + Math.sin(clock.elapsedTime * 6) * 0.05 : 1
    ring.current.scale.setScalar(s)
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = active ? 0.9 : 0.35
  })
  return (
    <group
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <group scale={scale * (active ? 1.25 : 1)} rotation={[tilt, 0, 0]}>
        <primitive object={obj} />
      </group>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, -0.22, 0]}>
        <ringGeometry args={[0.2, 0.24, 40]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}
useGLTF.preload(FOOD_URL)

interface Props {
  theme: Theme
  brand: string | null
  onBrand: (id: string | null) => void
  city: string | null
  onCity: (city: string) => void
  paused: boolean
  interactive: boolean
  reducedMotion: boolean
}

function Scene({ theme, brand, onBrand, city, onCity, reducedMotion, interactive }: Omit<Props, 'paused'>) {
  const dark = theme === 'dark'
  const dotTex = useDotTexture()
  const globe = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Group>(null!)
  const { size } = useThree()
  const small = size.width < 520
  const [hoverCity, setHoverCity] = useState<string | null>(null)

  const landGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array((LAND_DOTS.length / 2) * 3)
    for (let i = 0; i < LAND_DOTS.length; i += 2) {
      latLng(LAND_DOTS[i], LAND_DOTS[i + 1], R * 1.002).toArray(pos, (i / 2) * 3)
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const hub = markets.find((m) => 'hub' in m && m.hub)!
  const hubV = useMemo(() => latLng(hub.lat, hub.lng), [hub])
  const routes = useMemo(
    () =>
      markets
        .filter((m) => m !== hub)
        .map((m) => {
          const curve = arc(hubV, latLng(m.lat, m.lng))
          return { city: m.city, curve, points: curve.getPoints(40) }
        }),
    [hub, hubV],
  )

  // order packets: each picks a route + a brand colour
  const PACKETS = 40
  const packets = useRef<THREE.InstancedMesh>(null!)
  const traffic = useMemo(
    () => Array.from({ length: PACKETS }, (_, i) => ({ route: i % routes.length, brand: i % restaurantBrands.length, t: Math.random(), speed: 0.25 + Math.random() * 0.3 })),
    [routes.length],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const col = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    const t = clock.elapsedTime
    if (!reducedMotion && !interactive) globe.current.rotation.y = Math.sin(t * 0.12) * 0.18
    // dishes circle the globe in the view plane (always visible, always upright)
    ring.current.children.forEach((c, i) => {
      const a = (i / ring.current.children.length) * Math.PI * 2 + (reducedMotion ? 0 : t * 0.08) + 0.5
      c.position.set(Math.cos(a) * RING_R, Math.sin(a) * RING_R * 0.85, 0.9)
    })
    traffic.forEach((p, i) => {
      if (!reducedMotion) p.t += p.speed * dt
      if (p.t > 1) {
        p.t = 0
        p.route = (Math.random() * routes.length) | 0
        p.brand = (Math.random() * restaurantBrands.length) | 0
      }
      routes[p.route].curve.getPoint(p.t, dummy.position)
      const b = restaurantBrands[p.brand]
      const dim = brand && b.id !== brand
      dummy.scale.setScalar(dim ? 0.0001 : 0.035)
      dummy.updateMatrix()
      packets.current.setMatrixAt(i, dummy.matrix)
      packets.current.setColorAt(i, col.set(b.color))
    })
    packets.current.instanceMatrix.needsUpdate = true
    if (packets.current.instanceColor) packets.current.instanceColor.needsUpdate = true
  })

  const brandColor = brand ? restaurantBrands.find((b) => b.id === brand)!.color : dark ? '#22d3ee' : '#0e7490'
  const labelStyle = (active: boolean) => ({
    bg: active ? brandColor : dark ? 'rgba(11,16,32,0.85)' : 'rgba(255,255,255,0.92)',
    fg: active ? '#ffffff' : dark ? '#e2e8f0' : '#0f172a',
    border: active ? undefined : dark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.14)',
  })

  return (
    <>
      {/* turn MENA toward the camera */}
      <group rotation={[THREE.MathUtils.degToRad(24), THREE.MathUtils.degToRad(-42), 0]}>
        <group ref={globe}>
          <mesh>
            <sphereGeometry args={[R, 64, 48]} />
            <meshStandardMaterial color={dark ? '#0d1430' : '#e8eef7'} roughness={0.9} />
          </mesh>
          {/* atmosphere rim */}
          <mesh scale={1.06}>
            <sphereGeometry args={[R, 48, 32]} />
            <meshBasicMaterial color={dark ? '#22d3ee' : '#0e7490'} transparent opacity={dark ? 0.08 : 0.06} side={THREE.BackSide} />
          </mesh>
          <points geometry={landGeo}>
            <pointsMaterial size={small ? 0.034 : 0.04} map={dotTex} alphaTest={0.5} color={dark ? '#7f93d9' : '#7c8aa3'} />
          </points>
          {routes.map((r) => (
            <mesh key={r.city}>
              <tubeGeometry args={[r.curve, 40, city === r.city ? 0.014 : 0.008, 6, false]} />
              <meshBasicMaterial color={city === r.city ? brandColor : dark ? '#38bdf8' : '#0284c7'} transparent opacity={city === r.city ? 1 : 0.7} toneMapped={false} />
            </mesh>
          ))}
          <instancedMesh ref={packets} args={[undefined, undefined, PACKETS]} frustumCulled={false}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial toneMapped={false} />
          </instancedMesh>
          {markets.map((m) => {
            const v = latLng(m.lat, m.lng)
            const isHub = 'hub' in m && m.hub
            const active = city === m.city
            return (
              <group key={m.city} position={v}>
                <mesh
                  onClick={(e) => {
                    e.stopPropagation()
                    onCity(m.city)
                  }}
                  onPointerOver={() => {
                    document.body.style.cursor = 'pointer'
                    setHoverCity(m.city)
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = ''
                    setHoverCity(null)
                  }}
                >
                  <sphereGeometry args={[isHub ? 0.07 : 0.05, 16, 12]} />
                  <meshBasicMaterial color={isHub ? (dark ? '#fbbf24' : '#d97706') : active ? brandColor : dark ? '#e2e8f0' : '#0f172a'} toneMapped={false} />
                </mesh>
                {(isHub || active || hoverCity === m.city || (!small && MAJOR.has(m.city))) && <Label text={m.city} position={isHub ? v.clone().setLength(0.42).toArray() : v.clone().setLength(0.1).add(new THREE.Vector3(0, -0.16, 0)).toArray()} height={small ? 0.026 : 0.03} style={labelStyle(active)} />}
              </group>
            )
          })}
        </group>
      </group>

      {/* food ring: click a dish to filter by brand */}
      <group ref={ring}>
        {restaurantBrands.map((b) => {
          const f = FOOD_MODEL[b.food]
          return (
            <group key={b.id}>
              <Float enabled={!reducedMotion} speed={2} rotationIntensity={0.6} floatIntensity={0.6}>
                <Food name={f.name} scale={f.scale} tilt={f.tilt} color={b.color} active={brand === b.id} onClick={() => onBrand(brand === b.id ? null : b.id)} />
              </Float>
            </group>
          )
        })}
      </group>
    </>
  )
}

function Fit() {
  const { size, camera } = useThree()
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const half = THREE.MathUtils.degToRad(cam.fov / 2)
    const aspect = size.width / Math.max(1, size.height)
    const need = 6.2 // food ring diameter + margin
    const dist = Math.max(need / (2 * Math.tan(half)), need / (2 * Math.tan(half) * aspect))
    cam.position.setLength(dist)
  }, [size, camera])
  return null
}

export default function OrdersGlobe({ paused, ...rest }: Props) {
  const [ready, setReady] = useState(false)
  return (
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.6, 9], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y', opacity: ready ? 1 : 0, transition: 'opacity 600ms' }}
      onCreated={() => setReady(true)}
      aria-hidden
    >
      <ambientLight intensity={rest.theme === 'dark' ? 1.1 : 1.4} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} />
      <pointLight position={[-4, -2, 3]} color={rest.theme === 'dark' ? '#e879f9' : '#a21caf'} intensity={10} />
      <Fit />
      <Scene {...rest} />
      {rest.interactive && (
        <OrbitControls enableZoom={false} enablePan={false} enableDamping rotateSpeed={0.5} minPolarAngle={1.0} maxPolarAngle={1.9} minAzimuthAngle={-0.9} maxAzimuthAngle={0.9} />
      )}
    </Canvas>
  )
}
