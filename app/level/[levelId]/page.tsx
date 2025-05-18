import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LevelPage({ params }: { params: { levelId: string } }) {
  const levelId = params.levelId
  const level = cefrLevels.find((level) => level.id === levelId)

  if (!level) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Level not found</h1>
        <Link href="/">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen flex-col py-12">
      <div className="mb-8 flex items-center">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="ml-4 text-3xl font-bold">{level.name}</h1>
      </div>

      <p className="mb-8 text-xl text-muted-foreground">{level.description}</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {level.topics.map((topic, index) => (
          <Card key={index} className="flex flex-col border-2 border-blue-500">
            <CardHeader>
              <CardTitle>{topic}</CardTitle>
              <CardDescription>20 Questions Game</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Learn vocabulary related to {topic.toLowerCase()} through a fun guessing game.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/game/${levelId}/${encodeURIComponent(topic)}`} className="w-full">
                <Button className="w-full">Start Game</Button>
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
