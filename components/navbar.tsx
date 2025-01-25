"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed w-full z-10 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className={`text-2xl font-bold ${isScrolled ? "text-gray-900" : "text-white"}`}>
            Caden Keen
          </Link>
          <div className="space-x-1">
            {["Skills", "Experience", "Projects", "Contact"].map((item) => (
              <Button
                key={item}
                variant="ghost"
                asChild
                className={`${
                  isScrolled ? "text-gray-600 hover:text-primary" : "text-white hover:text-white/80"
                } text-lg`}
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector(`#${item.toLowerCase()}`)?.scrollIntoView({
                    behavior: "smooth",
                  })
                }}
              >
                <Link href={`#${item.toLowerCase()}`}>{item}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

