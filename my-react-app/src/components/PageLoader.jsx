/**
 * PageLoader.jsx
 * Animated skeleton fallback rendered by Suspense while a lazy route chunk
 * is being downloaded.  Practical 8: Performance Optimization — ITUE301
 *
 * Design decisions:
 *   - Uses a 300 ms CSS animation-delay so the spinner only appears if the
 *     chunk takes longer than 300 ms to load — prevents a flicker on fast
 *     connections (supplementary requirement).
 *   - Pure CSS — no third-party dependency.
 *   - Matches the app's existing dark-mode class on <body/html>.
 */

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label="Loading page…">
      {/* Spinner ring */}
      <div className="page-loader__ring">
        <div className="page-loader__ring-inner" />
      </div>

      {/* Skeleton content blocks */}
      <div className="page-loader__skeleton">
        <div className="page-loader__skeleton-title" />
        <div className="page-loader__skeleton-line page-loader__skeleton-line--wide" />
        <div className="page-loader__skeleton-line page-loader__skeleton-line--medium" />
        <div className="page-loader__skeleton-line page-loader__skeleton-line--narrow" />

        <div className="page-loader__skeleton-cards">
          {[1, 2, 3].map((i) => (
            <div className="page-loader__skeleton-card" key={i} />
          ))}
        </div>
      </div>

      <p className="page-loader__label">Loading page…</p>
    </div>
  )
}

export default PageLoader
