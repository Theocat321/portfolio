import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { MOON_RADIUS } from '../data/projects'
import { useStore } from '../store/useStore'

export function Moon({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const activeProject = useStore((s) => s.activeProject)
  const diffuse = useTexture('/textures/moon-diffuse.jpg')

  useFrame(() => {
    if (groupRef.current && !activeProject) {
      groupRef.current.rotation.y -= 0.002
    }
  })

  return (
    <mesh>
      <sphereGeometry args={[MOON_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={diffuse}
        color="#f0d0d8"
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}
