import { Card, CardContent } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import Image from "next/image"

const experiences = [
  {
    title: "Software Engineer (Contract)",
    company: "Domain Driven Solutions - Remote",
    period: "Jan. 2025 - Present",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Domain%20Driven%20Solutions.jpg-R79hSXMD3i811tKDTkkWIHyL4WIYFG.jpeg",
    responsibilities: [
      "Currently participating in the Domain Driven Solutions internship program",
      "Developing software solutions in a professional environment",
      "Collaborating with team members on various projects",
      "Gaining hands-on experience with industry-standard tools and practices",
    ],
  },
  {
    title: "Warehouse Manager",
    company: "My Bambino - Milford, DE",
    period: "Nov. 2018 - Present",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MB-Logo-2-40-KwDYnpN5JKZdMxpCkkCunXOcp8I7eI.png",
    responsibilities: [
      "Amazon and website optimization",
      "Assured orders were accurate and met high standards",
      "Engaged with customers via email",
      "Managed orders in various stages of preparation to be shipped via FedEx/USPS to customers",
    ],
  },
]

export function Experience() {
  return (
    <section className="py-20 md:py-24 bg-gray-50" id="experience">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-16">
            <Briefcase className="w-10 h-10 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Work Experience</h2>
          </div>
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-primary font-medium">{exp.company}</p>
                    <p className="text-gray-600">{exp.period}</p>
                  </div>
                  {exp.logo && (
                    <Image
                      src={exp.logo || "/placeholder.svg"}
                      alt={`${exp.company} Logo`}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  )}
                </div>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

