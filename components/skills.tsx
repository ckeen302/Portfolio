import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Layout, PenToolIcon as Tool, Monitor, Cpu } from "lucide-react"

const skills = [
  {
    category: "Languages",
    items: ["JavaScript", "Python", "Java", "C++", "C", "HTML", "CSS"],
    icon: Code,
  },
  {
    category: "Frameworks",
    items: ["React", "Django", "Flask", "PyQt5", "JavaFX"],
    icon: Layout,
  },
  {
    category: "Tools",
    items: ["IntelliJ", "CLion", "PyCharm", "VS Code", "Git"],
    icon: Tool,
  },
  {
    category: "Operating Systems",
    items: ["Windows", "Linux"],
    icon: Monitor,
  },
]

export function Skills() {
  return (
    <section className="py-20 bg-gray-50" id="skills">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-12">
          <Cpu className="w-8 h-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">Technical Skills</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <Card key={skill.category} className="border-primary/10 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <skill.icon className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl text-gray-800">{skill.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-600">{skill.items.join(", ")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

