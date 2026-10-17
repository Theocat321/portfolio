import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MOON_RADIUS } from '../../data/projects'

export function Piano() {
  const groupRef = useRef<THREE.Group>(null)

  // Place on moon surface
  const lat = -5
  const lng = -85
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const r = MOON_RADIUS + 0.01
  const position = useMemo<[number, number, number]>(() => [
    r * Math.cos(latRad) * Math.sin(lngRad),
    r * Math.sin(latRad),
    r * Math.cos(latRad) * Math.cos(lngRad),
  ], [])

  const normal = useMemo(() => new THREE.Vector3(...position).normalize(), [position])
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
    return q
  }, [normal])

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle float
      const t = state.clock.elapsedTime
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.003
    }
  })

  const scale = 0.06

  return (
    <group ref={groupRef} position={position} quaternion={quaternion} scale={scale}>
      {/* Piano body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.5, 0.6, 1.2]} />
        <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Piano lid (open) */}
      <mesh position={[0, 0.85, -0.3]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[2.5, 0.04, 1.0]} />
        <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Lid stick */}
      <mesh position={[0.8, 0.75, -0.1]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* White keys block */}
      <mesh position={[0, 0.72, 0.35]}>
        <boxGeometry args={[2.3, 0.04, 0.35]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.5} />
      </mesh>
      {/* Black keys (simplified as small blocks) */}
      {[-0.9, -0.6, -0.15, 0.15, 0.45, 0.75, 1.05].map((x, i) => (
        <mesh key={i} position={[x, 0.76, 0.28]}>
          <boxGeometry args={[0.1, 0.04, 0.2]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      ))}
      {/* Legs */}
      {[[-1.0, 0, 0.4], [1.0, 0, 0.4], [0, 0, -0.4]].map((pos, i) => (
        <mesh key={`leg-${i}`} position={[pos[0], 0.05, pos[2]]}>
          <cylinderGeometry args={[0.06, 0.05, 0.15, 8]} />
          <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* Pedals */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={`pedal-${i}`} position={[x, 0.02, 0.5]}>
          <boxGeometry args={[0.08, 0.01, 0.12]} />
          <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}
