import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { projects } from '../data/projects'

export function ProjectPanel() {
  const activeProject = useStore((s) => s.activeProject)
  const setActiveProject = useStore((s) => s.setActiveProject)

  const project = projects.find((p) => p.id === activeProject)

  return (
    <AnimatePresence>
      {project && (
        <>
          <div
            className="panel-overlay"
            onClick={() => setActiveProject(null)}
          />
          <motion.div
            className="project-panel"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="panel-close"
              onClick={() => setActiveProject(null)}
            >
              &times;
            </button>

            <div className="panel-meta">
              {project.tag && <span className="panel-tag">{project.tag}</span>}
              {project.date && <span className="panel-date">{project.date}</span>}
            </div>

            <div className="panel-title">{project.title}</div>
            <div className="panel-description">{project.description}</div>

            {project.status && (
              <div className={`panel-status ${project.status === 'Active' ? 'status-active' : ''}`}>
                {project.status}
              </div>
            )}

            {project.link && (
              <a
                className="panel-cta"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Project &rarr;
              </a>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
