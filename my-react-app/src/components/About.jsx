function About() {
  return (
    <section className="content-section about-section" id="about">
      <div className="section-heading">
        <p className="section-kicker">About</p>
        <h2>Student Profile</h2>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <h3>Name</h3>
          <p>Krish Patel</p>
        </article>
        <article className="info-card">
          <h3>Enrollment No.</h3>
          <p>24IT068</p>
        </article>
        <article className="info-card">
          <h3>College</h3>
          <p>CSPIT, CHARUSAT</p>
        </article>
        <article className="info-card">
          <h3>Branch</h3>
          <p>Information Technology</p>
        </article>
      </div>

      <div className="about-panel">
        <div>
          <h3>Passion</h3>
          <p>Web Development, React, AI, Backend Development</p>
        </div>
        <div>
          <h3>Goal</h3>
          <p>
            Become a skilled Full Stack Developer and build innovative web applications.
          </p>
        </div>
      </div>
    </section>
  )
}

export default About