import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COUNT = 6

interface ShootingStar {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  delay: number
}

export function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null)

  const stars = useMemo<ShootingStar[]>(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        5 + Math.random() * 15,
        -10 - Math.random() * 30
      ),
      velocity: new THREE.Vector3(
        -0.3 - Math.random() * 0.4,
        -0.1 - Math.random() * 0.2,
        -0.1
      ),
      life: 0,
      maxLife: 0.8 + Math.random() * 0.6,
      delay: i * 3 + Math.random() * 5,
    }))
  }, [])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    stars.forEach((star, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return

      if (t < star.delay) {
        mesh.visible = false
        return
      }

      star.life += delta

      if (star.life > star.maxLife) {
        // Reset
        star.position.set(
          10 + Math.random() * 30,
          5 + Math.random() * 15,
          -10 - Math.random() * 30
        )
        star.velocity.set(
          -0.3 - Math.random() * 0.4,
          -0.1 - Math.random() * 0.2,
          -0.1
        )
        star.life = 0
        star.maxLife = 0.8 + Math.random() * 0.6
        star.delay = t + 2 + Math.random() * 8
        mesh.visible = false
        return
      }

      mesh.visible = true
      star.position.add(star.velocity.clone().multiplyScalar(delta * 30))
      mesh.position.copy(star.position)

      // Fade in and out
      const progress = star.life / star.maxLife
      const opacity = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity * 0.8

      // Stretch in direction of travel
      const speed = star.velocity.length()
      mesh.scale.set(speed * 0.3, 0.02, 0.02)
      mesh.lookAt(star.position.clone().add(star.velocity))
    })
  })

  return (
    <group ref={groupRef}>
      {stars.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          visible={false}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}
