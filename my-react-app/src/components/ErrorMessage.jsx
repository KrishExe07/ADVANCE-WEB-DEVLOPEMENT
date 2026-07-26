function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <span className="error-icon" aria-hidden="true">⚠️</span>
      <h3>Failed to load repositories</h3>
      <p className="error-detail">{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry} id="retry-fetch-btn">
          🔄 Retry
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
