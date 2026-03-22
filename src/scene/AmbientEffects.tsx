import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function AmbientEffects() {
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.1) * 0.05
      ringRef.current.rotation.z = t * 0.02
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.04 + Math.sin(t * 0.3) * 0.015
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(t * 0.2) * 0.02
      glowRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <>
      {/* Subtle orbital ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.25, 128]} />
        <meshBasicMaterial
          color="#4cc9f0"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Moon atmosphere glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshBasicMaterial
          color="#1a3a4a"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Subtle cyan rim light from behind */}
      <directionalLight
        position={[-4, -1, -4]}
        intensity={0.3}
        color="#4cc9f0"
      />

      {/* Warm secondary fill from opposite side */}
      <pointLight
        position={[6, 2, -3]}
        intensity={0.15}
        color="#ffd4a0"
        distance={15}
        decay={2}
      />
    </>
  )
}
