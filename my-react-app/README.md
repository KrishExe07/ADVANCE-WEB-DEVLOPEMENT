# Task Management App — Practical 8: Performance Optimization & Lazy Loading

**Course:** ITUE301 — Advanced Web Development Frameworks  
**Student:** Krish Patel · Enrollment No. 24IT068 · CSPIT, CHARUSAT

---

## 🎯 Practical 8 Objective

Optimize the React frontend by implementing **route-based code splitting** using `React.lazy()` and `Suspense`, reducing the initial JavaScript bundle size and improving perceived performance.

---

## ⚡ Before vs After — Performance Comparison

### Bundle Output

| Metric | Before (Practical 6/7) | After (Practical 8) |
|--------|------------------------|---------------------|
| JS chunks generated | **1 file** | **9 files** |
| Initial bundle (gzip) | **80.91 kB** | **75.64 kB** |
| Initial bundle (raw) | **258.14 kB** | **236.34 kB** |
| Projects chunk | — | 2.10 kB |
| Contact chunk | — | 1.73 kB |
| TaskManager chunk | — | 12.35 kB |
| Home chunk | — | 3.34 kB |
| StatsChart chunk (supplementary) | — | 1.64 kB |
| **Initial JS savings** | — | **~21.8 kB raw / ~5.3 kB gzip** |

> **Key insight:** Total JS downloaded over a full session is the same — but lazy loading defers non-essential chunks until they're actually needed. The browser parses ~21.8 kB less JS on the initial page load, leading to faster Time-to-Interactive (TTI).

### Code Splitting Architecture

```
BEFORE (single bundle):
  index-BJW_NeCr.js ──────────────► 258.14 kB — ALL components loaded upfront
                                     Home, Projects, Contact, TaskManager,
                                     Login, Register, NotFound — everything bundled

AFTER (code-split):
  index-BKU0zhJ3.js ─────────────► 236.34 kB  App shell, NavBar, PageLoader
  Home-B-svFPO9.js ──────────────►   3.34 kB  loaded only when / is visited
  Login-NBrv97F4.js ─────────────►   1.68 kB  loaded only when /login visited
  Register-DTqBMe_3.js ──────────►   1.77 kB  loaded only when /register visited
  Projects-D5Z_jTJR.js ──────────►   2.10 kB  loaded only when /projects visited
  Contact-CXFdFAcl.js ───────────►   1.73 kB  loaded only when /contact visited
  TaskManager-DsTXhAPR.js ───────►  12.35 kB  loaded only when /tasks-ui visited
  StatsChart-eHyDnMEP.js ────────►   1.64 kB  loaded only when TaskManager renders tasks
  NotFound-9k6QdIHD.js ──────────►   0.50 kB  loaded only when unknown route visited
```

---

## 🚀 Routes

| Path | Component | Lazy? | Description |
|------|-----------|-------|-------------|
| `/` | `Home` | ✅ Yes | Portfolio landing page |
| `/login` | `Login` | ✅ Yes | JWT login form |
| `/register` | `Register` | ✅ Yes | Registration form |
| `/projects` | `Projects` | ✅ Yes | GitHub repos via API |
| `/contact` | `Contact` | ✅ Yes | Contact form |
| `/tasks-ui` | `TaskManager` | ✅ Yes | Full-stack CRUD task manager |
| `*` | `NotFound` | ✅ Yes | 404 page |

---

## 🛠️ Lazy Loading Implementation

### 1. Route-level code splitting — `App.jsx`

```jsx
import { lazy, Suspense } from 'react'
import PageLoader from './components/PageLoader.jsx'

// Each lazy() call creates a separate JS chunk
const Home        = lazy(() => import('./components/Home.jsx'))
const Projects    = lazy(() => import('./components/Projects.jsx'))
const Contact     = lazy(() => import('./components/Contact.jsx'))
const TaskManager = lazy(() => import('./components/TaskManager.jsx'))
const Login       = lazy(() => import('./components/Login.jsx'))
const Register    = lazy(() => import('./components/Register.jsx'))
const NotFound    = lazy(() => import('./components/NotFound.jsx'))

// Suspense wraps the Routes block — provides fallback while chunk loads
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/"         element={<Home />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/contact"  element={<Contact />} />
    {/* ... other routes */}
  </Routes>
</Suspense>
```

