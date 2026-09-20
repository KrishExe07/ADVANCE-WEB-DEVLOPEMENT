/**
 * src/components/Toast.jsx
 * Fixed-position toast notification stack — Practical 6 (ITUE301)
 *
 * Renders a portal-style stack of toasts in the top-right corner.
 * Each toast slides in and fades out automatically.
 *
 * Props:
 *   toasts       — array of { id, message, type } from useToast
 *   onDismiss    — (id: string) => void
 */

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

function ToastItem({ toast, onDismiss }) {
  return (
    <div
      className={`toast toast--${toast.type}`}
      role="alert"
      aria-live="polite"
      id={toast.id}
    >
      <span className="toast__icon" aria-hidden="true">
        {ICONS[toast.type] ?? ICONS.info}
      </span>
      <p className="toast__message">{toast.message}</p>
      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-label="Notifications" role="region">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toast;
