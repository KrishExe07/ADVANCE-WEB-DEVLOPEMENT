/**
 * routes/tasks.js — Practical 9: In-Memory Caching & Query Optimization
 *
 * Caching architecture:
 *   GET /tasks       → cache key: "all_tasks:<userId>"   TTL 60s
 *   GET /tasks/:id   → cache key: "task:<taskId>"        TTL 60s
 *   POST/PUT/DELETE  → write to MongoDB, then invalidate related keys
 *
 * Cache key per-user ensures one user never sees another user's tasks.
 *
 * Why invalidate on every write?
 *   Without invalidation the cache serves stale data for up to TTL seconds.
 *   Example: user creates a task → GET still returns old list until TTL expires.
 *   Invalidation keeps correctness at the cost of one extra DB round-trip
 *   after each write (a worthwhile trade-off).
 *
 * Debug endpoint: GET /tasks/debug/cache
 *   Exposes hit/miss counters and live cache keys (supplementary requirement).
 */

const express = require("express");
const Task    = require("../models/Task");
const protect = require("../middleware/auth");
const cache   = require("../cache");

const router = express.Router();

// ── Normalize MongoDB _id → id ────────────────────────────────────────────────
const normalize = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id.toString();
  return obj;
};

// ── Cache key helpers (per-user so users never see each other data) ───────────
const allKey    = (userId)  => `all_tasks:${userId}`;
const singleKey = (taskId)  => `task:${taskId}`;

// ── Invalidate all cache keys belonging to a user + specific task ─────────────
const invalidate = (userId, taskId = null) => {
  cache.del(allKey(userId));
  if (taskId) cache.del(singleKey(taskId));
};

// All task routes require a valid JWT
router.use(protect);

// ── DEBUG: GET /tasks/debug/cache ─────────────────────────────────────────────
// Supplementary requirement: expose hit/miss counter
// NOTE: must be registered BEFORE /:id so Express does not treat "debug" as an id
router.get("/debug/cache", (req, res) => {
  res.json({ success: true, data: cache.stats() });
});

// ── GET /tasks ────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const key    = allKey(req.user._id);
  const cached = cache.get(key);

  if (cached) {
    // Cache HIT — return immediately without touching MongoDB
    return res.json({ success: true, count: cached.length, data: cached, fromCache: true });
  }

  // Cache MISS — query MongoDB, then store result
  try {
    const tasks      = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    const normalized = tasks.map(normalize);
    cache.set(key, normalized);   // stored with default TTL (60s)
    res.json({ success: true, count: normalized.length, data: normalized, fromCache: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /tasks/:id ────────────────────────────────────────────────────────────
// Supplementary: cached individually with its own key
router.get("/:id", async (req, res) => {
  const key    = singleKey(req.params.id);
  const cached = cache.get(key);

  if (cached) {
    return res.json({ success: true, data: cached, fromCache: true });
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });
    const normalized = normalize(task);
    cache.set(key, normalized);
    res.json({ success: true, data: normalized, fromCache: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /tasks ───────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const task = await Task.create({ user: req.user._id, title, description, priority });
    invalidate(req.user._id);          // stale all-tasks list must be refreshed
    res.status(201).json({ success: true, message: "Task created", data: normalize(task) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /tasks/:id ────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    invalidate(req.user._id, req.params.id);   // invalidate both list + single
    res.json({ success: true, message: "Task updated", data: normalize(task) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /tasks/:id ─────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });
    invalidate(req.user._id, req.params.id);   // invalidate both list + single
    res.json({ success: true, message: "Task deleted", data: normalize(task) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
