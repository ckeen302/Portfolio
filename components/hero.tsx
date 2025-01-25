import { Mail, Github, Linkedin, FileText } from "lucide-react"
import Image from "next/image"
import { HeroButtons } from "./hero-buttons"

export function Hero() {
  return (
    <section className="min-h-screen bg-primary flex flex-col items-center justify-center text-center">
      <div className="container mx-auto px-4 pt-16 space-y-12">
        <div className="w-[200px] h-[200px] mx-auto relative">
          <div className="absolute inset-0 bg-white rounded-full overflow-hidden">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avatar-64bit-removebg-preview-MITXoZ5w0qMko9Cob3iLXvByCt4W6u.png"
              alt="Caden Keen"
              width={200}
              height={200}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl font-bold text-white">Hi, I'm Caden Keen</h1>
          <p className="text-2xl text-white/90 max-w-[600px] mx-auto leading-relaxed">
            A passionate Computer Science student crafting innovative solutions through code. Seeking internship and
            full-time job opportunities.
          </p>
        </div>

        <div className="flex items-center justify-center gap-10 text-white">
          <a
            href="https://github.com/ckeen302"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80 transition-colors"
          >
            <Github className="h-8 w-8" />
          </a>
          <a
            href="https://www.linkedin.com/in/caden-keen"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80 transition-colors"
          >
            <Linkedin className="h-8 w-8" />
          </a>
          <a href="mailto:cadenkeen@gmail.com" className="hover:text-white/80 transition-colors">
            <Mail className="h-8 w-8" />
          </a>
          <a
            href="/caden-keen-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80 transition-colors"
          >
            <FileText className="h-8 w-8" />
          </a>
        </div>

        <HeroButtons />
      </div>
    </section>
  )
}

