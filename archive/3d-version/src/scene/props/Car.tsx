import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MOON_RADIUS } from '../../data/projects'

export function Car() {
  const groupRef = useRef<THREE.Group>(null)
  const wheelsRef = useRef<THREE.Group>(null)

  const lat = -40
  const lng = 55
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
      const t = state.clock.elapsedTime
      groupRef.current.position.y = position[1] + Math.sin(t * 0.3) * 0.002
    }
  })

  const scale = 0.04

  return (
    <group ref={groupRef} position={position} quaternion={quaternion} scale={scale}>
      {/* Car body - lower */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[2.8, 0.35, 1.2]} />
        <meshStandardMaterial color="#cc0000" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Car body - cabin */}
      <mesh position={[0.1, 0.55, 0]}>
        <boxGeometry args={[1.6, 0.35, 1.05]} />
        <meshStandardMaterial color="#cc0000" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-0.55, 0.55, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.5, 0.32, 0.95]} />
        <meshStandardMaterial color="#88ccee" roughness={0.1} metalness={0.3} transparent opacity={0.6} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0.75, 0.55, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.4, 0.3, 0.95]} />
        <meshStandardMaterial color="#88ccee" roughness={0.1} metalness={0.3} transparent opacity={0.6} />
      </mesh>
      {/* Headlights */}
      {[-0.35, 0.35].map((z, i) => (
        <mesh key={`hl-${i}`} position={[-1.4, 0.28, z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ffffcc" />
        </mesh>
      ))}
      {/* Taillights */}
      {[-0.4, 0.4].map((z, i) => (
        <mesh key={`tl-${i}`} position={[1.4, 0.28, z]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#ff3333" />
        </mesh>
      ))}
      {/* Wheels */}
      <group ref={wheelsRef}>
        {[
          [-0.85, 0.1, 0.65],
          [-0.85, 0.1, -0.65],
          [0.85, 0.1, 0.65],
          [0.85, 0.1, -0.65],
        ].map((pos, i) => (
          <group key={`wheel-${i}`} position={[pos[0], pos[1], pos[2]]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>
            {/* Hubcap */}
            <mesh position={[0, 0, pos[2] > 0 ? 0.07 : -0.07]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.12, 8]} />
              <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Subtle shadow on ground */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 1.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  )
}
