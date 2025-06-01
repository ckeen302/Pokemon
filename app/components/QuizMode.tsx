"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import type { Pokemon } from "@/types/pokemon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, RotateCcw, Trophy, Target, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface QuizModeProps {
  pokemonList: Pokemon[]
}

type QuestionType =
  | "name"
  | "type"
  | "move"
  | "stat"
  | "whos-that-pokemon"
  | "generation"
  | "region"
  | "evolution"
  | "game-history"
  | "pokemon-lore"
  | "gym-leaders"
  | "legendary"

interface Question {
  id: string
  type: QuestionType
  pokemon: Pokemon | null
  questionText: string
  options: string[]
  correctAnswer: string
  showPokemonImage: boolean
}

interface QuizSettings {
  questionCount: number
  questionTypes: QuestionType[]
}

interface QuizState {
  isSetupMode: boolean
  questions: Question[]
  currentQuestionIndex: number
  score: number
  answered: boolean
  selectedAnswer: string | null
  timeLeft: number
  isTimerActive: boolean
  quizCompleted: boolean
}

// Static question data to avoid regeneration issues
const STATIC_QUESTIONS = {
  "game-history": [
    {
      question: "What were the first Pokémon games released?",
      answer: "Red and Blue",
      options: ["Red and Blue", "Gold and Silver", "Ruby and Sapphire", "Diamond and Pearl"],
    },
    {
      question: "In which generation was the Steel type introduced?",
      answer: "Generation II",
      options: ["Generation I", "Generation II", "Generation III", "Generation IV"],
    },
    {
      question: "What is the name of the Pokémon Professor in Kanto?",
      answer: "Professor Oak",
      options: ["Professor Oak", "Professor Elm", "Professor Birch", "Professor Rowan"],
    },
    {
      question: "Which game introduced Mega Evolution?",
      answer: "X and Y",
      options: ["Black and White", "X and Y", "Sun and Moon", "Sword and Shield"],
    },
    {
      question: "What is the maximum number of Pokémon in a party?",
      answer: "6",
      options: ["4", "5", "6", "8"],
    },
    {
      question: "Which region is Pokémon Gold and Silver set in?",
      answer: "Johto",
      options: ["Kanto", "Johto", "Hoenn", "Sinnoh"],
    },
    {
      question: "What type of Pokémon is immune to Ghost-type moves?",
      answer: "Normal",
      options: ["Fighting", "Normal", "Psychic", "Dark"],
    },
    {
      question: "Which Pokémon is known as the 'Genetic Pokémon'?",
      answer: "Mewtwo",
      options: ["Mew", "Mewtwo", "Ditto", "Arceus"],
    },
  ],
  "pokemon-lore": [
    {
      question: "What is the name of Ash's hometown?",
      answer: "Pallet Town",
      options: ["Pallet Town", "Viridian City", "Pewter City", "Cerulean City"],
    },
    {
      question: "Who is the creator of the Pokémon franchise?",
      answer: "Satoshi Tajiri",
      options: ["Satoshi Tajiri", "Shigeru Miyamoto", "Hironobu Sakaguchi", "Masahiro Sakurai"],
    },
    {
      question: "What does 'Pokémon' stand for?",
      answer: "Pocket Monsters",
      options: ["Pocket Monsters", "Power Monsters", "Portable Monsters", "Playful Monsters"],
    },
    {
      question: "Which company develops the main Pokémon games?",
      answer: "Game Freak",
      options: ["Nintendo", "Game Freak", "Creatures Inc.", "The Pokémon Company"],
    },
    {
      question: "What is the name of Team Rocket's cat Pokémon?",
      answer: "Meowth",
      options: ["Meowth", "Persian", "Skitty", "Glameow"],
    },
    {
      question: "In the anime, what is Brock's dream?",
      answer: "Pokémon Breeder",
      options: ["Pokémon Master", "Pokémon Breeder", "Gym Leader", "Pokémon Researcher"],
    },
    {
      question: "What color is a shiny Gyarados?",
      answer: "Red",
      options: ["Blue", "Red", "Gold", "Purple"],
    },
    {
      question: "Which Pokémon is said to appear every 1000 years?",
      answer: "Ho-Oh",
      options: ["Lugia", "Ho-Oh", "Celebi", "Mew"],
    },
  ],
  "gym-leaders": [
    {
      question: "Who is the Electric-type Gym Leader in Kanto?",
      answer: "Lt. Surge",
      options: ["Lt. Surge", "Volkner", "Clemont", "Wattson"],
    },
    {
      question: "What type does Brock specialize in?",
      answer: "Rock",
      options: ["Ground", "Rock", "Fighting", "Steel"],
    },
    {
      question: "Who is the Gym Leader of Cerulean City?",
      answer: "Misty",
      options: ["Misty", "Marlon", "Wallace", "Crasher Wake"],
    },
    {
      question: "Which Gym Leader uses Dragon-type Pokémon in Johto?",
      answer: "Clair",
      options: ["Lance", "Clair", "Drayden", "Iris"],
    },
    {
      question: "What is the first Gym in the Hoenn region?",
      answer: "Rustboro Gym",
      options: ["Petalburg Gym", "Rustboro Gym", "Dewford Gym", "Mauville Gym"],
    },
    {
      question: "Who is known as the 'Sleeping Gym Leader'?",
      answer: "Roark",
      options: ["Byron", "Roark", "Flannery", "Norman"],
    },
    {
      question: "Which Gym Leader is also a model?",
      answer: "Elesa",
      options: ["Skyla", "Elesa", "Clair", "Flannery"],
    },
    {
      question: "What type does Sabrina specialize in?",
      answer: "Psychic",
      options: ["Psychic", "Ghost", "Dark", "Fairy"],
    },
  ],
  legendary: [
    {
      question: "Which legendary Pokémon is known as the 'Alpha Pokémon'?",
      answer: "Arceus",
      options: ["Arceus", "Dialga", "Palkia", "Giratina"],
    },
    {
      question: "What legendary Pokémon controls time?",
      answer: "Dialga",
      options: ["Dialga", "Palkia", "Celebi", "Arceus"],
    },
    {
      question: "Which legendary bird represents lightning?",
      answer: "Zapdos",
      options: ["Articuno", "Zapdos", "Moltres", "Lugia"],
    },
    {
      question: "What is the signature move of Rayquaza?",
      answer: "Dragon Ascent",
      options: ["Dragon Pulse", "Dragon Ascent", "Outrage", "Draco Meteor"],
    },
    {
      question: "Which legendary Pokémon is said to grant wishes?",
      answer: "Jirachi",
      options: ["Mew", "Celebi", "Jirachi", "Manaphy"],
    },
    {
      question: "What type combination does Lugia have?",
      answer: "Psychic/Flying",
      options: ["Psychic/Flying", "Water/Flying", "Psychic/Water", "Flying/Dragon"],
    },
    {
      question: "Which legendary Pokémon sleeps for 1000 years?",
      answer: "Darkrai",
      options: ["Cresselia", "Darkrai", "Jirachi", "Regigigas"],
    },
    {
      question: "What legendary Pokémon is known as the 'Eon Pokémon'?",
      answer: "Latios",
      options: ["Latios", "Latias", "Both Latios and Latias", "Rayquaza"],
    },
  ],
  evolution: [
    {
      question: "What level does Charmander evolve?",
      answer: "16",
      options: ["14", "16", "18", "20"],
    },
    {
      question: "What stone evolves Pikachu?",
      answer: "Thunder Stone",
      options: ["Thunder Stone", "Fire Stone", "Water Stone", "Moon Stone"],
    },
    {
      question: "How does Eevee evolve into Vaporeon?",
      answer: "Water Stone",
      options: ["Water Stone", "Thunder Stone", "Fire Stone", "Level up near water"],
    },
    {
      question: "What level does Magikarp evolve?",
      answer: "20",
      options: ["15", "20", "25", "30"],
    },
    {
      question: "How does Haunter evolve into Gengar?",
      answer: "Trade",
      options: ["Trade", "Level 40", "Moon Stone", "Friendship"],
    },
    {
      question: "What stone evolves Growlithe?",
      answer: "Fire Stone",
      options: ["Fire Stone", "Thunder Stone", "Water Stone", "Leaf Stone"],
    },
    {
      question: "How does Kadabra evolve?",
      answer: "Trade",
      options: ["Trade", "Level 36", "Psychic Stone", "Friendship"],
    },
    {
      question: "What level does Wartortle evolve?",
      answer: "36",
      options: ["32", "34", "36", "38"],
    },
  ],
}

