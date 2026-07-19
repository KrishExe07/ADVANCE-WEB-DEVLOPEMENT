import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Contact from './components/Contact.jsx'
import Home from './components/Home.jsx'
import NavBar from './components/NavBar.jsx'
import NotFound from './components/NotFound.jsx'
import Projects from './components/Projects.jsx'
import './App.css'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <div className={`app-shell${isDarkMode ? ' dark-mode' : ''}`}>
      <NavBar isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((current) => !current)} />
      <main className="portfolio-page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
