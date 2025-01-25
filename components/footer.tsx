import { Github, Linkedin, Mail, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary py-16 text-center text-white">
      <div className="container mx-auto px-4 space-y-8">
        <h2 className="text-4xl font-bold">Let's Connect!</h2>

        <p className="text-xl text-white/90 max-w-[600px] mx-auto">
          I'm always excited to discuss new opportunities and collaborate on innovative projects.
        </p>

        <div className="flex items-center justify-center gap-8">
          <a
            href="https://github.com/ckeen302"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80 transition-colors"
          >
            <Github className="h-6 w-6" />
          </a>
          <a
            href="https://www.linkedin.com/in/caden-keen"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80 transition-colors"
          >
            <Linkedin className="h-6 w-6" />
          </a>
          <a href="mailto:cadenkeen@gmail.com" className="hover:text-white/80 transition-colors">
            <Mail className="h-6 w-6" />
          </a>
          <a
            href="/caden-keen-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80 transition-colors"
          >
            <FileText className="h-6 w-6" />
          </a>
        </div>

        <div>
          <Button
            asChild
            className="bg-transparent text-white border-2 border-white hover:bg-white/10 text-lg px-8 py-2 h-auto"
          >
            <Link href="#contact">Get in Touch</Link>
          </Button>
        </div>

        <p className="text-sm text-white/80">© {new Date().getFullYear()} Caden Keen. All rights reserved.</p>
      </div>
    </footer>
  )
}

