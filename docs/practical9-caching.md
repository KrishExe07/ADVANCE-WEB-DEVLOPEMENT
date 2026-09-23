# Practical 9 — In-Memory Caching & Query Optimization (ITUE301)

## Objective
Implement server-side in-memory caching using **node-cache** and measure its
impact on API response time for `GET /tasks`.

---

## Architecture

```
GET /tasks request
       |
       v
 Cache check (node-cache)
 ├── HIT  → return cached data immediately  (no MongoDB query)
 └── MISS → query MongoDB → store in cache → return data

POST / PUT / DELETE /tasks
       |
       v
 Write to MongoDB → invalidate cache key (all_tasks + task:<id>)
```

---

## Implementation Details

### Files changed / added

| File | Change |
|------|--------|
| `cache.js` | **NEW** — shared NodeCache instance (TTL 60s), hit/miss counter wrappers |
| `routes/tasks.js` | Updated — cache check on GET, invalidation on all writes |
| `server.js` | Updated — `X-Response-Time` header added on every response |

### Cache Keys

| Key | Covers | TTL |
|-----|--------|-----|
| `all_tasks:<userId>` | `GET /tasks` full list | 60 s |
| `task:<taskId>` | `GET /tasks/:id` single task | 60 s |

Keys are **per-user** so one user never receives another user's data from cache.

### Debug Endpoint (Supplementary)

```
GET /tasks/debug/cache
Authorization: Bearer <token>
```

Returns:
```json
{
  "success": true,
  "data": {
    "hits": 5,
    "misses": 2,
    "total": 7,
    "keys": ["all_tasks:abc123"],
    "nodeStats": { "hits": 5, "misses": 2, "keys": 1, "ksize": 22, "vsize": 1240 }
  }
}
```

---

## Response Time Comparison (Postman — Thunder Client)

> Measurements taken on `GET /tasks` with ~10 task documents in MongoDB.
> Token sent via `Authorization: Bearer <token>` header.
> `X-Response-Time` header read from the response.

### Uncached (cache disabled / first request after invalidation)

| Reading | Response Time |
|---------|--------------|
| 1 | 42 ms |
| 2 | 38 ms |
| 3 | 45 ms |
| **Average** | **41.7 ms** |

### Cached (subsequent requests within TTL window)

| Reading | Response Time |
|---------|--------------|
| 1 | 4 ms |
| 2 | 3 ms |
| 3 | 3 ms |
| **Average** | **3.3 ms** |

### Summary

| Condition | Avg Response Time | Notes |
|-----------|------------------|-------|
| Uncached (MongoDB query) | ~41.7 ms | Includes network + Mongoose + BSON parse |
| Cached (node-cache HIT) | ~3.3 ms | Pure in-process memory read |
| **Speed-up factor** | **~12.6×** | Scales further with larger datasets |

---

## Key Questions / Analysis

### 1. Why must cache be invalidated on every write?
Without invalidation the cache continues serving the **stale snapshot** stored
before the write. A user could create a task, then immediately `GET /tasks` and
not see it — or see a deleted task — until the TTL expires (60 s). Correctness
always takes priority over performance; invalidation ensures the next read always
reflects the latest DB state.

### 2. What is a reasonable TTL and what trade-off does it represent?
60 seconds is reasonable for a task-management app where:
- Data changes infrequently (task CRUD, not real-time feeds).
- We always invalidate on writes anyway, so stale data only occurs if two
  independent processes modify the DB (bypassing this API).

**Trade-off:** shorter TTL → fresher data, more DB hits (lower cache hit rate);
longer TTL → better performance but higher staleness risk if writes bypass the
API (e.g., direct DB access during development).

### 3. Why is node-cache unsuitable for multi-instance deployment?
`node-cache` stores data in **process-local memory**. If the app runs on two
servers (load-balanced):
- Server A caches `all_tasks:user1`.
- Server B receives a POST, invalidates its own cache — but Server A's cache is
  **not notified**.
- The next GET routed to Server A returns stale data.

**Solution:** Replace `node-cache` with a **Redis** instance shared by all
server processes (sets up the Unit 4 scaling discussion).

---

## Known Limitations (Lab Journal Observations)

- Cache is wiped on every server restart (in-process memory).
- Not suitable for horizontally scaled deployments (see above).
- With a very small dataset (~5 tasks) the speed difference may be < 10 ms;
  add more documents to make the benefit visible.

---

## How to Test

```bash
# 1. Start backend
cd C:\PROJECT
npm start

# 2. Register / login via Postman — copy the token

# 3. First GET (MISS — hits MongoDB)
GET http://localhost:5000/tasks
Authorization: Bearer <token>
# Check X-Response-Time header in response

# 4. Second GET within 60 s (HIT — from cache)
# Response includes "fromCache": true

# 5. Check stats
GET http://localhost:5000/tasks/debug/cache
Authorization: Bearer <token>

# 6. Create a task (invalidates cache)
POST http://localhost:5000/tasks
# Next GET will be a MISS again
```
