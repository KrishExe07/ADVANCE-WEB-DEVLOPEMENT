/**
 * src/hooks/useToast.js
 * Custom hook for managing toast notifications — Practical 6 (ITUE301)
 *
 * Usage:
 *   const { toasts, showToast, dismissToast } = useToast()
 *   showToast('Task created!', 'success')
 *   showToast('Network error', 'error')
 *
 * Toast object shape: { id, message, type }
 *   type: 'success' | 'error' | 'info'
 */
import { useCallback, useState } from 'react';

const AUTO_DISMISS_MS = 3500; // auto-remove after 3.5 s

function useToast() {
  const [toasts, setToasts] = useState([]);

  // ─── dismissToast ──────────────────────────────────────────────────────────
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── showToast ─────────────────────────────────────────────────────────────
  //   Adds a toast and schedules its auto-removal.
  const showToast = useCallback(
    (message, type = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    },
    [dismissToast]
  );

  return { toasts, showToast, dismissToast };
}

export default useToast;
