"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Github, Code } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Link from "next/link"
import Image from "next/image"

const projects = [
  {
    title: "Math Wizard",
    description:
      "Interactive web application for analyzing and visualizing mathematical expressions with advanced operations, graphing, and LaTeX rendering.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MathWi-wqTDS39nlJHbuMhEP5Jd31mFjQFIyu.png",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "ShadCN", "Newton API", "Desmos API"],
    codeLink: "https://github.com/ckeen302/MathWizard.git",
    demoLink: "https://v0-newton-ot65ium3hep.vercel.app/",
  },
  {
    title: "Flashy",
    description:
      "AI-powered web application that generates interactive flashcards from lecture notes, making study material creation effortless and efficient.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(651)-Gpuz4GOwJtjyd2DpLB62pc2mBQz6e3.png",
    technologies: ["Python", "Streamlit", "Hugging Face", "PyPDF2", "NLTK", "HTML/CSS"],
    codeLink: "https://github.com/ckeen302/Flashy.git",
  },
  {
    title: "Pokésphere",
    description:
      "Comprehensive Pokémon companion app offering features like team building, Pokédex, quiz mode, region explorer, and more. Built with React, Next.js 13, TypeScript, and Tailwind CSS.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(593)-ztUXlZsuq4zZDm0qYIJPh7okSXzRRn.png",
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Framer Motion",
      "PokéAPI",
      "Vercel AI SDK",
    ],
    codeLink: "https://github.com/ckeen302/PokeSphere",
    demoLink: "https://poke-sphere.vercel.app",
  },
  {
    title: "ChordCraft",
    description:
      "Desktop application for visualizing audio waveforms, converting audio formats, and generating chord progressions with MIDI file export capabilities.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(648)-RKlJA5z8OgNoLf3sgnTpjQK12OdC2N.png",
    technologies: ["Python", "PyQt5", "Pygame", "FFmpeg"],
    codeLink: "https://github.com/ckeen302/MusicProductionAssistant",
  },
  {
    title: "Personal Portfolio",
    description:
      "A responsive and interactive portfolio website showcasing my projects, skills, and experience. Built with modern web technologies and featuring a clean, professional design.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(590)-fWVVsItOnTv93lZXPVppNSS1L3xHVI.png",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "ShadCN UI", "Vercel"],
    codeLink: "https://github.com/ckeen302/Portfolio.git",
    demoLink: "https://cadenkeen.vercel.app",
  },
  {
    title: "Monster Hop",
    description:
      "A 2D platformer game inspired by the popular mobile game Doodle Jump. Features jumping mechanics, platform collisions, animated characters and obstacles, score tracking, and difficulty scaling for an engaging user experience.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(597)-6eG73MpzM9erbhGJAv2GgWqHhfifaj.png",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "use-sound"],
    codeLink: "https://github.com/ckeen302/MonsterHop.git",
    demoLink: "https://9ayb02joouw7frx2.vercel.app",
  },
  {
    title: "Ultrasonic Distance Monitoring System",
    description:
      "Developed a Python-based real-time monitoring system with Raspberry Pi & HC-SR04 ultrasonic sensor. Designed a web interface with live data visualization.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(633)-C2CQteo7b4ztgSrTsPs4p7iGSYCJp4.png",
    technologies: ["Python", "Flask", "Chart.js", "RPi.GPIO", "HTML/CSS"],
    codeLink: "https://github.com/ckeen302/ultrasonic-distance-monitor",
  },
  {
    title: "Machine Tracking Application",
    description:
      "Developed an application to monitor and manage equipment usage and maintenance schedules. Integrated SQLite for efficient data storage and retrieval of machine maintenance records.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(645)-BBGUK6YdX43ssNOWNwBsxiR5tK1UV5.png",
    technologies: ["Java", "JavaFX", "Scene Builder", "SQLite"],
    codeLink: "https://github.com/ckeen302/MachineTrackerApp",
  },
]

export function Projects() {
  return (
    <section className="py-20 bg-white" id="projects">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-16">
          <Code className="w-10 h-10 text-primary" />
          <h2 className="text-4xl font-bold">Projects</h2>
        </div>

        <div className="max-w-[800px] mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {projects.map((project, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <div className="relative h-0 pb-[56.25%] bg-gray-100 overflow-hidden">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-semibold mb-3 text-center">{project.title}</h3>
                      <p className="text-gray-600 mb-6">{project.description}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.map((tech, idx) => (
                          <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                            {tech.includes("API") ? tech.split(" ")[0] : tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Link
                          href={project.codeLink}
                          className="inline-flex items-center text-primary hover:text-primary/90 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="h-5 w-5 mr-2" />
                          View Code
                        </Link>
                        {project.demoLink && (
                          <Link
                            href={project.demoLink}
                            className="inline-flex items-center text-primary hover:text-primary/90 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-5 w-5 mr-2" />
                            Live Site
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  )
}

