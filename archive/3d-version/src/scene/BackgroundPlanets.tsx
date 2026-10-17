import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PlanetConfig {
  position: [number, number, number]
  radius: number
  color: string
  ringColor?: string
  ringSize?: [number, number]
  speed: number
}

const planets: PlanetConfig[] = [
  // Mars-like (reddish, distant top-right)
  {
    position: [25, 12, -30],
    radius: 0.8,
    color: '#c1440e',
    speed: 0.001,
  },
  // Gas giant (with ring, far left)
  {
    position: [-35, -8, -25],
    radius: 1.5,
    color: '#c4a35a',
    ringColor: '#a89060',
    ringSize: [2.0, 3.0],
    speed: 0.0005,
  },
  // Ice planet (small, blue-white, far away)
  {
    position: [15, -20, -45],
    radius: 0.5,
    color: '#6eb5d4',
    speed: 0.002,
  },
  // Tiny distant planet (purple-ish)
  {
    position: [-20, 18, -50],
    radius: 0.3,
    color: '#8b6da7',
    speed: 0.0015,
  },
]

function Planet({ config }: { config: PlanetConfig }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += config.speed
    }
  })

  return (
    <group position={config.position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.radius, 24, 24]} />
        <meshStandardMaterial
          color={config.color}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {config.ringColor && config.ringSize && (
        <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
          <ringGeometry args={[config.ringSize[0], config.ringSize[1], 64]} />
          <meshStandardMaterial
            color={config.ringColor}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            roughness={0.7}
          />
        </mesh>
      )}
      {/* Subtle self-illumination so they're visible in the dark */}
      <pointLight
        color={config.color}
        intensity={0.3}
        distance={config.radius * 5}
        decay={2}
      />
    </group>
  )
}

export function BackgroundPlanets() {
  return (
    <>
      {planets.map((config, i) => (
        <Planet key={i} config={config} />
      ))}
    </>
  )
}
