import About from './About.jsx'
import Header from './Header.jsx'
import Skills from './Skills.jsx'

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

function Home() {
  return (
    <>
      <Header name="Krish Patel" themeColor="#2563eb" />
      <About />
      <Skills skillList={skillList} />
    </>
  )
}

export default Home
