function Skills({ skillList }) {
  return (
    <section className="content-section skills-section" id="skills">
      <div className="section-heading">
        <p className="section-kicker">Skills</p>
        <h2>Technical Stack</h2>
      </div>

      <div className="skills-grid">
        {skillList.map((skill) => (
          <span key={skill} className="skill-pill">
            {skill}
          </span>
        ))}
      </div>
    </section>
  )
}

export default Skills