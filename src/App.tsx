import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { SceneSetup } from './scene/SceneSetup'
import { MoonGroup } from './scene/MoonGroup'
import { CameraRig } from './scene/CameraRig'
import { Starfield } from './scene/Starfield'
import { DustParticles } from './scene/DustParticles'
import { AmbientEffects } from './scene/AmbientEffects'
import { BackgroundPlanets } from './scene/BackgroundPlanets'
import { ShootingStars } from './scene/ShootingStars'
import { Satellites } from './scene/Satellites'
import { Header } from './ui/Header'
import { NavHint } from './ui/NavHint'
import { ProjectPanel } from './ui/ProjectPanel'
import { useStore } from './store/useStore'
import { Analytics } from '@vercel/analytics/react'

function App() {
  const setActiveProject = useStore((s) => s.setActiveProject)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveProject(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveProject])

  return (
    <>
      <Canvas
        camera={{ position: [0, 1, 4], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#050505' }}
      >
        <Suspense fallback={null}>
          <SceneSetup />
          <MoonGroup />
          <AmbientEffects />
          <CameraRig />
          <Starfield />
          <DustParticles />
          <BackgroundPlanets />
          <ShootingStars />
          <Satellites />
        </Suspense>
      </Canvas>

      <div className="hud">
        <Header />
        <NavHint />
        <ProjectPanel />
      </div>
      <Analytics />
    </>
  )
}

export default App