const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]

const ALL_GENERATIONS = [
  "Generation I",
  "Generation II",
  "Generation III",
  "Generation IV",
  "Generation V",
  "Generation VI",
  "Generation VII",
  "Generation VIII",
  "Generation IX",
]

const ALL_REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea"]

export default function QuizMode({ pokemonList }: QuizModeProps) {
  const { toast } = useToast()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Quiz settings
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    questionCount: 10,
    questionTypes: ["name", "whos-that-pokemon", "generation", "region"],
  })

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>({
    isSetupMode: true,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
    timeLeft: 30,
    isTimerActive: false,
    quizCompleted: false,
  })

  // Memoized Pokemon pool with validation
  const quizPokemonPool = useMemo(() => {
    if (!pokemonList || pokemonList.length === 0) return []

    // Filter valid Pokemon with required data
    const validPokemon = pokemonList.filter(
      (pokemon) =>
        pokemon &&
        pokemon.id &&
        pokemon.name &&
        pokemon.types &&
        pokemon.types.length > 0 &&
        pokemon.stats &&
        pokemon.stats.length > 0 &&
        pokemon.moves &&
        pokemon.moves.length > 0,
    )

    return validPokemon.slice(0, 151) // First 151 for consistency
  }, [pokemonList])

  // Helper functions
  const getGenerationByID = useCallback((id: number): string => {
    if (id >= 1 && id <= 151) return "Generation I"
    if (id >= 152 && id <= 251) return "Generation II"
    if (id >= 252 && id <= 386) return "Generation III"
    if (id >= 387 && id <= 493) return "Generation IV"
    if (id >= 494 && id <= 649) return "Generation V"
    if (id >= 650 && id <= 721) return "Generation VI"
    if (id >= 722 && id <= 809) return "Generation VII"
    if (id >= 810 && id <= 905) return "Generation VIII"
    if (id >= 906) return "Generation IX"
    return "Generation I"
  }, [])

  const getRandomPokemonNames = useCallback(
    (count: number, exclude: string): string[] => {
      if (quizPokemonPool.length < count + 1) return []

      const names = quizPokemonPool
        .map((p) => p.name)
        .filter((name) => name !== exclude)
        .sort(() => 0.5 - Math.random())
        .slice(0, count)

      return names.length === count ? names : []
    },
    [quizPokemonPool],
  )

  const getRandomMoves = useCallback(
    (count: number, exclude: string): string[] => {
      const allMoves = quizPokemonPool.flatMap((p) => p.moves.map((m) => m.name))
      const uniqueMoves = [...new Set(allMoves)]

      const moves = uniqueMoves
        .filter((name) => name !== exclude)
        .sort(() => 0.5 - Math.random())
        .slice(0, count)

      return moves.length === count ? moves : []
    },
    [quizPokemonPool],
  )

  const getRandomStats = useCallback((count: number, exclude: number): string[] => {
    const stats = Array.from({ length: count }, () => Math.floor(Math.random() * 200 + 1))
      .filter((stat) => stat !== exclude)
      .map(String)

    return stats.length === count ? stats : []
  }, [])

  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [])

  // Question generation
  const generateQuestion = useCallback(
    (questionType: QuestionType): Question | null => {
      try {
        const questionId = `${questionType}-${Date.now()}-${Math.random()}`

        // Handle knowledge-based questions
        if (["game-history", "pokemon-lore", "gym-leaders", "legendary", "evolution"].includes(questionType)) {
          const staticQuestions = STATIC_QUESTIONS[questionType as keyof typeof STATIC_QUESTIONS]
          if (!staticQuestions || staticQuestions.length === 0) return null

          const randomQuestion = staticQuestions[Math.floor(Math.random() * staticQuestions.length)]

          return {
            id: questionId,
            type: questionType,
            pokemon: null,
            questionText: randomQuestion.question,
            options: shuffleArray(randomQuestion.options),
            correctAnswer: randomQuestion.answer,
            showPokemonImage: false,
          }
        }

        // Handle Pokemon-specific questions
        if (quizPokemonPool.length === 0) return null

        const pokemon = quizPokemonPool[Math.floor(Math.random() * quizPokemonPool.length)]
        if (!pokemon) return null

        let options: string[] = []
        let correctAnswer = ""
        let questionText = ""

        switch (questionType) {
          case "name":
          case "whos-that-pokemon":
            correctAnswer = pokemon.name
            const randomNames = getRandomPokemonNames(3, pokemon.name)
            if (randomNames.length !== 3) return null
            options = shuffleArray([correctAnswer, ...randomNames])
            questionText = "Who's That Pokémon?"
            break

          case "type":
            if (!pokemon.types || pokemon.types.length === 0) return null
            correctAnswer = pokemon.types[0]
            const randomTypes = ALL_TYPES.filter((t) => t !== correctAnswer)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
            if (randomTypes.length !== 3) return null
            options = shuffleArray([correctAnswer, ...randomTypes])
            questionText = `What is ${pokemon.name}'s primary type?`
            break

          case "move":
            if (!pokemon.moves || pokemon.moves.length === 0) return null
            const move = pokemon.moves[Math.floor(Math.random() * pokemon.moves.length)]
            if (!move || !move.name) return null
            correctAnswer = move.name
            const randomMoves = getRandomMoves(3, move.name)
            if (randomMoves.length !== 3) return null
            options = shuffleArray([correctAnswer, ...randomMoves])
            questionText = `Which move can ${pokemon.name} learn?`
            break

          case "stat":
            if (!pokemon.stats || pokemon.stats.length === 0) return null
            const stat = pokemon.stats[Math.floor(Math.random() * pokemon.stats.length)]
            if (!stat || typeof stat.value !== "number") return null
            correctAnswer = stat.value.toString()
            const randomStats = getRandomStats(3, stat.value)
            if (randomStats.length !== 3) return null
            options = shuffleArray([correctAnswer, ...randomStats])
            questionText = `What is ${pokemon.name}'s ${stat.name?.replace("-", " ")} stat?`
            break

          case "generation":
            correctAnswer = getGenerationByID(pokemon.id)
            const randomGenerations = ALL_GENERATIONS.filter((g) => g !== correctAnswer)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
            if (randomGenerations.length !== 3) return null
            options = shuffleArray([correctAnswer, ...randomGenerations])
            questionText = `Which generation is ${pokemon.name} from?`
            break

          case "region":
            correctAnswer = pokemon.region ? pokemon.region.charAt(0).toUpperCase() + pokemon.region.slice(1) : "Kanto"
            const randomRegions = ALL_REGIONS.filter((r) => r !== correctAnswer)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
            if (randomRegions.length !== 3) return null
            options = shuffleArray([correctAnswer, ...randomRegions])
            questionText = `Which region is ${pokemon.name} originally from?`
            break

          default:
            return null
        }

        if (!correctAnswer || options.length !== 4) return null

        return {
          id: questionId,
          type: questionType,
          pokemon,
          questionText,
          options,
          correctAnswer,
          showPokemonImage: true,
        }
      } catch (error) {
        console.error("Error generating question:", error)
        return null
      }
    },
    [quizPokemonPool, getGenerationByID, getRandomPokemonNames, getRandomMoves, getRandomStats, shuffleArray],
  )

  // Timer management
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current)
      questionTimeoutRef.current = null
    }
  }, [])

  const startTimer = useCallback((duration: number) => {
    clearAllTimers()

    setQuizState((prev) => ({
      ...prev,
      timeLeft: duration,
      isTimerActive: true,
    }))

    timerRef.current = setInterval(() => {
      setQuizState((prev) => {
        if (prev.timeLeft <= 1) {
          clearAllTimers()
          // Auto-submit when time runs out
          handleAnswer("")
          return { ...prev, timeLeft: 0, isTimerActive: false }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)
  }, [])

  // Quiz generation
  const generateQuiz = useCallback(() => {
    try {
      if (quizSettings.questionTypes.length === 0) {
        toast({
          title: "No Question Types Selected",
          description: "Please select at least one question type.",
          variant: "destructive",
        })
        return
      }

      if (quizPokemonPool.length === 0) {
        toast({
          title: "No Pokémon Data",
          description: "Please wait for Pokémon data to load.",
          variant: "destructive",
        })
        return
      }

      const newQuestions: Question[] = []
      let attempts = 0
      const maxAttempts = quizSettings.questionCount * 3

      while (newQuestions.length < quizSettings.questionCount && attempts < maxAttempts) {
        const randomType = quizSettings.questionTypes[Math.floor(Math.random() * quizSettings.questionTypes.length)]
        const question = generateQuestion(randomType)

        if (question) {
          // Avoid duplicate questions
          const isDuplicate = newQuestions.some(
            (q) => q.questionText === question.questionText || q.correctAnswer === question.correctAnswer,
          )

          if (!isDuplicate) {
            newQuestions.push(question)
          }
        }

        attempts++
      }

      if (newQuestions.length === 0) {
        toast({
          title: "Quiz Generation Failed",
          description: "Unable to generate quiz questions. Please try different settings.",
          variant: "destructive",
        })
        return
      }

      setQuizState({
        isSetupMode: false,
        questions: newQuestions,
        currentQuestionIndex: 0,
        score: 0,
        answered: false,
        selectedAnswer: null,
        timeLeft: 30,
        isTimerActive: false,
        quizCompleted: false,
      })

      // Start timer for first question if it's a Pokemon-specific question
      const firstQuestion = newQuestions[0]
      if (firstQuestion && firstQuestion.showPokemonImage) {
        startTimer(30)
      }
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast({
        title: "Quiz Generation Error",
        description: "An error occurred while generating the quiz.",
        variant: "destructive",
      })
    }
  }, [quizSettings, quizPokemonPool, generateQuestion, startTimer, toast])

  // Answer handling
  const handleAnswer = useCallback(
    (answer: string) => {
      if (quizState.answered || quizState.quizCompleted) return

      clearAllTimers()

      const currentQuestion = quizState.questions[quizState.currentQuestionIndex]
      if (!currentQuestion) return

      const isCorrect = answer === currentQuestion.correctAnswer
      const newScore = isCorrect ? quizState.score + 1 : quizState.score

      setQuizState((prev) => ({
        ...prev,
        answered: true,
        selectedAnswer: answer,
        score: newScore,
        isTimerActive: false,
      }))

      // Auto-advance to next question or complete quiz
      const isLastQuestion = quizState.currentQuestionIndex >= quizState.questions.length - 1
      const delay = currentQuestion.showPokemonImage ? 2000 : 3000

      questionTimeoutRef.current = setTimeout(() => {
        if (isLastQuestion) {
          setQuizState((prev) => ({
            ...prev,
            quizCompleted: true,
            isSetupMode: true,
          }))
        } else {
          const nextIndex = quizState.currentQuestionIndex + 1
          const nextQuestion = quizState.questions[nextIndex]

          setQuizState((prev) => ({
            ...prev,
            currentQuestionIndex: nextIndex,
            answered: false,
            selectedAnswer: null,
            timeLeft: 30,
            isTimerActive: false,
          }))

          // Start timer for next question if needed
          if (nextQuestion && nextQuestion.showPokemonImage) {
            startTimer(30)
          }
        }
      }, delay)
    },
    [quizState, clearAllTimers, startTimer],
  )

  // Settings handlers
  const toggleQuestionType = useCallback((type: QuestionType) => {
    setQuizSettings((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter((t) => t !== type)
        : [...prev.questionTypes, type],
    }))
  }, [])

  const handleQuestionCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Number.parseInt(e.target.value)
    if (!isNaN(count) && count > 0 && count <= 50) {
      setQuizSettings((prev) => ({ ...prev, questionCount: count }))
    }
  }, [])

  const startQuiz = useCallback(() => {
    if (quizSettings.questionTypes.length === 0) {
      toast({
        title: "No Question Types",
        description: "Please select at least one question type.",
        variant: "destructive",
      })
      return
    }
    generateQuiz()
  }, [quizSettings.questionTypes.length, generateQuiz, toast])

  const resetQuiz = useCallback(() => {
    clearAllTimers()
    setQuizState({
      isSetupMode: true,
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
      timeLeft: 30,
      isTimerActive: false,
      quizCompleted: false,
    })
  }, [clearAllTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [clearAllTimers])

  // Error boundary for Pokemon data
  if (!pokemonList || pokemonList.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="modern-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="heading-md text-gray-900 mb-2">Loading Pokémon Data</h3>
              <p className="text-gray-600">Please wait for Pokémon data to load before starting a quiz.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Setup mode
  if (quizState.isSetupMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="heading-lg text-gray-900 mb-2">Pokémon Quiz</h2>
          <p className="text-gray-600">Test your Pokémon knowledge!</p>
        </div>

        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="50"
                value={quizSettings.questionCount}
                onChange={handleQuestionCountChange}
                className="search-input focus-ring w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Question Types</label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "name",
                    "whos-that-pokemon",
                    "type",
                    "move",
                    "stat",
                    "generation",
                    "region",
                    "evolution",
                    "game-history",
                    "pokemon-lore",
                    "gym-leaders",
                    "legendary",
                  ] as QuestionType[]
                ).map((type) => (
                  <Badge
                    key={type}
                    variant={quizSettings.questionTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-blue-100 transition-colors"
                    onClick={() => toggleQuestionType(type)}
                  >
                    {type === "whos-that-pokemon"
                      ? "Who's That Pokémon?"
                      : type === "game-history"
                        ? "Game History"
                        : type === "pokemon-lore"
                          ? "Pokémon Lore"
                          : type === "gym-leaders"
                            ? "Gym Leaders"
                            : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                ))}
              </div>
              {quizSettings.questionTypes.length === 0 && (
                <p className="text-sm text-red-600 mt-2">Please select at least one question type.</p>
              )}
            </div>

            <Button
              onClick={startQuiz}
              disabled={quizSettings.questionTypes.length === 0}
              className="w-full btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        {quizState.quizCompleted && quizState.questions.length > 0 && (
          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="heading-md text-gray-900 mb-2">Quiz Complete!</h3>
                <p className="text-gray-600 mb-4">
                  You scored {quizState.score} out of {quizState.questions.length} questions correctly!
                </p>
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  {Math.round((quizState.score / quizState.questions.length) * 100)}%
                </div>
                <Button onClick={resetQuiz} className="btn-secondary flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Quiz mode
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex]
  const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="modern-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="heading-md text-gray-900 mb-2">Quiz Error</h3>
              <p className="text-gray-600 mb-4">There was an error loading the current question.</p>
              <Button onClick={resetQuiz} className="btn-secondary">
                Return to Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="modern-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
              </span>
              {currentQuestion.showPokemonImage && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className={quizState.timeLeft <= 10 ? "text-red-600 font-bold" : ""}>
                    {quizState.timeLeft}s
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-gray-900">
                {quizState.score}/{quizState.questions.length}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-center heading-md text-gray-900">{currentQuestion.questionText}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pokemon Image - only show for Pokemon-specific questions */}
          {currentQuestion.showPokemonImage && currentQuestion.pokemon && (
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <img
                  src={currentQuestion.pokemon.officialArtwork || currentQuestion.pokemon.image || "/placeholder.svg"}
                  alt="Mystery Pokemon"
                  className="w-full h-full object-contain p-4"
                  style={{
                    filter:
                      (currentQuestion.type === "name" || currentQuestion.type === "whos-that-pokemon") &&
                      !quizState.answered
                        ? "brightness(0)"
                        : "none",
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "p-4 text-left border-2 rounded-lg transition-all duration-200 font-medium "

              if (quizState.answered) {
                if (option === currentQuestion.correctAnswer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-700"
                } else if (option === quizState.selectedAnswer && option !== currentQuestion.correctAnswer) {
                  buttonClass += "border-red-500 bg-red-50 text-red-700"
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500"
                }
              } else {
                buttonClass +=
                  "border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
              }

              return (
                <button
                  key={`${currentQuestion.id}-${index}`}
                  onClick={() => handleAnswer(option)}
                  className={buttonClass}
                  disabled={quizState.answered}
                >
                  <span className="capitalize">{option.replace("-", " ")}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
