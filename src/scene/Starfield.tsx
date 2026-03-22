import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Starfield() {
  const starsRef = useRef<THREE.Points>(null)
  const count = 1500

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // Spread stars in a large sphere around the scene
      const r = 30 + Math.random() * 70
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      siz[i] = Math.random() * 1.5 + 0.3
    }
    return [pos, siz]
  }, [])

  // Subtle twinkle
  useFrame((state) => {
    if (!starsRef.current) return
    const sizes = starsRef.current.geometry.attributes.size
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const base = (sizes.array as Float32Array)[i] || 0.8
      ;(sizes.array as Float32Array)[i] =
        base * (0.7 + 0.3 * Math.sin(t * 0.5 + i * 0.1))
    }
    sizes.needsUpdate = true
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={1.2}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  )
}
