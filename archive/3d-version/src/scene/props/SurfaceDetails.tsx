import { useMemo } from 'react'
import * as THREE from 'three'
import { MOON_RADIUS } from '../../data/projects'

function latLngToPos(lat: number, lng: number, r: number): [number, number, number] {
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  return [
    r * Math.cos(latRad) * Math.sin(lngRad),
    r * Math.sin(latRad),
    r * Math.cos(latRad) * Math.cos(lngRad),
  ]
}

function getQuaternion(position: [number, number, number]) {
  const normal = new THREE.Vector3(...position).normalize()
  const q = new THREE.Quaternion()
  q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
  return q
}

// Scattered moon rocks
const rockPositions = [
  [10, 20], [-25, 40], [40, -50], [-35, -30], [15, 60],
  [-10, -70], [30, 25], [-40, 10], [25, -15], [-15, 55],
  [45, -35], [-30, 65], [5, -45], [50, 5], [-45, -55],
  [20, 80], [-20, -80], [35, 45], [-50, 20], [10, -25],
  [-5, 35], [28, -65], [-38, 50], [42, 15], [-12, -40],
]

function Rock({ lat, lng, seed }: { lat: number; lng: number; seed: number }) {
  const r = MOON_RADIUS + 0.001
  const position = useMemo(() => latLngToPos(lat, lng, r), [lat, lng, r])
  const quaternion = useMemo(() => getQuaternion(position), [position])
  const scale = useMemo(() => {
    const s = 0.005 + (seed % 7) * 0.003
    return [s * (0.8 + Math.random() * 0.4), s * 0.6, s * (0.8 + Math.random() * 0.4)] as [number, number, number]
  }, [seed])

  return (
    <mesh position={position} quaternion={quaternion} scale={scale}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#777777" roughness={0.9} flatShading />
    </mesh>
  )
}

// Flag planted on the moon
function Flag({ lat, lng }: { lat: number; lng: number }) {
  const r = MOON_RADIUS + 0.001
  const position = useMemo(() => latLngToPos(lat, lng, r), [lat, lng, r])
  const quaternion = useMemo(() => getQuaternion(position), [position])

  return (
    <group position={position} quaternion={quaternion} scale={0.04}>
      {/* Pole */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Flag fabric */}
      <mesh position={[0.25, 0.85, 0]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshStandardMaterial
          color="#4cc9f0"
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </mesh>
      {/* Small "A" on the flag (simplified as a dot) */}
      <mesh position={[0.25, 0.85, 0.001]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// Footprints trail (small indentations)
function Footprints({ startLat, startLng }: { startLat: number; startLng: number }) {
  const prints = useMemo(() => {
    const result = []
    for (let i = 0; i < 8; i++) {
      const lat = startLat + i * 1.5
      const lng = startLng + Math.sin(i * 0.5) * 2
      const r = MOON_RADIUS + 0.001
      const pos = latLngToPos(lat, lng, r)
      const q = getQuaternion(pos)
      result.push({ position: pos, quaternion: q })
    }
    return result
  }, [startLat, startLng])

  return (
    <>
      {prints.map((print, i) => (
        <mesh key={i} position={print.position} quaternion={print.quaternion} scale={0.008}>
          <planeGeometry args={[0.8, 1.2]} />
          <meshStandardMaterial
            color="#555555"
            transparent
            opacity={0.3 - i * 0.03}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

// Small antenna / radio dish
function Antenna({ lat, lng }: { lat: number; lng: number }) {
  const r = MOON_RADIUS + 0.001
  const position = useMemo(() => latLngToPos(lat, lng, r), [lat, lng, r])
  const quaternion = useMemo(() => getQuaternion(position), [position])

  return (
    <group position={position} quaternion={quaternion} scale={0.03}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.1, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Dish */}
      <mesh position={[0, 0.6, 0.05]} rotation={[0.3, 0, 0]}>
        <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#cccccc"
          metalness={0.8}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Blinking light */}
      <pointLight position={[0, 0.65, 0]} color="#ff2222" intensity={0.05} distance={0.2} decay={2} />
    </group>
  )
}

// Small lunar module / lander
function LunarLander({ lat, lng }: { lat: number; lng: number }) {
  const r = MOON_RADIUS + 0.001
  const position = useMemo(() => latLngToPos(lat, lng, r), [lat, lng, r])
  const quaternion = useMemo(() => getQuaternion(position), [position])

  return (
    <group position={position} quaternion={quaternion} scale={0.025}>
      {/* Body */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.3, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Top module */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Legs */}
      {[0, 1.57, 3.14, 4.71].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.35, 0.1, Math.sin(angle) * 0.35]}
          rotation={[0, 0, Math.cos(angle) * 0.3]}
        >
          <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Foot pads */}
      {[0, 1.57, 3.14, 4.71].map((angle, i) => (
        <mesh
          key={`pad-${i}`}
          position={[Math.cos(angle) * 0.45, 0.01, Math.sin(angle) * 0.45]}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.02, 6]} />
          <meshStandardMaterial color="#999999" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function SurfaceDetails() {
  return (
    <>
      {/* Scattered rocks */}
      {rockPositions.map(([lat, lng], i) => (
        <Rock key={`rock-${i}`} lat={lat} lng={lng} seed={i} />
      ))}

      {/* Flag */}
      <Flag lat={25} lng={-10} />

      {/* Footprints near the flag */}
      <Footprints startLat={22} startLng={-12} />

      {/* Antenna / dish */}
      <Antenna lat={-20} lng={30} />

      {/* Lunar lander */}
      <LunarLander lat={10} lng={-50} />
    </>
  )
}
