"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroButtons() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault()
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        asChild
        className="bg-transparent text-white border-2 border-white hover:bg-white/10 text-lg px-8 py-2 h-auto"
      >
        <Link href="#projects" onClick={(e) => handleScroll(e, "#projects")}>
          View Projects
        </Link>
      </Button>
      <Button asChild className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-2 h-auto">
        <Link href="#contact" onClick={(e) => handleScroll(e, "#contact")}>
          Contact Me
        </Link>
      </Button>
    </div>
  )
}

