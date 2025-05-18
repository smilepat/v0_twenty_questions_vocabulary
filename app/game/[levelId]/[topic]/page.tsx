"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, HelpCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { GameVisualizer } from "@/components/game-visualizer"

export default function GamePage({ params }: { params: { levelId: string; topic: string } }) {
  const router = useRouter()
  const levelId = params.levelId
  const topic = decodeURIComponent(params.topic)

  const [currentWord, setCurrentWord] = useState("")
  const [guess, setGuess] = useState("")
  const [questionsLeft, setQuestionsLeft] = useState(20)
  const [hints, setHints] = useState<string[]>([])
  const [revealedLetters, setRevealedLetters] = useState<number[]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [completedWords, setCompletedWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [hintIndex, setHintIndex] = useState(0)

  // Get vocabulary for this level and topic
  const vocabulary = getVocabularyForTopic(levelId, topic)

  useEffect(() => {
    if (vocabulary.length > 0) {
      startNewWord(vocabulary[currentWordIndex])
    }
  }, [currentWordIndex])

  const startNewWord = (word: string) => {
    setCurrentWord(word)
    setGuess("")
    setQuestionsLeft(20)
    setHints([])
    setRevealedLetters([])
    setGameStatus("playing")
    setHintIndex(0)

    // Add first hint - dictionary definition
    const firstHint = getLearnerDefinition(word)
    setHints([firstHint])
  }

  const checkGuess = () => {
    if (guess.toLowerCase() === currentWord.toLowerCase()) {
      setGameStatus("won")
      setCompletedWords([...completedWords, currentWord])

      // Move to next word after delay
      if (currentWordIndex < vocabulary.length - 1) {
        setTimeout(() => {
          setCurrentWordIndex(currentWordIndex + 1)
        }, 2000)
      }
    } else {
      setQuestionsLeft(questionsLeft - 1)

      if (questionsLeft <= 1) {
        setGameStatus("lost")
      } else {
        // Provide next hint in sequence
        provideNextSequentialHint()
      }

      setGuess("")
    }
  }

  const provideNextSequentialHint = () => {
    // Increment hint index
    const nextHintIndex = hintIndex + 1
    setHintIndex(nextHintIndex)

    let newHint = ""

    // Provide hints in a specific sequence
    switch (nextHintIndex) {
      case 1: // Second hint - First letter
        newHint = `This word starts with "${currentWord[0]}".`
        break

      case 2: // Third hint - Topic relation
        newHint = `This word is related to "${topic}".`
        break

      case 3: // Fourth hint - Semantic relationship
        newHint = `This word is ${Math.random() > 0.5 ? "similar to" : "related to"} "${getSynonym(currentWord)}".`
        break

      case 4: // Fifth hint - Context sentence with blank
        const contextSentence = getContextSentence(currentWord)
        const blankSentence = contextSentence.replace(new RegExp(currentWord, "i"), "______")
        newHint = `Context: "${blankSentence}"`
        break

      case 5: // Sixth hint - Reveal one more letter
        const unrevealedLetters = Array.from({ length: currentWord.length }, (_, i) => i).filter(
          (i) => !revealedLetters.includes(i),
        )

        if (unrevealedLetters.length > 0) {
          const indexToReveal = unrevealedLetters[0]
          setRevealedLetters([...revealedLetters, indexToReveal])
          newHint = `I've revealed another letter for you: position ${indexToReveal + 1} is "${currentWord[indexToReveal]}".`
        } else {
          newHint = `All letters have been revealed.`
        }
        break

      case 6: // Seventh hint - Reveal another letter
        const stillUnrevealedLetters = Array.from({ length: currentWord.length }, (_, i) => i).filter(
          (i) => !revealedLetters.includes(i),
        )

        if (stillUnrevealedLetters.length > 0) {
          const indexToReveal = stillUnrevealedLetters[0]
          setRevealedLetters([...revealedLetters, indexToReveal])
          newHint = `I've revealed another letter for you: position ${indexToReveal + 1} is "${currentWord[indexToReveal]}".`
        } else {
          newHint = `All letters have been revealed.`
        }
        break

      case 7: // Eighth hint - Give the answer
        newHint = `The word is "${currentWord}".`
        break

      default:
        // If we've gone through all hints, just reveal the word
        newHint = `The word is "${currentWord}".`
    }

    setHints([...hints, newHint])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && guess.trim() !== "") {
      checkGuess()
    }
  }

  const displayWord = () => {
    return currentWord
      .split("")
      .map((letter, index) => {
        if (revealedLetters.includes(index) || gameStatus !== "playing") {
          return letter
        } else {
          return "_"
        }
      })
      .join(" ")
  }

  const provideHintButtonClick = () => {
    if (gameStatus === "playing") {
      provideNextSequentialHint()
    }
  }

  return (
    <div className="container flex min-h-screen flex-col py-12">
      <div className="mb-8 flex items-center">
        <Link href={`/level/${levelId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Button>
        </Link>
        <h1 className="ml-4 text-3xl font-bold">{topic}</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle>20 Questions Game</CardTitle>
              <CardDescription>
                Guess the word with up to 20 questions. Word {currentWordIndex + 1} of {vocabulary.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Questions Left</span>
                  <span className="text-sm font-medium">{questionsLeft}</span>
                </div>
                <Progress value={(questionsLeft / 20) * 100} className="mt-2" />
              </div>

              <div className="mb-6 rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-mono">{displayWord()}</p>
              </div>

              {gameStatus === "playing" ? (
                <div className="flex gap-2">
                  <Input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your guess..."
                    className="flex-1"
                  />
                  <Button onClick={checkGuess} disabled={!guess.trim()}>
                    Guess
                  </Button>
                  <Button variant="outline" onClick={provideHintButtonClick} title="Get next hint">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : gameStatus === "won" ? (
                <div className="rounded-lg bg-green-100 p-4 text-center dark:bg-green-900">
                  <p className="flex items-center justify-center text-lg font-medium text-green-800 dark:text-green-100">
                    <Check className="mr-2 h-5 w-5" />
                    Correct! The word is "{currentWord}".
                  </p>
                  {currentWordIndex < vocabulary.length - 1 ? (
                    <p className="mt-2 text-sm text-green-700 dark:text-green-200">Moving to next word...</p>
                  ) : (
                    <p className="mt-2 text-sm text-green-700 dark:text-green-200">
                      You've completed all words in this topic!
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-red-100 p-4 text-center dark:bg-red-900">
                  <p className="flex items-center justify-center text-lg font-medium text-red-800 dark:text-red-100">
                    <X className="mr-2 h-5 w-5" />
                    Game over! The word was "{currentWord}".
                  </p>
                  <Button className="mt-2" onClick={() => startNewWord(currentWord)}>
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start">
              <h3 className="mb-2 text-sm font-medium">Hints:</h3>
              <div className="w-full space-y-2">
                {hints.map((hint, index) => (
                  <div key={index} className="rounded-md bg-muted p-2 text-sm">
                    {hint}
                  </div>
                ))}
              </div>
              {(gameStatus === "won" || gameStatus === "lost") && (
                <div className="mt-4 w-full">
                  <h3 className="mb-2 text-sm font-medium">Synonym:</h3>
                  <div className="rounded-md bg-primary/10 p-2 text-sm">
                    <span className="font-medium">{currentWord}</span> - synonym:{" "}
                    <span className="italic">{getSynonym(currentWord)}</span>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle>Progress Visualization</CardTitle>
              <CardDescription>Track your progress through this topic</CardDescription>
            </CardHeader>
            <CardContent>
              <GameVisualizer
                totalWords={vocabulary.length}
                completedWords={completedWords}
                currentWord={currentWord}
                currentWordIndex={currentWordIndex}
                questionsLeft={questionsLeft}
                topic={topic}
              />
            </CardContent>
          </Card>

          {completedWords.length > 0 && (
            <Card className="mt-6 border-2 border-blue-500">
              <CardHeader>
                <CardTitle>Completed Words</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {completedWords.map((word, index) => (
                    <div key={index} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {word}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions to simulate API responses
function getVocabularyForTopic(levelId: string, topic: string): string[] {
  const vocabularyMap: Record<string, Record<string, string[]>> = {
    a1: {
      "Personal Information": ["name", "address", "email", "phone", "birthday", "nationality", "language"],
      Family: ["mother", "father", "sister", "brother", "son", "daughter", "grandparent"],
      "Daily Routines": ["wake", "shower", "breakfast", "lunch", "dinner", "sleep", "work"],
      "Food & Drink": ["water", "bread", "cheese", "fruit", "vegetable", "meat", "coffee"],
      Shopping: ["store", "price", "cheap", "expensive", "buy", "sell", "money"],
    },
    a2: {
      Travel: ["ticket", "passport", "hotel", "airport", "flight", "train", "vacation"],
      Hobbies: ["reading", "swimming", "cooking", "painting", "music", "sports", "gardening"],
      Weather: ["sunny", "rainy", "cloudy", "windy", "storm", "temperature", "forecast"],
      Work: ["office", "meeting", "colleague", "manager", "salary", "project", "interview"],
      Health: ["doctor", "hospital", "medicine", "sick", "healthy", "exercise", "appointment"],
    },
    b1: {
      Education: ["university", "degree", "student", "professor", "lecture", "assignment", "research"],
      Environment: ["pollution", "recycle", "climate", "conservation", "sustainable", "energy", "waste"],
      Media: ["newspaper", "television", "internet", "social", "journalist", "broadcast", "article"],
      Technology: ["computer", "software", "application", "device", "digital", "innovation", "network"],
      Culture: ["tradition", "festival", "heritage", "custom", "celebration", "diversity", "identity"],
    },
    b2: {
      Business: ["company", "investment", "strategy", "entrepreneur", "corporation", "marketing", "finance"],
      "Current Affairs": ["politics", "election", "government", "policy", "debate", "legislation", "democracy"],
      Arts: ["painting", "sculpture", "exhibition", "gallery", "artist", "creativity", "masterpiece"],
      Science: ["experiment", "theory", "discovery", "laboratory", "research", "hypothesis", "evidence"],
      "Social Issues": ["equality", "discrimination", "poverty", "rights", "justice", "welfare", "community"],
    },
    c1: {
      "Academic Subjects": [
        "philosophy",
        "psychology",
        "sociology",
        "linguistics",
        "anthropology",
        "economics",
        "literature",
      ],
      "Professional Terms": [
        "consultation",
        "implementation",
        "assessment",
        "methodology",
        "framework",
        "protocol",
        "compliance",
      ],
      "Abstract Concepts": [
        "perception",
        "consciousness",
        "paradigm",
        "ideology",
        "perspective",
        "intuition",
        "cognition",
      ],
      "Global Issues": [
        "sustainability",
        "globalization",
        "immigration",
        "diplomacy",
        "humanitarian",
        "development",
        "cooperation",
      ],
      Literature: ["narrative", "metaphor", "symbolism", "protagonist", "allegory", "rhetoric", "interpretation"],
    },
    c2: {
      "Specialized Fields": [
        "biotechnology",
        "nanotechnology",
        "astrophysics",
        "geopolitics",
        "macroeconomics",
        "epistemology",
        "jurisprudence",
      ],
      "Idiomatic Expressions": [
        "cutting edge",
        "blessing in disguise",
        "break the ice",
        "hit the nail on the head",
        "cost an arm and a leg",
        "under the weather",
        "piece of cake",
      ],
      "Cultural Nuances": [
        "etiquette",
        "taboo",
        "connotation",
        "stereotype",
        "assimilation",
        "ethnocentrism",
        "multiculturalism",
      ],
      "Philosophical Concepts": [
        "existentialism",
        "determinism",
        "utilitarianism",
        "relativism",
        "nihilism",
        "empiricism",
        "rationalism",
      ],
      Research: ["methodology", "qualitative", "quantitative", "longitudinal", "correlation", "causation", "validity"],
    },
  }

  return vocabularyMap[levelId]?.[topic] || []
}

function getSynonym(word: string): string {
  const synonyms: Record<string, string> = {
    name: "title",
    address: "location",
    email: "message",
    phone: "telephone",
    birthday: "anniversary",
    nationality: "citizenship",
    language: "tongue",
    mother: "mom",
    father: "dad",
    sister: "sibling",
    brother: "sibling",
    wake: "arise",
    shower: "bathe",
    breakfast: "morning meal",
    lunch: "midday meal",
    dinner: "supper",
    sleep: "rest",
    work: "labor",
    water: "liquid",
    bread: "loaf",
    cheese: "dairy product",
    fruit: "produce",
    vegetable: "produce",
    meat: "protein",
    coffee: "beverage",
    store: "shop",
    price: "cost",
    cheap: "inexpensive",
    expensive: "costly",
    buy: "purchase",
    sell: "vend",
    money: "currency",
    ticket: "pass",
    passport: "travel document",
    hotel: "accommodation",
    airport: "terminal",
    flight: "journey",
    train: "railway",
    vacation: "holiday",
    reading: "studying",
    swimming: "bathing",
    cooking: "preparing food",
    painting: "drawing",
    music: "melody",
    sports: "athletics",
    gardening: "horticulture",
    sunny: "bright",
    rainy: "wet",
    cloudy: "overcast",
    windy: "breezy",
    storm: "tempest",
    temperature: "climate",
    forecast: "prediction",
    office: "workplace",
    meeting: "gathering",
    colleague: "coworker",
    manager: "supervisor",
    salary: "wage",
    project: "task",
    interview: "meeting",
    doctor: "physician",
    hospital: "medical center",
    medicine: "medication",
    sick: "ill",
    healthy: "well",
    exercise: "workout",
    appointment: "meeting",
  }

  return synonyms[word] || "something similar"
}

function getAntonym(word: string): string {
  const antonyms: Record<string, string> = {
    cheap: "expensive",
    buy: "sell",
    healthy: "sick",
    // Add more as needed
  }

  return antonyms[word] || "something opposite"
}

function getUsageExample(word: string): string {
  const examples: Record<string, string> = {
    name: "introducing yourself",
    address: "filling out a form",
    email: "communicating online",
    phone: "calling someone",
    // Add more as needed
  }

  return examples[word] || "in everyday conversation"
}

function getContextSentence(word: string): string {
  const contextSentences: Record<string, string> = {
    // A1 Level
    name: "Please write your name on the form.",
    address: "My address is 123 Main Street.",
    email: "I'll send you an email with the details.",
    phone: "Can I have your phone number?",
    birthday: "We're having a party for my birthday.",
    nationality: "What's your nationality?",
    language: "English is a global language.",
    mother: "My mother makes delicious cookies.",
    father: "My father taught me how to ride a bike.",
    sister: "My sister is older than me.",
    brother: "I have one brother and two sisters.",
    son: "Their son is studying medicine.",
    daughter: "Her daughter plays the piano.",
    grandparent: "My grandparents live in the countryside.",
    wake: "I wake up at 7 o'clock every morning.",
    shower: "I take a shower before breakfast.",
    breakfast: "I usually have cereal for breakfast.",
    lunch: "We eat lunch in the cafeteria.",
    dinner: "We're having pasta for dinner tonight.",
    sleep: "Children need to sleep for at least 8 hours.",
    work: "I work from Monday to Friday.",
    water: "You should drink plenty of water every day.",
    bread: "I bought a loaf of bread from the bakery.",
    cheese: "This sandwich has cheese and tomato in it.",
    fruit: "Apples and bananas are my favorite fruit.",
    vegetable: "You should eat more vegetable for your health.",
    meat: "I don't eat meat; I'm vegetarian.",
    coffee: "Would you like some coffee with your dessert?",
    store: "I'm going to the store to buy some milk.",
    price: "What's the price of this shirt?",
    cheap: "These shoes are very cheap.",
    expensive: "That restaurant is too expensive for me.",
    buy: "I want to buy a new computer.",
    sell: "They sell fresh fruit at the market.",
    money: "I don't have enough money to buy a car.",

    // A2 Level
    ticket: "I need to buy a ticket for the concert.",
    passport: "Don't forget to bring your passport when traveling abroad.",
    hotel: "We're staying at a hotel near the beach.",
    airport: "The airport is about 30 minutes from the city center.",
    flight: "Our flight to Paris leaves at 9 AM.",
    train: "The train to London is delayed by 15 minutes.",
    vacation: "We're going on vacation to Spain next month.",
    reading: "Reading is my favorite hobby.",
    swimming: "I go swimming twice a week.",
    cooking: "Cooking is relaxing after a busy day.",
    painting: "She enjoys painting landscapes.",
    music: "What kind of music do you like?",
    sports: "Which sports do you play?",
    gardening: "Gardening is a rewarding hobby.",
    sunny: "It's a beautiful sunny day today.",
    rainy: "Take an umbrella; it's going to be rainy.",
    cloudy: "The sky is cloudy but it's not raining yet.",
    windy: "It's too windy to go sailing today.",
    storm: "There was a big storm last night.",
    temperature: "The temperature will rise to 30 degrees tomorrow.",
    forecast: "According to the forecast, it will rain tomorrow.",
    office: "I work in an office in the city center.",
    meeting: "I have an important meeting this afternoon.",
    colleague: "My colleague helped me with the project.",
    manager: "I need to speak to the manager about my schedule.",
    salary: "She got a raise in her salary last month.",
    project: "We're working on an exciting new project.",
    interview: "I have a job interview next week.",
    doctor: "I need to make an appointment with my doctor.",
    hospital: "My grandmother is in the hospital.",
    medicine: "Don't forget to take your medicine after meals.",
    sick: "I can't come to work because I'm sick.",
    healthy: "Eating vegetables helps you stay healthy.",
    exercise: "Regular exercise is good for your health.",
    appointment: "I have a dental appointment at 3 PM.",

    // Add more context sentences for other levels as needed
  }

  return contextSentences[word] || `The word "${word}" is commonly used in everyday conversation.`
}

function getLearnerDefinition(word: string): string {
  const definitions: Record<string, string> = {
    // A1 Level - Personal Information
    name: "This is what people call you. When someone asks 'What is your ____?', you tell them what to call you.",
    address: "This is where you live. It includes your house number, street name, city, and country.",
    email:
      "This is an electronic message that you send through the internet. You need an ____ address to send messages online.",
    phone:
      "This is a device you use to call and talk to people who are far away. You can also send text messages with this device.",
    birthday: "This is the day when you were born. People often celebrate this day each year with cake and presents.",
    nationality: "This shows which country you come from or belong to. If you are from Japan, your ____ is Japanese.",
    language: "This is what people use to communicate with words. English, Spanish, and Chinese are examples of this.",

    // A1 Level - Family
    mother: "This is a female parent. She gives birth to or raises children.",
    father: "This is a male parent. He helps to raise children in a family.",
    sister: "This is a girl or woman who has the same parents as you.",
    brother: "This is a boy or man who has the same parents as you.",
    son: "This is a male child in relation to his parents. A boy's parents call him their ____.",
    daughter:
      "When you have a boy in your family, he is a son to parents. When you have a girl in your family, she is a ____ to her parents.",
    grandparent: "This is the parent of your mother or father. Your mother's mother is your ____.",

    // A1 Level - Daily Routines
    wake: "This is what you do when you stop sleeping in the morning. You open your eyes and get out of bed.",
    shower: "This is when you stand under flowing water to clean your body.",
    breakfast: "This is the first meal of the day that you eat in the morning.",
    lunch: "This is the meal you eat in the middle of the day, usually around noon.",
    dinner: "This is the main meal of the day that people usually eat in the evening.",
    sleep: "This is what you do at night when you close your eyes and rest your body and mind.",
    work: "This is what people do to earn money. They go to an office, store, or other place to do this.",

    // A1 Level - Food & Drink
    water:
      "This is a clear liquid that has no color or taste. You drink it when you are thirsty, and it falls from the sky as rain.",
    bread: "This is a basic food made from flour, water, and yeast. You can toast it or use it to make sandwiches.",
    cheese: "This is a solid food made from milk. It can be yellow or white, and it comes in many different types.",
    fruit: "These are sweet foods that grow on trees or plants. Apples, bananas, and oranges are examples of this.",
    vegetable: "These are plants that people eat as food. Carrots, potatoes, and broccoli are examples of this.",
    meat: "This is food that comes from animals, like chicken, beef, or pork.",
    coffee:
      "This is a hot, dark brown drink made from ground beans. Many people drink it in the morning to help them wake up.",

    // A1 Level - Shopping
    store: "This is a place where you can buy things. You go to this place to purchase food, clothes, or other items.",
    price: "This is how much money you need to pay for something. When something costs a lot, it has a high ____.",
    cheap: "When something doesn't cost much money, it is ____. The opposite of expensive.",
    expensive: "When something costs a lot of money, it is ____. The opposite of cheap.",
    buy: "This is what you do when you give money to get something. You ____ things at stores.",
    sell: "This is what stores do when they give you something in exchange for money. The opposite of buy.",
    money: "These are the coins and paper bills that you use to pay for things.",

    // A2 Level - Travel
    ticket:
      "This is a piece of paper or electronic document that shows you have paid to travel on a bus, train, plane, or to enter a place like a cinema or concert.",
    passport:
      "This is an official document from your government that identifies you and allows you to travel to other countries.",
    hotel: "This is a place where people pay to stay when they are traveling or on vacation.",
    airport: "This is a place where airplanes take off and land, and where people go to travel by air.",
    flight: "This is a journey by airplane. When you travel by air, you take a ____.",
    train: "This is a vehicle that travels on rails and carries passengers or goods.",
    vacation: "This is a period of time when you don't work or study and can relax or travel.",

    // A2 Level - Hobbies
    reading:
      "This is the activity of looking at and understanding written words, usually in books, magazines, or online.",
    swimming: "This is the activity of moving through water using your arms and legs.",
    cooking: "This is the activity of preparing food by combining ingredients and often using heat.",
    painting: "This is the activity of creating pictures using colors and a brush.",
    music:
      "These are sounds that are arranged in a way that is pleasant to listen to. People play instruments or sing to create this.",
    sports:
      "These are physical activities that people do for fun or competition, like football, basketball, or tennis.",
    gardening: "This is the activity of growing and taking care of plants in a garden.",

    // A2 Level - Weather
    sunny: "When the weather is like this, the sun is shining brightly and there are few or no clouds in the sky.",
    rainy: "When the weather is like this, water falls from clouds in the sky.",
    cloudy: "When the weather is like this, there are many clouds in the sky, blocking the sun.",
    windy: "When the weather is like this, the air is moving strongly, and you can feel it blowing against you.",
    storm: "This is bad weather with strong winds, rain, thunder, and lightning.",
    temperature: "This is how hot or cold something is. We measure this in degrees Celsius or Fahrenheit.",
    forecast: "This is a prediction about what the weather will be like in the future.",

    // A2 Level - Work
    office: "This is a room or building where people work at desks, often using computers.",
    meeting: "This is when people come together to discuss something, often at work.",
    colleague: "This is a person who works with you. You and the people you work with are ____s.",
    manager: "This is a person who is in charge of a business, department, or team of people at work.",
    salary: "This is the money that you receive regularly for doing your job.",
    project: "This is a planned piece of work that has a specific purpose and often involves a team of people.",
    interview: "This is a meeting where someone asks you questions to see if you are suitable for a job.",

    // A2 Level - Health
    doctor: "This is a person who is trained to treat people who are ill or injured.",
    hospital: "This is a place where sick or injured people go to receive medical treatment.",
    medicine: "This is a substance that you take to treat or prevent an illness.",
    sick: "When you are not well or have a disease, you are ____.",
    healthy: "When your body is in good condition and you are not ill, you are ____.",
    exercise: "This is physical activity that you do to keep your body strong and healthy.",
    appointment:
      "This is an arrangement to meet someone at a particular time, especially with a doctor or dentist. You make an ____ to see a professional at a specific time.",

    // B1 Level - Education
    university:
      "This is a place where students study for degrees and where academic research is done. It provides higher education after high school.",
    degree:
      "This is a qualification awarded to students who successfully complete a course of study at a university or college.",
    student: "This is a person who is studying at a school, college, or university.",
    professor: "This is a teacher of the highest rank at a university or college.",
    lecture: "This is a talk given to a group of students or other people to teach them about a particular subject.",
    assignment: "This is a task or piece of work that is given to someone as part of their studies or job.",
    research: "This is the careful study of a subject to discover new facts or information about it.",

    // B1 Level - Environment
    pollution: "This is the process of making air, water, soil, etc. dirty and dangerous for living things.",
    recycle: "This is the process of treating things that have been used so that they can be used again.",
    climate: "This is the general weather conditions that are typical of a place.",
    conservation: "This is the protection of natural resources and the environment.",
    sustainable: "When something is like this, it can continue for a long time without damaging the environment.",
    energy: "This is the power that comes from sources such as electricity, heat, or human effort.",
    waste: "These are materials that are not wanted and are thrown away.",
  }

  return definitions[word] || `This word has ${word.length} letters and is related to ${getSynonym(word)}.`
}
