import { Card, CardContent } from "@/components/ui/card"
import { Briefcase } from "lucide-react"

const experiences = [
  {
    title: "Software Engineer Intern",
    company: "Stellar Career Accelerator - Remote",
    period: "Jan. 2025 - Present",
    responsibilities: [
      "Currently participating in the Stellar Career Accelerator program",
      "Developing software solutions in a professional environment",
      "Collaborating with team members on various projects",
      "Gaining hands-on experience with industry-standard tools and practices",
    ],
  },
  {
    title: "Warehouse Manager",
    company: "My Bambino - Milford, DE",
    period: "Nov. 2018 - Present",
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Work Experience</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            My professional journey has equipped me with valuable skills and experiences.
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Briefcase className="mr-3 h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-gray-900">{exp.title}</h3>
                </div>
                <p className="text-primary font-medium mb-2">{exp.company}</p>
                <p className="text-gray-600 mb-4">{exp.period}</p>
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