### 2. Supplementary: Component-level lazy loading — `TaskManager.jsx`

```jsx
// StatsChart is lazy-loaded independently within the TaskManager page
const StatsChart = lazy(() => import('./StatsChart'))

// Inner Suspense — only the chart area shows a fallback if its chunk is slow
{tasks.length > 0 && (
  <Suspense fallback={<div className="stats-chart-loader">Loading chart…</div>}>
    <StatsChart tasks={tasks} />
  </Suspense>
)}
```

### 3. Polished `PageLoader` fallback — anti-flicker delay

The `PageLoader` component uses a **300 ms CSS `animation-delay`** so it only becomes visible if the chunk takes longer than 300 ms to download. On fast connections, the loading state is never seen (no flicker).

```css
.page-loader {
  opacity: 0;
  animation: fadeInLoader 0.4s ease forwards;
  animation-delay: 0.3s; /* Only visible after 300 ms — prevents flicker */
}
```

---

## 🔬 How to Observe Lazy Loading

1. Run `npm run build && npm run preview`
2. Open DevTools → **Network** tab → filter by **JS**
3. Throttle to **Slow 3G** (DevTools Network → throttle dropdown)
4. Navigate to `/projects` → observe `Projects-*.js` chunk downloading + `PageLoader` skeleton
5. Navigate to `/tasks-ui` → observe `TaskManager-*.js` and `StatsChart-*.js` chunks

See [`docs/performance/README.md`](./docs/performance/README.md) for full screenshot guide and evidence collection instructions.

---

## 📦 Getting Started

```bash
# Frontend
cd my-react-app
npm install
npm run dev

# Backend (in a separate terminal)
cd task-manager-api
npm install
npm start
```

Open `http://localhost:5173` — backend runs on `http://localhost:5000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (shows chunk sizes) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📁 Project Structure

```
src/
├── App.jsx              # Routes + lazy imports + Suspense boundary  ← Practical 8
├── App.css              # All styles incl. PageLoader & StatsChart   ← Practical 8
├── api.js               # Centralized API layer (Practical 6)
├── main.jsx             # BrowserRouter setup
├── hooks/
│   └── useToast.js      # Toast notification hook (Practical 6)
└── components/
    ├── PageLoader.jsx   # Suspense fallback — skeleton UI            ← NEW Practical 8
    ├── StatsChart.jsx   # Lazy-loaded chart (supplementary P8)       ← NEW Practical 8
    ├── TaskManager.jsx  # Full task CRUD dashboard (P6) + StatsChart ← MODIFIED P8
    ├── NavBar.jsx       # Navigation (static — always loaded)
    ├── Home.jsx         # / route (lazy)
    ├── Projects.jsx     # /projects route (lazy)
    ├── Contact.jsx      # /contact route (lazy)
    ├── Login.jsx        # /login route (lazy)
    ├── Register.jsx     # /register route (lazy)
    ├── NotFound.jsx     # 404 route (lazy)
    ├── TaskFormModal.jsx
    ├── Toast.jsx
    ├── Spinner.jsx
    └── ErrorMessage.jsx

docs/
└── performance/
    └── README.md        # Screenshot guide & metrics table           ← NEW Practical 8
```

---

## 📚 Practical History

| Practical | Focus | Key Features |
|-----------|-------|-------------|
| P1 | React Basics | Component structure, JSX |
| P2 | Multi-page Routing | React Router, NavBar, Dark mode |
| P3 | State & Hooks | useState, controlled forms |
| P4 | API Integration | GitHub API, fetch, error handling |
| P5 | Lifecycle & Effects | useEffect, cleanup |
| P6 | Full-stack | MongoDB, Express API, JWT auth, CRUD |
| P7 | Authentication | JWT login/register, protected routes |
| **P8** | **Performance** | **React.lazy(), Suspense, code splitting** |

---

## 🎓 Student Details

- **Name:** Krish Patel  
- **Enrollment No.:** 24IT068  
- **College:** CSPIT, CHARUSAT  
- **Course:** ITUE301 — Advanced Web Development Frameworks
