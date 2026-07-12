const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

function NavBar({ activeSection, onNavigate }) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__mark">KP</span>
        <div>
          <p>Student Portfolio</p>
          <strong>Krish Patel</strong>
        </div>
      </div>

      <nav className="topbar__nav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={activeSection === item.id ? 'is-active' : ''}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(item.id)
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

export default NavBar