import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MOON_RADIUS } from '../../data/projects'

export function Football() {
  const groupRef = useRef<THREE.Group>(null)
  const ballRef = useRef<THREE.Mesh>(null)

  const lat = 50
  const lng = 30
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const r = MOON_RADIUS + 0.04
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
    if (ballRef.current) {
      const t = state.clock.elapsedTime
      // Slow spin and gentle bounce
      ballRef.current.rotation.y += 0.008
      ballRef.current.rotation.x += 0.003
      ballRef.current.position.y = 0.04 + Math.abs(Math.sin(t * 1.2)) * 0.02
    }
  })

  const scale = 0.035

  return (
    <group ref={groupRef} position={position} quaternion={quaternion} scale={scale}>
      <mesh ref={ballRef} position={[0, 0.04, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#f0f0f0"
          roughness={0.6}
          metalness={0.05}
          flatShading
        />
      </mesh>
      {/* Pentagon patches (black) - placed at icosahedron face centers */}
      {[
        [0, 1, 0],
        [0, -1, 0],
        [0.9, 0.4, 0],
        [-0.9, 0.4, 0],
        [0, 0.4, 0.9],
        [0, 0.4, -0.9],
      ].map((pos, i) => (
        <mesh
          key={i}
          position={[pos[0] * 0.95, 0.04 + pos[1] * 0.95, pos[2] * 0.95]}
        >
          <circleGeometry args={[0.3, 5]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
