import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

const education = [
  {
    degree: "Associate Degree in Computer Science",
    school: "Delaware Technical Community College",
    period: "Graduation: May 2024",
    details: [
      "Cumulative GPA: 3.8/4.0",
      "President's List (Fall 2023, Spring 2024, Fall 2024)",
      "Relevant Coursework: Computer Science I, II, & III, Systems Programming, Computer Organization",
    ],
  },
  {
    degree: "Bachelor of Science in Computer Science",
    school: "University of Delaware (Planned)",
    period: "Anticipated Start: Fall 2025 | Expected Graduation: May 2027",
    details: [],
  },
]

export function Education() {
  return (
    <section className="py-20 md:py-24 bg-white" id="education">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Education</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            My academic journey in computer science and software development.
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
          {education.map((edu, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <GraduationCap className="mr-3 h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-gray-900">{edu.degree}</h3>
                </div>
                <p className="text-primary font-medium mb-2">{edu.school}</p>
                <p className="text-gray-600 mb-4">{edu.period}</p>
                {edu.details.length > 0 && (
                  <ul className="list-disc pl-5 text-gray-600 space-y-2">
                    {edu.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

