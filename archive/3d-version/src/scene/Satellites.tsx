import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SatelliteConfig {
  orbitRadius: number
  speed: number
  tilt: number
  offset: number
  size: number
}

const configs: SatelliteConfig[] = [
  { orbitRadius: 1.8, speed: 0.3, tilt: 0.4, offset: 0, size: 0.015 },
  { orbitRadius: 2.2, speed: -0.2, tilt: 1.2, offset: 2, size: 0.01 },
  { orbitRadius: 1.5, speed: 0.5, tilt: 0.8, offset: 4, size: 0.008 },
]

function Satellite({ config }: { config: SatelliteConfig }) {
  const ref = useRef<THREE.Group>(null)
  const trailRef = useRef<THREE.Points>(null)
  const trailPositions = useRef(new Float32Array(30 * 3))

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * config.speed + config.offset
    const x = Math.cos(t) * config.orbitRadius
    const z = Math.sin(t) * config.orbitRadius
    const y = Math.sin(t * 0.5) * 0.3

    ref.current.position.set(x, y, z)

    // Update trail
    if (trailRef.current) {
      const arr = trailPositions.current
      // Shift positions back
      for (let i = arr.length - 3; i >= 3; i -= 3) {
        arr[i] = arr[i - 3]
        arr[i + 1] = arr[i - 2]
        arr[i + 2] = arr[i - 1]
      }
      // Set current position
      const world = new THREE.Vector3()
      ref.current.getWorldPosition(world)
      arr[0] = world.x
      arr[1] = world.y
      arr[2] = world.z

      const geo = trailRef.current.geometry
      geo.attributes.position.needsUpdate = true
    }
  })

  return (
    <group rotation={[config.tilt, 0, 0]}>
      <group ref={ref}>
        {/* Satellite body */}
        <mesh>
          <boxGeometry args={[config.size, config.size, config.size * 2]} />
          <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Solar panels */}
        <mesh position={[config.size * 2, 0, 0]}>
          <boxGeometry args={[config.size * 2.5, config.size * 0.1, config.size * 1.5]} />
          <meshStandardMaterial color="#2244aa" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[-config.size * 2, 0, 0]}>
          <boxGeometry args={[config.size * 2.5, config.size * 0.1, config.size * 1.5]} />
          <meshStandardMaterial color="#2244aa" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Blinking light */}
        <pointLight color="#ff4444" intensity={0.1} distance={0.3} decay={2} />
      </group>

      {/* Trail */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions.current, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#4cc9f0"
          size={0.005}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

export function Satellites() {
  return (
    <>
      {configs.map((config, i) => (
        <Satellite key={i} config={config} />
      ))}
    </>
  )
}
