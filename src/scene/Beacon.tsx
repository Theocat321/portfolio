import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { type Project, latLngToCartesian, MOON_RADIUS, getBeaconColor } from '../data/projects'

interface BeaconProps {
  project: Project
  index: number
}

export function Beacon({ project, index }: BeaconProps) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const rayRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const setActiveProject = useStore((s) => s.setActiveProject)
  const setHoveredBeacon = useStore((s) => s.setHoveredBeacon)
  const hoveredBeacon = useStore((s) => s.hoveredBeacon)
  const activeProject = useStore((s) => s.activeProject)
  const isTransitioning = useStore((s) => s.isTransitioning)
  const registerBeacon = useStore((s) => s.registerBeacon)
  const unregisterBeacon = useStore((s) => s.unregisterBeacon)

  useEffect(() => {
    if (groupRef.current) {
      registerBeacon(project.id, groupRef.current)
    }
    return () => unregisterBeacon(project.id)
  }, [project.id, registerBeacon, unregisterBeacon])

  const position = latLngToCartesian(
    project.position[0],
    project.position[1],
    MOON_RADIUS + 0.02
  )

  const color = useMemo(() => getBeaconColor(project.status), [project.status])

  // Compute the "up" direction (outward from sphere center) for orienting the ray
  const normal = useMemo(() => {
    const n = new THREE.Vector3(...position).normalize()
    return n
  }, [position])

  // Quaternion to orient the ray along the surface normal
  const rayQuaternion = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
    return q
  }, [normal])

  const isHovered = hoveredBeacon === project.id
  const isActive = activeProject === project.id
  const isDimmed = activeProject !== null && !isActive

  useFrame((state) => {
    const t = state.clock.elapsedTime + index * 0.8
    const pulse = Math.sin(t * 2) * 0.5 + 0.5

    // Core beacon
    if (coreRef.current) {
      let targetScale = 1 + pulse * 0.15
      if (isHovered) targetScale = 1.8
      if (isActive) targetScale = 2.0
      if (isDimmed) targetScale = 0.6

      coreRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }

    // Outer glow sphere
    if (glowRef.current) {
      let targetOpacity = 0.15 + pulse * 0.1
      let glowScale = 1 + pulse * 0.3
      if (isHovered) { targetOpacity = 0.35; glowScale = 1.8 }
      if (isActive) { targetOpacity = 0.4; glowScale = 2.0 }
      if (isDimmed) { targetOpacity = 0.03; glowScale = 0.5 }

      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity += (targetOpacity - mat.opacity) * 0.1
      glowRef.current.scale.lerp(
        new THREE.Vector3(glowScale, glowScale, glowScale),
        0.08
      )
    }

    // Light ray / column
    if (rayRef.current) {
      let rayOpacity = 0.06 + pulse * 0.04
      let rayScaleY = 1 + pulse * 0.2
      if (isHovered) { rayOpacity = 0.15; rayScaleY = 1.5 }
      if (isActive) { rayOpacity = 0.2; rayScaleY = 1.8 }
      if (isDimmed) { rayOpacity = 0.01; rayScaleY = 0.3 }

      const mat = rayRef.current.material as THREE.MeshBasicMaterial
      mat.opacity += (rayOpacity - mat.opacity) * 0.08
      rayRef.current.scale.y += (rayScaleY - rayRef.current.scale.y) * 0.08
    }

    // Point light
    if (lightRef.current) {
      const targetIntensity = isHovered || isActive ? 1.2 : isDimmed ? 0.05 : 0.4
      lightRef.current.intensity += (targetIntensity - lightRef.current.intensity) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Clickable core */}
      <mesh
        ref={coreRef}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredBeacon(project.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHoveredBeacon(null)
          document.body.style.cursor = 'default'
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (!isTransitioning) {
            setActiveProject(project.id)
          }
        }}
      >
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Soft glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Light ray shooting outward from surface */}
      <mesh
        ref={rayRef}
        quaternion={rayQuaternion}
        position={[0, 0, 0]}
      >
        <cylinderGeometry args={[0.008, 0.001, 0.5, 8, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        color={color}
        intensity={0.4}
        distance={1}
        decay={2}
      />
    </group>
  )
}
