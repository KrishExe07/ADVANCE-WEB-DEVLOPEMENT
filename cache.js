/**
 * cache.js — Shared node-cache instance (Practical 9)
 *
 * Why a shared module?
 *   Node.js caches require() results — every file that does
 *   require('./cache') gets the SAME NodeCache instance.
 *   This means the cache is truly shared across all route files
 *   without any global variable.
 *
 * Cache keys used across the app:
 *   'all_tasks:<userId>'   — GET /tasks  (per-user, so users never see each other's data)
 *   'task:<taskId>'        — GET /tasks/:id
 *
 * TTL: 60 seconds — reasonable for a task-management context.
 *   Trade-off: shorter TTL = fresher data but more DB hits;
 *              longer TTL = better performance but stale risk.
 *
 * Limitation (documented for lab journal):
 *   node-cache is in-process memory. In a multi-instance / load-balanced
 *   deployment each server has its own cache, so an invalidation on
 *   server A does NOT propagate to server B. Redis is the standard
 *   solution for that scenario.
 */

const NodeCache = require('node-cache');

// stdTTL: default time-to-live in seconds for every key
// checkperiod: how often (seconds) the TTL cleanup runs
const cache = new NodeCache({ stdTTL: 60, checkperiod: 10 });

// ── Hit / Miss counters (Supplementary) ──────────────────────────────────────
let hits   = 0;
let misses = 0;

const get = (key) => {
  const val = cache.get(key);
  if (val !== undefined) { hits++;   return val; }
  else                   { misses++; return undefined; }
};

const set  = (key, val, ttl) => ttl ? cache.set(key, val, ttl) : cache.set(key, val);
const del  = (key)           => cache.del(key);
const keys = ()              => cache.keys();
const stats = ()             => ({ hits, misses, total: hits + misses, keys: cache.keys(), nodeStats: cache.getStats() });

module.exports = { get, set, del, keys, stats };
