import { useEffect, useState } from 'react'
import About from './components/About.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import NavBar from './components/NavBar.jsx'
import Projects from './components/Projects.jsx'
import Skills from './components/Skills.jsx'
import './App.css'

const skillList = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Git',
  'GitHub',
  'C Programming',
  'Java',
  'MySQL',
]

function App() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const observedSections = ['home', 'about', 'skills', 'projects', 'contact']

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.55 },
    )

    observedSections.forEach((sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <NavBar activeSection={activeSection} onNavigate={handleNavigate} />
      <main className="portfolio-page">
        <Header name="Krish Patel" themeColor="#2563eb" />
        <About />
        <Skills skillList={skillList} />
        <Projects />
        <Footer email="krishpatel@example.com" />
      </main>
    </div>
  )
}

export default App
