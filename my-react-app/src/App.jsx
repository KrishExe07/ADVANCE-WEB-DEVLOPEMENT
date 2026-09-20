/**
 * App.jsx
 * Practical 8: Performance Optimization & Lazy Loading — ITUE301
 *
 * Changes from Practical 6/7:
 *   - All route-level components converted from static imports to React.lazy()
 *     dynamic imports, enabling Vite to emit a separate JS chunk per route.
 *   - <Routes> wrapped in <Suspense fallback={<PageLoader />}> so a polished
 *     skeleton UI is shown while a chunk is downloading.
 *   - NavBar and PageLoader are kept as static imports because:
 *       NavBar  — always rendered on every route (no benefit to splitting it)
 *       PageLoader — is the fallback itself; it must be ready before chunks load
 *   - No behaviour changes — all routing logic is identical to Practical 6/7.
 *
 * Code-splitting architecture (after this change):
 *   main.bundle.js   → App shell, NavBar, PageLoader (always loaded)
 *   Home.chunk.js    → loaded only when / is visited
 *   Login.chunk.js   → loaded only when /login is visited
 *   Register.chunk.js→ loaded only when /register is visited
 *   Projects.chunk.js→ loaded only when /projects is visited
 *   Contact.chunk.js → loaded only when /contact is visited
 *   TaskManager.chunk.js → loaded only when /tasks-ui is visited
 *   NotFound.chunk.js    → loaded only when an unknown route is visited
 */
import { lazy, Suspense, useState, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'

// ── Static imports (always needed) ────────────────────────────────────────────
import NavBar from './components/NavBar.jsx'
import PageLoader from './components/PageLoader.jsx'
import './App.css'

// ── Lazy route imports (each becomes its own JS chunk) ────────────────────────
// IMPORTANT: React.lazy() only works with default exports.
// All components below use `export default` — see their respective files.
const Home        = lazy(() => import('./components/Home.jsx'))
const Login       = lazy(() => import('./components/Login.jsx'))
const Register    = lazy(() => import('./components/Register.jsx'))
const Projects    = lazy(() => import('./components/Projects.jsx'))
const Contact     = lazy(() => import('./components/Contact.jsx'))
const TaskManager = lazy(() => import('./components/TaskManager.jsx'))
const NotFound    = lazy(() => import('./components/NotFound.jsx'))

// ── App component ─────────────────────────────────────────────────────────────
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()

  // Redirect to /login when any API call fires the 'unauthorized' event
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('token')
      navigate('/login')
    }
    window.addEventListener('unauthorized', handleUnauthorized)
    return () => window.removeEventListener('unauthorized', handleUnauthorized)
  }, [navigate])

  return (
    <div className={`app-shell${isDarkMode ? ' dark-mode' : ''}`}>
      <NavBar isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((current) => !current)} />

      <main className="portfolio-page">
        {/*
          Suspense boundary — wraps all routes so the PageLoader fallback is
          shown while any lazy route chunk is being fetched.

          Practical 8 requirement: "Wrap the Routes block with Suspense and
          a fallback" (Lab Step 4).  PageLoader provides a meaningful animated
          skeleton UI instead of a plain text fallback.
        */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/projects"  element={<Projects />} />
            <Route path="/contact"   element={<Contact />} />
            <Route path="/tasks-ui"  element={<TaskManager />} />
            <Route path="*"          element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
