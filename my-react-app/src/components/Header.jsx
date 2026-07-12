function Header({ name, themeColor }) {
  return (
    <section className="hero-section" id="home" style={{ '--theme-color': themeColor }}>
      <div className="hero-copy">
        <p className="section-kicker">Student Portfolio</p>
        <h1>{name}</h1>
        <p className="hero-subtitle">Enrollment No.: 24IT068</p>
        <p className="hero-description">
          A focused student portfolio for CSPIT, CHARUSAT, highlighting web development,
          modern JavaScript, and practical full stack learning.
        </p>
        <div className="hero-badges" aria-label="Portfolio highlights">
          <span>Information Technology</span>
          <span>React + Vite</span>
          <span>Full Stack Goals</span>
        </div>
      </div>

      <aside className="hero-card">
        <div className="hero-card__accent" />
        <p className="hero-card__label">Portfolio Owner</p>
        <strong>{name}</strong>
        <dl>
          <div>
            <dt>College</dt>
            <dd>CSPIT, CHARUSAT</dd>
          </div>
          <div>
            <dt>Branch</dt>
            <dd>Information Technology</dd>
          </div>
          <div>
            <dt>Enrollment</dt>
            <dd>24IT068</dd>
          </div>
        </dl>
      </aside>
    </section>
  )
}

export default Header