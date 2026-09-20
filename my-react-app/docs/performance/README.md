# Performance Optimization — Screenshot & Evidence Guide
## Practical 8: ITUE301 — Krish Patel (24IT068)

This folder stores before/after performance evidence required by the rubric.

---

## 📸 Screenshots to Capture

### 1. Before Optimization — Network Tab (REQUIRED)
- Open DevTools → **Network** tab → reload app (baseline, before lazy loading)
- Filter by **JS** to see only JavaScript files
- Screenshot showing **one large `index-*.js`** bundle (~258 kB)
- Save as: `docs/performance/before-network.png`

### 2. After Optimization — Network Tab (REQUIRED)
- After applying lazy loading, open DevTools → **Network** tab
- Navigate to `/`, then `/projects`, then `/contact`, then `/tasks-ui`
- Screenshot showing **multiple small chunk files** loading on demand
- Save as: `docs/performance/after-network.png`

### 3. Vite Build Output — Before & After (REQUIRED)
- Terminal output of `npm run build` **before** lazy loading
- Terminal output of `npm run build` **after** lazy loading
- Screenshot or paste the text — shows chunk file sizes
- Save as: `docs/performance/before-build.png` and `docs/performance/after-build.png`

### 4. Fallback UI — Slow 3G Throttle (REQUIRED)
- DevTools → Network → throttle to **Slow 3G**
- Navigate to `/projects` or `/contact` — the `PageLoader` skeleton should appear
- Screenshot the fallback UI while the chunk is loading
- Save as: `docs/performance/fallback-slow3g.png`

### 5. StatsChart Lazy Chunk — Network Tab (Supplementary)
- Navigate to `/tasks-ui` with Network tab open
- Look for a small `StatsChart-*.js` chunk being downloaded separately
- Screenshot showing the chart chunk loading independently
- Save as: `docs/performance/stats-chart-chunk.png`

---

## 📊 Recorded Metrics Table

| Metric | Before (Practical 6/7) | After (Practical 8) |
|--------|----------------------|---------------------|
| Build output chunks | **1 JS file** | **9 JS chunk files** |
| Initial bundle size | **258.14 kB** (80.91 kB gzip) | **236.34 kB** (75.64 kB gzip) |
| NotFound chunk | — | **0.50 kB** (0.29 kB gzip) |
| Login chunk | — | **1.68 kB** (0.75 kB gzip) |
| Contact chunk | — | **1.73 kB** (0.71 kB gzip) |
| Register chunk | — | **1.77 kB** (0.75 kB gzip) |
| Projects chunk | — | **2.10 kB** (1.01 kB gzip) |
| Home chunk | — | **3.34 kB** (0.93 kB gzip) |
| TaskManager chunk | — | **12.35 kB** (3.97 kB gzip) |
| StatsChart chunk (supplementary) | — | **1.64 kB** (0.76 kB gzip) |
| Initial JS savings | — | **~21.8 kB** less on first load |

---

## 🔍 How to Use Network Throttling

1. Open Chrome DevTools → **Network** tab
2. Click the throttle dropdown (shows "No throttling" by default)
3. Select **Slow 3G** (download: 400 Kbps, upload: 400 Kbps, latency: 2000 ms)
4. Hard reload the page (`Ctrl + Shift + R`)
5. Navigate between routes to observe:
   - The `PageLoader` skeleton appears for ~1–2 seconds
   - A new `.js` chunk appears in the Network tab per route

---

## 🏗️ Code Splitting Architecture

```
Before (single bundle):
  index-BJW_NeCr.js ──────────────► All components loaded upfront
                                     Home, Projects, Contact, TaskManager,
                                     Login, Register, NotFound — all in ONE file

After (code-split):
  index-[hash].js ──► App shell, NavBar, PageLoader (always loaded)
  Home-[hash].js ────► loaded only when / is visited
  Login-[hash].js ───► loaded only when /login is visited
  Register-[hash].js ► loaded only when /register is visited
  Projects-[hash].js ► loaded only when /projects is visited
  Contact-[hash].js ─► loaded only when /contact is visited
  TaskManager-[hash].js → loaded only when /tasks-ui is visited
  StatsChart-[hash].js  → loaded only when TaskManager renders with tasks
  NotFound-[hash].js ──► loaded only when an unknown route is visited
```

---

## 🔑 Key Analysis Answers (for viva)

**Q: What is the difference between the initial bundle and a lazy-loaded chunk?**  
A: The initial bundle (`index.js`) is downloaded when the user first loads the app. Lazy-loaded chunks are separate JS files downloaded only when the user navigates to a specific route that needs them. The browser only fetches a chunk when React encounters a `lazy()` component that hasn't been loaded yet.

**Q: Why does lazy loading improve perceived performance even though the total JS is the same?**  
A: Perceived performance improves because the browser can parse and execute a smaller initial bundle. Less JS to parse = faster Time-to-Interactive (TTI). Users see the Home page faster because Projects, Contact, and TaskManager code is not parsed until needed. Total bytes downloaded over a full session is the same, but it's spread over time — when the user is already interacting with the app.

**Q: When would lazy loading NOT be worth the complexity?**  
A: In a very small app (<50 kB total JS), the overhead of network round trips to fetch additional chunks may outweigh the benefit. Also, if all routes are visited on every session, lazy loading adds extra latency without any savings.
