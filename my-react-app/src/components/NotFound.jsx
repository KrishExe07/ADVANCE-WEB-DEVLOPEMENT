import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="content-section not-found-section">
      <div className="not-found-card">
        <p className="section-kicker">404</p>
        <h2>Page Not Found</h2>
        <p>The route you requested does not exist in this portfolio application.</p>
        <Link className="not-found-link" to="/">
          Back to Home
        </Link>
      </div>
    </section>
  )
}

export default NotFound
