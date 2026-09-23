/**
 * TaskManager.jsx
 * Full-featured Task Manager dashboard.
 * Practical 8: Performance Optimization & Lazy Loading — ITUE301
 *
 * Changes from Practical 6/7:
 *   - StatsChart imported via React.lazy() — its JS chunk is only downloaded
 *     when the user visits /tasks-ui (supplementary lazy loading requirement)
 *   - Inner <Suspense> wraps <StatsChart> with a lightweight chart-specific
 *     fallback — demonstrates Suspense at component level, not just route level
 *   - Section kicker updated to "Practical 8"
 *
 * Earlier changes (Practical 6):
 *   - All API calls moved to centralized ../api.js (no hardcoded fetch/URL)
 *   - useToast hook wired: success/error toast after every CRUD operation
 *   - Optimistic UI for task creation: task appears instantly; rolled back on error
 *   - Priority badge displayed on each task card
 *   - Toast component rendered inside this section
 */
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'

// ── Supplementary: lazy-load StatsChart only when this page is mounted ────────
// This chunk is separate from the TaskManager route chunk itself and is only
// fetched once the component tree renders and the browser needs StatsChart.
const StatsChart = lazy(() => import('./StatsChart'))
import { deleteTask, getTasks, updateTask } from '../api'
import useToast from '../hooks/useToast'
import ErrorMessage from './ErrorMessage'
import Spinner from './Spinner'
import TaskFormModal from './TaskFormModal'
import Toast from './Toast'

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'done',   label: 'Completed' },
]

// ─── Priority badge config ────────────────────────────────────────────────────
const PRIORITY_META = {
  low:    { label: 'Low',    className: 'tm-badge tm-badge--low' },
  medium: { label: 'Medium', className: 'tm-badge tm-badge--medium' },
  high:   { label: 'High',   className: 'tm-badge tm-badge--high' },
}

