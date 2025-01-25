import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Github } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const projects = [
  {
    title: "Math Wizard",
    description:
      "Interactive web application for analyzing and visualizing mathematical expressions with advanced operations, graphing, and LaTeX rendering.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MathWi-wqTDS39nlJHbuMhEP5Jd31mFjQFIyu.png",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "ShadCN", "Newton API", "Desmos API"],
    codeLink: "https://github.com/ckeen302/math-wizard",
    demoLink: "#",
  },
  {
    title: "Music Production Assistant",
    description:
      "Desktop application for visualizing audio waveforms, converting audio formats, and generating chord progressions with MIDI file export capabilities.",
    image: "/placeholder.svg",
    technologies: ["Python", "PyQt5", "Pygame", "FFmpeg"],
    codeLink: "https://github.com/ckeen302/MusicProductionAssistant.git",
    demoLink: "#",
  },
  {
    title: "Ultrasonic Distance Monitor",
    description:
      "Python-based real-time monitoring system with Raspberry Pi & HC-SR04 ultrasonic sensor, featuring a web interface with live data visualization.",
    image: "/placeholder.svg",
    technologies: ["Python", "Flask", "Chart.js", "RPi.GPIO"],
    codeLink: "https://github.com/ckeen302/ultrasonic-distance-monitor",
    demoLink: "#",
  },
]

export function Projects() {
  return (
    <section className="py-20 bg-white" id="projects">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-16">
          <span className="text-primary">&lt;&gt;</span>
          <h2 className="text-4xl font-bold">Projects</h2>
          <span className="text-primary">&lt;/&gt;</span>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="flex space-x-8" style={{ width: "max-content" }}>
            {projects.map((project, index) => (
              <Card key={index} className="w-[400px] flex-shrink-0 overflow-hidden group">
                <div className="relative h-[350px] bg-gray-100">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-3">{project.title}</h3>
                  <p className="text-gray-600 mb-6">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href={project.codeLink}
                      className="inline-flex items-center text-primary hover:text-primary/90 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5 mr-2" />
                      View Code
                    </Link>
                    <Link
                      href={project.demoLink}
                      className="inline-flex items-center text-primary hover:text-primary/90 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Live Demo
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

