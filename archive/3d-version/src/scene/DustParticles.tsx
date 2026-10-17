import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 300

export function DustParticles() {
  const ref = useRef<THREE.Points>(null)

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute in a shell around the moon
      const r = 2 + Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      // Slow drift
      vel[i * 3] = (Math.random() - 0.5) * 0.003
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003
    }
    return [pos, vel]
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const posAttr = ref.current.geometry.attributes.position
    const arr = posAttr.array as Float32Array
    const t = state.clock.elapsedTime

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      // Drift with slight orbital motion
      arr[i3] += velocities[i3] + Math.sin(t * 0.1 + i) * 0.001
      arr[i3 + 1] += velocities[i3 + 1]
      arr[i3 + 2] += velocities[i3 + 2] + Math.cos(t * 0.1 + i) * 0.001

      // Reset particles that drift too far
      const dist = Math.sqrt(arr[i3] ** 2 + arr[i3 + 1] ** 2 + arr[i3 + 2] ** 2)
      if (dist > 8 || dist < 1.6) {
        const r = 2 + Math.random() * 4
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        arr[i3] = r * Math.sin(phi) * Math.cos(theta)
        arr[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        arr[i3 + 2] = r * Math.cos(phi)
      }
    }
    posAttr.needsUpdate = true

    // Slow rotation of the whole particle system
    ref.current.rotation.y += 0.0003
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4cc9f0"
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
