/**
 * ErrorMessage.jsx
 * Reusable error card — Practical 3 (ITUE301)
 * Updated in Practical 6: generic label (tasks instead of repositories)
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <span className="error-icon" aria-hidden="true">⚠️</span>
      <h3>Failed to load tasks</h3>
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
