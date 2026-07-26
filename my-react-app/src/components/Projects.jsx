import { useEffect, useState } from 'react'
import ErrorMessage from './ErrorMessage'
import Spinner from './Spinner'
const GITHUB_USERNAME = 'KrishExe07'

function RepoList({ data }) {
  const [search, setSearch] = useState('')

  const filtered = data.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="repo-search-wrapper">
        <input
          id="repo-search"
          type="text"
          className="repo-search"
          placeholder="🔍  Search repositories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search repositories by name"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="repo-empty">No repositories match &ldquo;{search}&rdquo;.</p>
      ) : (
        <div className="projects-grid">
          {filtered.map((repo, index) => (
            <article className="project-card repo-card" key={repo.id}>
              <span className="project-card__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{repo.name}</h3>
              <p>{repo.description || 'No description provided.'}</p>
              <div className="repo-meta">
                <span className="repo-stars" title="Stars">
                  ⭐ {repo.stargazers_count}
                </span>
                {repo.language && (
                  <span className="repo-lang">{repo.language}</span>
                )}
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="repo-link"
                  id={`repo-link-${repo.id}`}
                >
                  View on GitHub ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function Projects() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRepos = () => {
    setLoading(true)
    setError(null)

    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=30&sort=updated`)
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
        return res.json()
      })
      .then((data) => setRepos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRepos()
  }, [])

  return (
    <section className="content-section projects-section" id="projects">
      <div className="section-heading">
        <p className="section-kicker">Projects</p>
        <h2>GitHub Repositories</h2>
      </div>

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={fetchRepos} />}
      {!loading && !error && <RepoList data={repos} />}
    </section>
  )
}

export default Projects