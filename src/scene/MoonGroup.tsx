import { useRef } from 'react'
import * as THREE from 'three'
import { Moon } from './Moon'
import { Beacons } from './Beacons'
import { Piano } from './props/Piano'
import { Football } from './props/Football'
import { Car } from './props/Car'
import { SurfaceDetails } from './props/SurfaceDetails'

export function MoonGroup() {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef}>
      <Moon groupRef={groupRef} />
      <Beacons />
      <Piano />
      <Football />
      <Car />
      <SurfaceDetails />
    </group>
  )
}
