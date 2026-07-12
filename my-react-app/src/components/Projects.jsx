const PROJECTS = [
  {
    name: 'Student Portfolio',
    description: 'A personal portfolio built to present academic details, skills, and achievements.',
    technologies: 'React, Vite, CSS',
  },
  {
    name: 'ERP Inventory Management System',
    description: 'A backend-driven system to manage inventory, stock records, and operations efficiently.',
    technologies: 'Node.js, Express, MySQL',
  },
  {
    name: 'Wellness Tracker Portal',
    description: 'A simple web portal for tracking daily wellness activities and healthy routines.',
    technologies: 'HTML, CSS, JavaScript',
  },
]

function Projects() {
  return (
    <section className="content-section projects-section" id="projects">
      <div className="section-heading">
        <p className="section-kicker">Projects</p>
        <h2>Featured Work</h2>
      </div>

      <div className="projects-grid">
        {PROJECTS.map((project, index) => (
          <article className="project-card" key={project.name}>
            <span className="project-card__index">0{index + 1}</span>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="project-meta">
              <span>Technologies Used</span>
              <strong>{project.technologies}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Projects