import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

function NavBar({ isDarkMode, onToggleTheme }) {
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
      </div>
    </header>
  )
}

export default NavBar
