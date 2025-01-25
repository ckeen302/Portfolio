"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Send } from "lucide-react"

export function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Message Sent",
      description: "Thank you for your message. I'll get back to you soon!",
    })
    setName("")
    setEmail("")
    setMessage("")
  }

  return (
    <section className="py-20 md:py-24 bg-gray-50" id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Feel free to reach out for collaborations or just a friendly hello. I'll try my best to get back to you!
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
              <Textarea
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary"
                rows={6}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              <Send className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

