import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Create a unicorn silhouette shape
function createUnicornShape() {
  const shape = new THREE.Shape()

  // Body outline — stylised side profile
  // Start at chest
  shape.moveTo(0, 0)
  // Chest curve up to neck
  shape.quadraticCurveTo(0.05, 0.3, 0.1, 0.55)
  // Neck up
  shape.quadraticCurveTo(0.12, 0.7, 0.15, 0.8)
  // Back of head
  shape.quadraticCurveTo(0.12, 0.95, 0.18, 1.0)
  // Top of head to horn base
  shape.quadraticCurveTo(0.22, 1.05, 0.2, 1.08)
  // Horn
  shape.lineTo(0.22, 1.35)
  // Horn tip back down
  shape.lineTo(0.18, 1.08)
  // Ear
  shape.quadraticCurveTo(0.14, 1.12, 0.12, 1.05)
  // Forehead to nose
  shape.quadraticCurveTo(0.08, 1.0, 0.0, 0.9)
  // Nose/muzzle
  shape.quadraticCurveTo(-0.05, 0.85, -0.02, 0.78)
  // Under jaw back to chest
  shape.quadraticCurveTo(0.0, 0.7, 0.02, 0.55)
  // Front of neck down
  shape.quadraticCurveTo(-0.02, 0.35, -0.08, 0.15)
  // Front leg
  shape.lineTo(-0.1, -0.3)
  shape.lineTo(-0.06, -0.3)
  shape.lineTo(-0.04, 0.0)
  // Belly
  shape.quadraticCurveTo(0.1, -0.05, 0.25, 0.0)
  // Back leg
  shape.lineTo(0.27, -0.3)
  shape.lineTo(0.31, -0.3)
  shape.lineTo(0.3, 0.05)
  // Rump
  shape.quadraticCurveTo(0.35, 0.15, 0.38, 0.3)
  // Tail flowing up
  shape.quadraticCurveTo(0.45, 0.5, 0.5, 0.6)
  shape.quadraticCurveTo(0.48, 0.55, 0.42, 0.45)
  shape.quadraticCurveTo(0.38, 0.35, 0.32, 0.25)
  // Back down to start
  shape.quadraticCurveTo(0.2, 0.12, 0, 0)

  return shape
}

export function OrbitingUnicorn() {
  const groupRef = useRef<THREE.Group>(null)
  const unicornRef = useRef<THREE.Group>(null)
  const trailRef = useRef<THREE.Points>(null)
  const trailPositions = useRef(new Float32Array(60 * 3).fill(0))

  const shape = useMemo(() => createUnicornShape(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12
    }

    if (unicornRef.current) {
      // Gentle gallop bob
      unicornRef.current.position.y = Math.sin(t * 3) * 0.015
      unicornRef.current.rotation.z = Math.sin(t * 3) * 0.04
    }

    // Sparkle trail
    if (trailRef.current) {
      const arr = trailPositions.current
      for (let i = arr.length - 3; i >= 3; i -= 3) {
        arr[i] = arr[i - 3]
        arr[i + 1] = arr[i - 2]
        arr[i + 2] = arr[i - 1]
      }
      // Current position of unicorn in world space
      if (unicornRef.current) {
        const pos = new THREE.Vector3()
        unicornRef.current.getWorldPosition(pos)
        arr[0] = pos.x
        arr[1] = pos.y
        arr[2] = pos.z
      }
      trailRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      <group ref={groupRef}>
        <group
          ref={unicornRef}
          position={[2.0, 0.2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={0.12}
        >
          {/* Main silhouette — front face */}
          <mesh>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial
              color="#f0ebe3"
              transparent
              opacity={0.9}
              side={THREE.FrontSide}
            />
          </mesh>
          {/* Back face */}
          <mesh position={[0, 0, -0.01]}>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial
              color="#e8e0d6"
              transparent
              opacity={0.9}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Glow outline */}
          <mesh position={[0, 0, -0.005]} scale={1.04}>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial
              color="#e040fb"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Horn highlight */}
          <pointLight
            position={[0.22, 1.35, 0]}
            color="#e040fb"
            intensity={0.15}
            distance={0.5}
            decay={2}
          />
        </group>
      </group>

      {/* Sparkle trail behind the unicorn */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions.current, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e040fb"
          size={0.012}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  )
}
