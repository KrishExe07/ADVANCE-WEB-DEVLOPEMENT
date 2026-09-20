import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks-ui', label: 'Tasks' },
  { to: '/contact', label: 'Contact' },
]

function NavBar({ isDarkMode, onToggleTheme }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthChange = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('unauthorized', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('unauthorized', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__mark">KP</span>
        <div>
          <p>Student Portfolio</p>
          <strong>Krish Patel</strong>
        </div>
      </div>

      <div className="topbar__actions">
        <nav className="topbar__nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="theme-toggle" onClick={onToggleTheme}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {isAuthenticated ? (
          <button type="button" onClick={handleLogout} className="tm-btn tm-btn--ghost tm-btn--sm" style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        ) : (
          <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
            <NavLink to="/login" className="tm-btn tm-btn--ghost tm-btn--sm">Login</NavLink>
            <NavLink to="/register" className="tm-btn tm-btn--primary tm-btn--sm">Register</NavLink>
          </div>
        )}
      </div>
    </header>
  )
}

export default NavBar
