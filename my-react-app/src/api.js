/**
 * src/api.js
 * Centralized API module — Practical 6: Full Stack Integration (ITUE301)
 *
 * Architecture:
 *   React Component → api.js function → fetch() → Express /tasks → MongoDB
 *
 * Why a central file?
 *   - Single source of truth for the backend URL (BASE_URL)
 *   - All headers, error conventions, and response shapes live in one place
 *   - Components stay clean: they only call functions, never raw fetch()
 *
 * Usage:
 *   import { getTasks, createTask, updateTask, deleteTask } from '../api'
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────
//   Change this ONE constant if the backend moves to a different host/port.
//   Never hardcode 'http://localhost:5000' directly in component files.
export const BASE_URL = 'http://localhost:5000';

// ─── Shared fetch helper ──────────────────────────────────────────────────────
//   Centralises headers and error handling for all mutating requests.
const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });
  
  const json = await res.json();
  
  if (res.status === 401) {
    // Dispatch a custom event so the App can redirect to login
    window.dispatchEvent(new Event('unauthorized'));
  }
  
  if (!res.ok) {
    // Surface the backend's error message when available
    throw new Error(json.error || `Request failed: ${res.status} ${res.statusText}`);
  }
  return json;
};

// ─── GET /tasks ───────────────────────────────────────────────────────────────
//   Returns { success, count, data: Task[] } from the backend.
//   Called on component mount and after any write that needs a full refresh.
export const getTasks = () => request('/tasks');

// ─── POST /tasks ──────────────────────────────────────────────────────────────
//   @param {object} data — { title, description?, priority? }
//   @returns {object}    — { success, message, data: Task }
export const createTask = (data) =>
  request('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ─── PUT /tasks/:id ───────────────────────────────────────────────────────────
//   @param {string} id   — MongoDB ObjectId string
//   @param {object} data — any subset of { title, description, completed, priority }
//   @returns {object}    — { success, message, data: Task }
export const updateTask = (id, data) =>
  request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────
//   @param {string} id — MongoDB ObjectId string
//   @returns {object}  — { success, message, data: Task }
export const deleteTask = (id) =>
  request(`/tasks/${id}`, { method: 'DELETE' });

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const register = (email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => request('/auth/me');
