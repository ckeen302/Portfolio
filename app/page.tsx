import { Hero } from "@/components/hero"
import { Introduction } from "@/components/introduction"
import { Skills } from "@/components/skills"
import { Projects } from "@/components/projects"
import { Experience } from "@/components/experience"
import { Education } from "@/components/education"
import { Contact } from "@/components/contact"

export default function Home() {
  return (
    <main>
      <Hero />
      <Introduction />
      <Skills />
      <Projects />
      <Experience />
      <Education />
      <Contact />
    </main>
  )
}

