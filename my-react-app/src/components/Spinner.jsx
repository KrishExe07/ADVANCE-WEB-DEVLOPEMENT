/**
 * Spinner.jsx
 * Loading indicator — Practical 3 (ITUE301)
 * Updated in Practical 6: generic label (tasks instead of repositories)
 */
function Spinner() {
  return (
    <div className="spinner-wrapper" aria-label="Loading tasks…">
      <div className="spinner" role="status"></div>
      <p className="spinner-text">Fetching tasks…</p>
    </div>
  )
}

export default Spinner
