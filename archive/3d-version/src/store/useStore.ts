import { create } from 'zustand'
import * as THREE from 'three'

interface Store {
  activeProject: string | null
  hoveredBeacon: string | null
  isTransitioning: boolean
  beaconRefs: Map<string, THREE.Object3D>
  setActiveProject: (id: string | null) => void
  setHoveredBeacon: (id: string | null) => void
  setTransitioning: (v: boolean) => void
  registerBeacon: (id: string, obj: THREE.Object3D) => void
  unregisterBeacon: (id: string) => void
}

export const useStore = create<Store>((set, get) => ({
  activeProject: null,
  hoveredBeacon: null,
  isTransitioning: false,
  beaconRefs: new Map(),
  setActiveProject: (id) => set({ activeProject: id, isTransitioning: id !== null }),
  setHoveredBeacon: (id) => set({ hoveredBeacon: id }),
  setTransitioning: (v) => set({ isTransitioning: v }),
  registerBeacon: (id, obj) => {
    const refs = new Map(get().beaconRefs)
    refs.set(id, obj)
    set({ beaconRefs: refs })
  },
  unregisterBeacon: (id) => {
    const refs = new Map(get().beaconRefs)
    refs.delete(id)
    set({ beaconRefs: refs })
  },
}))
