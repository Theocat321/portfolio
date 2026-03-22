import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MOON_RADIUS } from '../data/projects'

const R = MOON_RADIUS

export function UnicornFeatures() {
  const glowRef = useRef<THREE.PointLight>(null)
  const spiralRef = useRef<THREE.Group>(null)
  const auraRef = useRef<THREE.Mesh>(null)

  // Place horn on sphere surface and orient along the surface normal
  const lat = 55 // degrees — upper area
  const lng = 20 // degrees — slightly to the side
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const surfacePos = useMemo<[number, number, number]>(() => [
    R * Math.cos(latRad) * Math.sin(lngRad),
    R * Math.sin(latRad),
    R * Math.cos(latRad) * Math.cos(lngRad),
  ], [])
  const quaternion = useMemo(() => {
    const normal = new THREE.Vector3(...surfacePos).normalize()
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
    return q
  }, [surfacePos])

  // Create a tapered spiral path for the horn
  const spiralSegments = useMemo(() => {
    const segments = []
    const turns = 3
    const height = R * 0.7
    const steps = 24
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      const angle = t * Math.PI * 2 * turns
      const radius = R * 0.05 * (1 - t * 0.7)
      const y = t * height
      segments.push({
        position: [Math.cos(angle) * radius * 0.3, y, Math.sin(angle) * radius * 0.3] as [number, number, number],
        scale: R * 0.045 * (1 - t * 0.85),
        t,
      })
    }
    return segments
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (glowRef.current) {
      glowRef.current.intensity = 0.4 + Math.sin(t * 1.5) * 0.2
    }

    // Slow rotation of the spiral detail
    if (spiralRef.current) {
      spiralRef.current.rotation.y = t * 0.3
    }

    // Aura pulse
    if (auraRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.08
      auraRef.current.scale.set(scale, scale, scale)
      const mat = auraRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.08 + Math.sin(t * 1.5) * 0.04
    }
  })

  return (
    <group position={surfacePos} quaternion={quaternion}>
      {/* Main horn body — smooth tapered cone */}
      <mesh position={[0, R * 0.35, 0]}>
        <coneGeometry args={[R * 0.055, R * 0.7, 16]} />
        <meshStandardMaterial
          color="#f8f0e8"
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Spiral ridges wrapping the horn */}
      <group ref={spiralRef}>
        {spiralSegments.map((seg, i) => (
          <mesh key={i} position={seg.position}>
            <torusGeometry args={[seg.scale * 1.2, seg.scale * 0.25, 6, 16]} />
            <meshStandardMaterial
              color={new THREE.Color().lerpColors(
                new THREE.Color('#f0e8e0'),
                new THREE.Color('#e040fb'),
                seg.t
              )}
              roughness={0.3}
              metalness={0.25}
              transparent
              opacity={0.6 + seg.t * 0.4}
            />
          </mesh>
        ))}
      </group>

      {/* Inner glow core — visible through the horn */}
      <mesh position={[0, R * 0.35, 0]}>
        <coneGeometry args={[R * 0.03, R * 0.65, 12]} />
        <meshBasicMaterial
          color="#e040fb"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Tip — bright magenta crystal */}
      <mesh position={[0, R * 0.72, 0]}>
        <octahedronGeometry args={[R * 0.025, 0]} />
        <meshStandardMaterial
          color="#e040fb"
          roughness={0.1}
          metalness={0.6}
          emissive="#e040fb"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Tip glow light */}
      <pointLight
        ref={glowRef}
        position={[0, R * 0.8, 0]}
        color="#e040fb"
        intensity={0.4}
        distance={1.5}
        decay={2}
      />

      {/* Aura sphere around horn */}
      <mesh ref={auraRef} position={[0, R * 0.4, 0]}>
        <sphereGeometry args={[R * 0.2, 16, 16]} />
        <meshBasicMaterial
          color="#e040fb"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating particles around the horn */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2
        const y = R * (0.15 + (i / 6) * 0.5)
        const rad = R * 0.08
        return (
          <mesh
            key={`particle-${i}`}
            position={[Math.cos(angle) * rad, y, Math.sin(angle) * rad]}
          >
            <sphereGeometry args={[R * 0.006, 6, 6]} />
            <meshBasicMaterial
              color="#e040fb"
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )
      })}
    </group>
  )
}