// ─── Individual task card ─────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const [deleting, setDeleting]       = useState(false)
  const [toggling, setToggling]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    await onToggle(task)
    setToggling(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await onDelete(task.id)
    setDeleting(false)
    setConfirmDelete(false)
  }

  const priorityMeta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium

  return (
    <article className={`tm-card${task.completed ? ' tm-card--done' : ''}${task._optimistic ? ' tm-card--optimistic' : ''}`}>
      {/* Completion toggle */}
      <button
        id={`btn-toggle-${task.id}`}
        type="button"
        className={`tm-check${task.completed ? ' tm-check--active' : ''}`}
        onClick={handleToggle}
        disabled={toggling || task._optimistic}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed ? '✓' : ''}
      </button>

      {/* Content */}
      <div className="tm-card__body">
        <div className="tm-card__top">
          <span className="tm-card__id">#{task._optimistic ? '…' : task.id.slice(-6)}</span>
          <div className="tm-card__badges">
            {/* Priority badge */}
            <span className={priorityMeta.className}>{priorityMeta.label}</span>
            {task.completed && <span className="tm-badge tm-badge--done">Done</span>}
            {task._optimistic && <span className="tm-badge tm-badge--saving">Saving…</span>}
          </div>
        </div>
        <h3 className={`tm-card__title${task.completed ? ' tm-card__title--done' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="tm-card__desc">{task.description}</p>
        )}
        <div className="tm-card__meta">
          <span className="tm-card__date">
            🕐 {new Date(task.createdAt).toLocaleDateString('en-AU', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </span>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <span className="tm-card__date tm-card__date--updated">
              ✏️ Updated {new Date(task.updatedAt).toLocaleDateString('en-AU', {
                day: '2-digit', month: 'short',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="tm-card__actions">
        <button
          id={`btn-edit-${task.id}`}
          type="button"
          className="tm-action-btn tm-action-btn--edit"
          onClick={() => onEdit(task)}
          title="Edit task"
          aria-label={`Edit task ${task.title}`}
          disabled={task._optimistic}
        >
          ✏️
        </button>
        <button
          id={`btn-delete-${task.id}`}
          type="button"
          className={`tm-action-btn tm-action-btn--delete${confirmDelete ? ' tm-action-btn--confirm' : ''}`}
          onClick={handleDelete}
          disabled={deleting || task._optimistic}
          title={confirmDelete ? 'Click again to confirm delete' : 'Delete task'}
          aria-label={confirmDelete ? 'Confirm delete' : `Delete task ${task.title}`}
          onBlur={() => setConfirmDelete(false)}
        >
          {deleting ? '…' : confirmDelete ? '⚠ Confirm' : '🗑'}
        </button>
      </div>
    </article>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filter, onAdd }) {
  const messages = {
    all:    { emoji: '📋', text: 'No tasks yet.',        sub: 'Create your first task to get started.' },
    active: { emoji: '✅', text: 'No active tasks!',     sub: 'All your tasks are completed.' },
    done:   { emoji: '🎯', text: 'Nothing completed yet.', sub: 'Finish a task and it will appear here.' },
  }
  const msg = messages[filter]
  return (
    <div className="tm-empty">
      <span className="tm-empty__emoji">{msg.emoji}</span>
      <h3 className="tm-empty__title">{msg.text}</h3>
      <p className="tm-empty__sub">{msg.sub}</p>
      {filter === 'all' && (
        <button
          type="button"
          id="btn-empty-add-task"
          className="tm-btn tm-btn--primary"
          onClick={onAdd}
        >
          + Add your first task
        </button>
      )}
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
function TaskManager() {
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [apiOnline, setApiOnline] = useState(null)
  const [fromCache, setFromCache] = useState(null) // null | true | false — Practical 9
  const [filter, setFilter]     = useState('all')
  const [modal, setModal]       = useState(null) // null | 'create' | task-object

  // ── Toast hook — Practical 6 ────────────────────────────────────────────────
  const { toasts, showToast, dismissToast } = useToast()

  // ── Fetch all tasks from MongoDB via api.js ──────────────────────────────
  const fetchTasks = useCallback(() => {
    setLoading(true)
    setError(null)
    getTasks()
      .then((json) => {
        setApiOnline(true)
        setTasks(json.data)
        setFromCache(json.fromCache ?? false) // Practical 9: track cache HIT/MISS
      })
      .catch((err) => {
        setApiOnline(false)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  // Fetch on mount — all tasks come from MongoDB, never from hardcoded state
  useEffect(() => { fetchTasks() }, [fetchTasks])

  // ── Toggle complete — PUT /tasks/:id ─────────────────────────────────────
  //   Updates local state from the server response (not assumed success).
  const handleToggle = async (task) => {
    try {
      // ── Practical 6: use api.js updateTask, not raw fetch ─────────────────
      const json = await updateTask(task.id, { completed: !task.completed })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? json.data : t)))
      showToast(
        task.completed ? 'Marked as active ↩' : 'Task completed ✓',
        'success'
      )
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    }
  }

  // ── Delete — DELETE /tasks/:id ───────────────────────────────────────────
  //   Confirmation is handled by the two-click pattern inside TaskCard.
  const handleDelete = async (id) => {
    try {
      // ── Practical 6: use api.js deleteTask ────────────────────────────────
      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      showToast('Task deleted 🗑', 'success')
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    }
  }

  // ── Saved (create or edit) — from TaskFormModal ──────────────────────────
  //   Practical 6: onSaved receives (task, isEdit) so we show the right toast.
  //   For creation, the optimistic placeholder is replaced by the real document.
  const handleSaved = (savedTask, isEdit) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === savedTask.id || t._optimisticId === savedTask.id)
      if (exists) {
        // Replace existing (real update or optimistic placeholder)
        return prev.map((t) =>
          (t.id === savedTask.id || t._optimisticId === savedTask.id) ? savedTask : t
        )
      }
      // Fallback: prepend (should not happen normally)
      return [savedTask, ...prev]
    })
    setModal(null)
    showToast(isEdit ? 'Task updated ✓' : 'Task created ✓', 'success')
  }

  // ── Optimistic UI for task creation — Practical 6 (Supplementary) ────────
  //   Shows a temporary task card immediately (before server responds).
  //   The real server response replaces it via handleSaved.
  //   If the server fails, the placeholder is removed and an error is shown.
  const handleOptimisticCreate = (title, description, priority) => {
    const tempId = `temp-${Date.now()}`
    const optimisticTask = {
      id: tempId,
      _optimisticId: tempId,
      _optimistic: true,
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [optimisticTask, ...prev])
    return tempId
  }

  const handleOptimisticRollback = (tempId) => {
    setTasks((prev) => prev.filter((t) => t.id !== tempId))
  }

  // ── Filtered tasks ──────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'done')   return t.completed
    return true
  })

  const doneCount   = tasks.filter((t) => t.completed).length
  const activeCount = tasks.length - doneCount

  return (
    <section className="content-section tm-section" id="task-manager">
      {/* ── Practical 6: Toast notification stack ───────────────────────── */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="tm-header">
        <div className="section-heading">
          {/* Updated kicker: Practical 9 */}
          <p className="section-kicker">Practical 9 · In-Memory Caching</p>
          <h2>Task Manager</h2>
        </div>
        <div className="tm-header__right">
          {/* API status badge */}
          {apiOnline !== null && (
            <span className={`tm-api-badge${apiOnline ? ' tm-api-badge--online' : ' tm-api-badge--offline'}`}>
              <span className="tm-api-badge__dot" />
              {apiOnline ? 'API Online' : 'API Offline'}
            </span>
          )}
          {/* Practical 9: cache HIT / MISS badge */}
          {fromCache !== null && (
            <span className={`tm-api-badge${fromCache ? ' tm-api-badge--online' : ''}`}
              title={fromCache ? 'Response served from in-memory cache (node-cache)' : 'Response fetched from MongoDB (cache miss)'}>
              <span className="tm-api-badge__dot" />
              {fromCache ? '⚡ Cache HIT' : '🗄 Cache MISS'}
            </span>
          )}
          <button
            type="button"
            id="btn-refresh-tasks"
            className="tm-btn tm-btn--ghost tm-btn--sm"
            onClick={fetchTasks}
            disabled={loading}
            title="Refresh tasks from MongoDB"
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            id="btn-add-task"
            className="tm-btn tm-btn--primary"
            onClick={() => setModal('create')}
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {tasks.length > 0 && (
        <div className="tm-stats">
          <div className="tm-stat">
            <span className="tm-stat__num">{tasks.length}</span>
            <span className="tm-stat__label">Total</span>
          </div>
          <div className="tm-stat tm-stat--active">
            <span className="tm-stat__num">{activeCount}</span>
            <span className="tm-stat__label">Active</span>
          </div>
          <div className="tm-stat tm-stat--done">
            <span className="tm-stat__num">{doneCount}</span>
            <span className="tm-stat__label">Done</span>
          </div>
          {tasks.length > 0 && (
            <div className="tm-progress-wrap">
              <div
                className="tm-progress-bar"
                style={{ width: `${Math.round((doneCount / tasks.length) * 100)}%` }}
                role="progressbar"
                aria-valuenow={doneCount}
                aria-valuemax={tasks.length}
                aria-label={`${doneCount} of ${tasks.length} tasks completed`}
              />
            </div>
          )}
        </div>
      )}

      {/*
        ── Practical 8 Supplementary: Lazy-loaded StatsChart ─────────────────
        StatsChart is wrapped in its OWN Suspense boundary (separate from the
        route-level Suspense in App.jsx).  This means:
          1. The chart chunk is fetched independently — only when this component
             mounts AND React needs to render <StatsChart>.
          2. If the chart chunk loads slowly, only the chart area shows a
             fallback; the rest of the TaskManager UI is still interactive.
        This demonstrates component-level vs route-level code splitting.
      */}
      {tasks.length > 0 && (
        <Suspense
          fallback={
            <div className="stats-chart-loader" role="status">
              <div className="stats-chart-loader__bar" />
              <span>Loading chart…</span>
            </div>
          }
        >
          <StatsChart tasks={tasks} />
        </Suspense>
      )}

      {/* Filter tabs */}
      {tasks.length > 0 && (
        <div className="tm-filters" role="tablist" aria-label="Filter tasks">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              id={`btn-filter-${f.key}`}
              role="tab"
              aria-selected={filter === f.key}
              className={`tm-filter-tab${filter === f.key ? ' tm-filter-tab--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="tm-filter-count">
                {f.key === 'all' ? tasks.length : f.key === 'active' ? activeCount : doneCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      {loading && <Spinner />}
      {!loading && error && <ErrorMessage message={error} onRetry={fetchTasks} />}
      {!loading && !error && filteredTasks.length === 0 && (
        <EmptyState filter={filter} onAdd={() => setModal('create')} />
      )}
      {!loading && !error && filteredTasks.length > 0 && (
        <div className="tm-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => setModal(t)}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <TaskFormModal
          task={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onOptimisticCreate={handleOptimisticCreate}
          onOptimisticRollback={handleOptimisticRollback}
        />
      )}
    </section>
  )
}

export default TaskManager
