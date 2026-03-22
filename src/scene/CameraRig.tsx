import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'

const DEFAULT_ORBIT_RADIUS = 5
const MIN_ORBIT_RADIUS = 2.5
const MAX_ORBIT_RADIUS = 10
const ORBIT_SPEED = 0.05
const LERP_SPEED = 0.04
const ZOOM_DISTANCE = 2.2
const DRAG_SENSITIVITY = 0.005
const SCROLL_SENSITIVITY = 0.003
const IDLE_TIMEOUT = 2

export function CameraRig() {
  const { camera, gl } = useThree()
  const activeProject = useStore((s) => s.activeProject)
  const setTransitioning = useStore((s) => s.setTransitioning)

  const orbitAngleRef = useRef(0)
  const orbitRadiusRef = useRef(DEFAULT_ORBIT_RADIUS)
  const orbitElevationRef = useRef(
    Math.sin((15 * Math.PI) / 180) * DEFAULT_ORBIT_RADIUS
  )
  const targetPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const wasActive = useRef<string | null>(null)
  const snappedTarget = useRef(false)

  // Drag state
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const idleTimer = useRef(0)
  const userControlled = useRef(false)

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (useStore.getState().activeProject) return
    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
    userControlled.current = true
    idleTimer.current = 0
  }, [])

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    orbitAngleRef.current -= dx * DRAG_SENSITIVITY
    const r = orbitRadiusRef.current
    const newElev = orbitElevationRef.current + dy * DRAG_SENSITIVITY * r
    orbitElevationRef.current = Math.max(-r * 0.8, Math.min(r * 0.8, newElev))
    idleTimer.current = 0
  }, [])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const onWheel = useCallback((e: WheelEvent) => {
    if (useStore.getState().activeProject) return
    e.preventDefault()
    const newRadius = orbitRadiusRef.current + e.deltaY * SCROLL_SENSITIVITY
    orbitRadiusRef.current = Math.max(MIN_ORBIT_RADIUS, Math.min(MAX_ORBIT_RADIUS, newRadius))
    userControlled.current = true
    idleTimer.current = 0
  }, [])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [gl, onPointerDown, onPointerMove, onPointerUp, onWheel])

  useFrame((_state, delta) => {
    if (activeProject) {
      const beaconObj = useStore.getState().beaconRefs.get(activeProject)
      if (!beaconObj) return

      // Snap the target once when first clicking (moon is now paused)
      if (wasActive.current !== activeProject) {
        wasActive.current = activeProject
        userControlled.current = false
        snappedTarget.current = false
      }

      if (!snappedTarget.current) {
        const worldPos = new THREE.Vector3()
        beaconObj.getWorldPosition(worldPos)
        const direction = worldPos.clone().normalize()
        // Camera goes out along the beacon direction, offset from surface
        targetPos.current.copy(worldPos.clone().add(direction.multiplyScalar(ZOOM_DISTANCE)))
        targetLookAt.current.copy(worldPos)
        snappedTarget.current = true
      }

      camera.position.lerp(targetPos.current, LERP_SPEED)
      currentLookAt.current.lerp(targetLookAt.current, LERP_SPEED)
      camera.lookAt(currentLookAt.current)

      if (camera.position.distanceTo(targetPos.current) < 0.05) {
        setTransitioning(false)
      }
    } else {
      if (wasActive.current !== null) {
        wasActive.current = null
        snappedTarget.current = false
      }

      if (userControlled.current && !isDragging.current) {
        idleTimer.current += delta
        if (idleTimer.current > IDLE_TIMEOUT) {
          userControlled.current = false
        }
      }

      if (!userControlled.current) {
        orbitAngleRef.current += ORBIT_SPEED * delta
        // Gradually return elevation and radius to defaults
        const defaultElev = Math.sin((15 * Math.PI) / 180) * orbitRadiusRef.current
        orbitElevationRef.current += (defaultElev - orbitElevationRef.current) * 0.02
        orbitRadiusRef.current += (DEFAULT_ORBIT_RADIUS - orbitRadiusRef.current) * 0.01
      }

      const r = orbitRadiusRef.current
      const angle = orbitAngleRef.current
      const orbitTarget = new THREE.Vector3(
        r * Math.sin(angle),
        orbitElevationRef.current,
        r * Math.cos(angle)
      )

      camera.position.lerp(orbitTarget, 0.05)
      currentLookAt.current.lerp(new THREE.Vector3(0, 0, 0), 0.05)
      camera.lookAt(currentLookAt.current)
    }
  })

  return null
}
