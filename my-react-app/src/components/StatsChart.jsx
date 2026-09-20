/**
 * StatsChart.jsx
 * Supplementary lazy-loaded component — Practical 8: Performance Optimization
 *
 * Purpose:
 *   Demonstrates lazy loading a "heavy" component only when the TaskManager
 *   page is visited (not at initial load).  In a real app this would wrap
 *   a library like Chart.js or Recharts; here we implement a pure-CSS/SVG
 *   bar chart so no extra npm dependency is needed.
 *
 * Lazy loading:
 *   This file is imported via React.lazy() inside TaskManager.jsx.
 *   It will only be downloaded when the user navigates to /tasks-ui.
 *
 * IMPORTANT — default export required:
 *   React.lazy() only works with default exports.  Do NOT convert this to
 *   a named export or the lazy import will throw "Element type is invalid".
 */
import { useMemo } from 'react'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns an array of { label, value } from the tasks array */
function buildChartData(tasks) {
  const now = new Date()
  // Build last-7-days labels
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    return d
  })

  return days.map((day) => {
    const label = day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
    const value = tasks.filter((t) => {
      const created = new Date(t.createdAt)
      return (
        created.getFullYear() === day.getFullYear() &&
        created.getMonth() === day.getMonth() &&
        created.getDate() === day.getDate()
      )
    }).length
    return { label, value }
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * StatsChart — pure-CSS animated bar chart showing tasks created per day
 * @param {{ tasks: Array }} props
 */
function StatsChart({ tasks = [] }) {
  const data = useMemo(() => buildChartData(tasks), [tasks])

  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="stats-chart" aria-label="Tasks created in the last 7 days">
      <div className="stats-chart__header">
        <h3 className="stats-chart__title">📊 Tasks Created — Last 7 Days</h3>
        <span className="stats-chart__badge">Lazy-loaded chunk</span>
      </div>

      <div className="stats-chart__bars" role="img" aria-label="Bar chart">
        {data.map(({ label, value }) => {
          const heightPct = Math.round((value / maxValue) * 100)
          return (
            <div className="stats-chart__col" key={label}>
              <span className="stats-chart__value">{value}</span>
              <div
                className="stats-chart__bar-wrap"
                title={`${label}: ${value} task${value !== 1 ? 's' : ''}`}
              >
                <div
                  className="stats-chart__bar"
                  style={{ height: `${heightPct}%` }}
                  role="presentation"
                />
              </div>
              <span className="stats-chart__label">{label}</span>
            </div>
          )
        })}
      </div>

      <p className="stats-chart__note">
        ℹ️ This chart component is <strong>lazy-loaded</strong> — its JS chunk is only
        downloaded when you visit the Task Manager page.
      </p>
    </div>
  )
}

export default StatsChart
