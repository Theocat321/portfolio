import { useStore } from '../store/useStore'

export function NavHint() {
  const activeProject = useStore((s) => s.activeProject)

  return (
    <div
      className="nav-hint"
      style={{ opacity: activeProject ? 0 : 1 }}
    >
      click a beacon to explore
    </div>
  )
}
