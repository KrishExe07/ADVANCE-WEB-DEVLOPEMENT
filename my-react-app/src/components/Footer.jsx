function Footer({ email }) {
  return (
    <footer className="content-section footer-section" id="contact">
      <div className="section-heading">
        <p className="section-kicker">Contact</p>
        <h2>Get in Touch</h2>
      </div>

      <div className="footer-card">
        <p>
          <strong>Name:</strong> Krish Patel
        </p>
        <p>
          <strong>Enrollment No.:</strong> 24IT068
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href={`mailto:${email}`}>
            {email}
          </a>
        </p>
        <p>Copyright © 2026 Krish Patel</p>
      </div>
    </footer>
  )
}

export default Footer