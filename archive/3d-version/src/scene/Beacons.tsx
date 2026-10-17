import { Beacon } from './Beacon'
import { projects } from '../data/projects'

export function Beacons() {
  return (
    <>
      {projects.map((project, index) => (
        <Beacon key={project.id} project={project} index={index} />
      ))}
    </>
  )
}
