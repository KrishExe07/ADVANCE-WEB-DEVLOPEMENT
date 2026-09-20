/**
 * TaskFormModal.jsx
 * Slide-in modal for creating and editing tasks.
 * Practical 6: Full Stack Integration — ITUE301
 *
 * Changes from Practical 5:
 *   - API calls moved to centralized ../api.js (no hardcoded BASE_URL)
 *   - Priority selector added (matches the Mongoose schema enum)
 *   - onSaved(task, isEdit) passes an isEdit flag so parent can show correct toast
 */
import { useEffect, useRef, useState } from 'react'
import { createTask, updateTask } from '../api'

// Priority options matching the Mongoose schema enum
const PRIORITIES = [
  { value: 'low',    label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high',   label: '🔴 High' },
]

function TaskFormModal({ task, onClose, onSaved, onOptimisticCreate, onOptimisticRollback }) {
  const [title, setTitle]             = useState(task ? task.title       : '')
  const [description, setDescription] = useState(task ? task.description : '')
  const [priority, setPriority]       = useState(task ? task.priority    : 'medium')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState(null)
  const titleRef = useRef(null)

  const isEdit = Boolean(task)

  useEffect(() => {
    // Focus title input when modal opens
    setTimeout(() => titleRef.current?.focus(), 80)

    // Close on Escape key
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      titleRef.current?.focus()
      return
    }

    setSubmitting(true)
    setError(null)

    // ── Practical 6 (Supplementary): Optimistic UI for creation ──────────────
    //   For new tasks only: insert a temporary placeholder into the list
    //   immediately so the user sees it appear without waiting for the server.
    //   If the server fails, the placeholder is rolled back.
    let tempId = null
    if (!isEdit && onOptimisticCreate) {
      tempId = onOptimisticCreate(title.trim(), description.trim(), priority)
    }

    try {
      // ── Practical 6: API calls via centralized api.js ─────────────────────
      //   createTask / updateTask handle headers, errors, and the base URL.
      const json = isEdit
        ? await updateTask(task.id, { title: title.trim(), description: description.trim(), priority })
        : await createTask({ title: title.trim(), description: description.trim(), priority })

      // Pass the saved task and a flag telling the parent whether this was
      // a create or an update, so it can show the right toast message.
      onSaved(json.data, isEdit)
    } catch (err) {
      // Roll back the optimistic placeholder on failure
      if (tempId && onOptimisticRollback) onOptimisticRollback(tempId)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="tm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="tm-modal">
        <div className="tm-modal__header">
          <h2 id="modal-title" className="tm-modal__title">
            {isEdit ? '✏️ Edit Task' : '✨ New Task'}
          </h2>
          <button
            type="button"
            className="tm-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form className="tm-modal__form" onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="tm-field">
            <label htmlFor="task-title" className="tm-label">
              Title <span className="tm-required">*</span>
            </label>
            <input
              ref={titleRef}
              id="task-title"
              type="text"
              className={`tm-input${error && !title.trim() ? ' tm-input--error' : ''}`}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(null) }}
              placeholder="e.g. Complete assignment"
              maxLength={120}
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div className="tm-field">
            <label htmlFor="task-description" className="tm-label">
              Description <span className="tm-optional">(optional)</span>
            </label>
            <textarea
              id="task-description"
              className="tm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task…"
              rows={3}
              maxLength={500}
              disabled={submitting}
            />
            <p className="tm-char-count">{description.length}/500</p>
          </div>

          {/* Priority — Practical 6: exposes the Mongoose schema priority field */}
          <div className="tm-field">
            <label htmlFor="task-priority" className="tm-label">
              Priority
            </label>
            <div className="tm-priority-group" role="group" aria-label="Task priority">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  id={`priority-${p.value}`}
                  className={`tm-priority-btn tm-priority-btn--${p.value}${priority === p.value ? ' tm-priority-btn--active' : ''}`}
                  onClick={() => setPriority(p.value)}
                  disabled={submitting}
                  aria-pressed={priority === p.value}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inline error */}
          {error && (
            <p className="tm-form-error" role="alert">⚠ {error}</p>
          )}

          <div className="tm-modal__actions">
            <button
              type="button"
              className="tm-btn tm-btn--ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              id={isEdit ? 'btn-update-task' : 'btn-create-task'}
              className="tm-btn tm-btn--primary"
              disabled={submitting}
            >
              {submitting
                ? (isEdit ? 'Saving…' : 'Creating…')
                : (isEdit ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskFormModal
