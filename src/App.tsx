import { useReveal } from './hooks/useReveal'
import { useSiteBootstrap } from './hooks/useAnalytics'
import { Navbar } from './components/ui/Navbar'
import { Hero } from './components/Hero'
import { About } from './components/sections/About'
import { Experience } from './components/sections/Experience'
import { RestaurantTech } from './components/sections/RestaurantTech'
import { Projects } from './components/sections/Projects'
import { AIWorkflow } from './components/sections/AIWorkflow'
import { TagHawk } from './components/sections/TagHawk'
import { Architecture } from './components/sections/Architecture'
import { Skills } from './components/sections/Skills'
import { Notes } from './components/sections/Notes'
import { Guestbook } from './components/sections/Guestbook'
import { Contact } from './components/sections/Contact'
import { Footer } from './components/sections/Footer'
import { Terminal } from './components/Terminal'

export default function App() {
  useReveal()
  useSiteBootstrap()
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <RestaurantTech />
        <Projects />
        <TagHawk />
        <Architecture />
        <Skills />
        <AIWorkflow />
        <Notes />
        <Guestbook />
        <Contact />
      </main>
      <Footer />
      <Terminal />
    </>
  )
}
