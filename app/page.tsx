import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-12">
      {/* Welcome Box with Korean Text */}
      <div className="mb-12 w-full max-w-[980px] rounded-lg border-2 border-blue-500 bg-primary/5 p-6 text-center shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-primary md:text-2xl">어휘 학습 프로그램</h2>
        <p className="text-md leading-relaxed text-muted-foreground md:text-lg">
          학생의 어휘를 진단하고 주제별 목표 어휘를 스무고개 방식으로 재미있게 학습할 수 있게해주는 어휘 학습 프로그램
        </p>
      </div>

      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Learn English Vocabulary
          <br />
          <span className="text-primary">20 Questions Style</span>
        </h1>
        <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
          Improve your English vocabulary by playing a 20 Questions style game organized by CEFR topics.
        </p>
      </div>
      <div className="mt-12 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cefrLevels.map((level) => (
          <Card key={level.id} className="flex flex-col border-2 border-blue-500">
            <CardHeader>
              <CardTitle>{level.name}</CardTitle>
              <CardDescription>{level.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">{level.topics.length} topics available</p>
            </CardContent>
            <CardFooter>
              <Link href={`/level/${level.id}`} className="w-full">
                <Button className="w-full">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

const cefrLevels = [
  {
    id: "a1",
    name: "A1 - Beginner",
    description: "Basic vocabulary for everyday situations",
    topics: ["Personal Information", "Family", "Daily Routines", "Food & Drink", "Shopping"],
  },
  {
    id: "a2",
    name: "A2 - Elementary",
    description: "Simple communication in familiar contexts",
    topics: ["Travel", "Hobbies", "Weather", "Work", "Health"],
  },
  {
    id: "b1",
    name: "B1 - Intermediate",
    description: "Dealing with most situations while traveling",
    topics: ["Education", "Environment", "Media", "Technology", "Culture"],
  },
  {
    id: "b2",
    name: "B2 - Upper Intermediate",
    description: "Express yourself on a range of topics",
    topics: ["Business", "Current Affairs", "Arts", "Science", "Social Issues"],
  },
  {
    id: "c1",
    name: "C1 - Advanced",
    description: "Express ideas fluently and spontaneously",
    topics: ["Academic Subjects", "Professional Terms", "Abstract Concepts", "Global Issues", "Literature"],
  },
  {
    id: "c2",
    name: "C2 - Proficiency",
    description: "Near-native level of expression",
    topics: ["Specialized Fields", "Idiomatic Expressions", "Cultural Nuances", "Philosophical Concepts", "Research"],
  },
]
