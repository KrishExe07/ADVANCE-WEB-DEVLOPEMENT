function Spinner() {
  return (
    <div className="spinner-wrapper" aria-label="Loading repositories…">
      <div className="spinner" role="status"></div>
      <p className="spinner-text">Fetching repositories…</p>
    </div>
  )
}

export default Spinner
