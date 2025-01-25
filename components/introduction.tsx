import { Code, Music } from "lucide-react"
import Image from "next/image"

export function Introduction() {
  return (
    <section className="py-20 bg-white" id="about">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">About Me</h2>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-8">
            I'm a Computer Science student from Delaware with a passion for full stack development, AI, and machine
            learning. In my free time, I enjoy producing music using FL Studio, blending my technical skills with
            creativity.
          </p>
          <div className="flex justify-center items-center space-x-16">
            <div className="flex flex-col items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/de-QulbtLqO05XbFtBhnZXm9OfVeWpqPn.png"
                alt="Delaware"
                width={48}
                height={48}
                className="[filter:invert(47%)_sepia(98%)_saturate(1654%)_hue-rotate(232deg)_brightness(89%)_contrast(91%)]"
              />
            </div>
            <div className="flex flex-col items-center">
              <Code className="w-12 h-12 text-primary" />
            </div>
            <div className="flex flex-col items-center">
              <Music className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

