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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-header-row">
              <div className="panel-title">{project.title}</div>
              <button
                className="panel-close"
                onClick={() => setActiveProject(null)}
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="panel-description">{project.description}</div>

            <div className="panel-details">
              {project.tag && (
                <div className="panel-detail">
                  <span className="panel-detail-label">Type</span>
                  <span className="panel-detail-value">{project.tag}</span>
                </div>
              )}
              {project.date && (
                <div className="panel-detail">
                  <span className="panel-detail-label">Period</span>
                  <span className="panel-detail-value">{project.date}</span>
                </div>
              )}
              {project.status && (
                <div className="panel-detail">
                  <span className="panel-detail-label">Status</span>
                  <span className={`panel-detail-value ${
                    project.status === 'Active' ? 'value-active' :
                    project.status === 'Completed' ? 'value-completed' : 'value-archived'
                  }`}>
                    {project.status}
                  </span>
                </div>
              )}
            </div>

            {project.link && (
              <a
                className="panel-cta"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 6 }}>
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
