'use client'

import { useState, useEffect } from 'react'
import { Pokemon } from '@/types/pokemon'

interface QuizModeProps {
 pokemonList: Pokemon[]
}

type QuestionType = 'name' | 'type' | 'move' | 'stat' | 'whos-that-pokemon'

interface Question {
 type: QuestionType
 pokemon: Pokemon
 options: string[]
 correctAnswer: string
}

interface QuizSettings {
 questionCount: number
 questionTypes: QuestionType[]
}

export default function QuizMode({ pokemonList }: QuizModeProps) {
 const [quizSettings, setQuizSettings] = useState<QuizSettings>({
   questionCount: 10,
   questionTypes: ['name', 'whos-that-pokemon'],
 })
 const [isSetupMode, setIsSetupMode] = useState(true)
 const [questions, setQuestions] = useState<Question[]>([])
 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
 const [score, setScore] = useState(0)
 const [answered, setAnswered] = useState(false)

 useEffect(() => {
   if (!isSetupMode) {
     generateQuiz()
   }
 }, [isSetupMode])

 const generateQuiz = () => {
   const newQuestions: Question[] = []
   for (let i = 0; i < quizSettings.questionCount; i++) {
     newQuestions.push(generateQuestion())
   }
   setQuestions(newQuestions)
   setCurrentQuestionIndex(0)
   setScore(0)
 }

 const generateQuestion = (): Question => {
   const pokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)]
   const questionType = quizSettings.questionTypes[Math.floor(Math.random() * quizSettings.questionTypes.length)]
   let options: string[] = []
   let correctAnswer = ''

   switch (questionType) {
     case 'name':
     case 'whos-that-pokemon':
       correctAnswer = pokemon.name
       options = [pokemon.name, ...getRandomPokemonNames(pokemonList, 3, pokemon.name)]
       break
     case 'type':
       correctAnswer = pokemon.types[0]
       options = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy']
       options = [correctAnswer, ...options.filter(t => t !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3)]
       break
     case 'move':
       const move = pokemon.moves[Math.floor(Math.random() * pokemon.moves.length)]
       correctAnswer = move.name
       options = [move.name, ...getRandomMoves(pokemonList, 3, move.name)]
       break
     case 'stat':
       const stat = pokemon.stats[Math.floor(Math.random() * pokemon.stats.length)]
       correctAnswer = stat.value.toString()
       options = [stat.value.toString(), ...getRandomStats(3, stat.value)]
       break
   }

   return {
     type: questionType,
     pokemon,
     options: options.sort(() => 0.5 - Math.random()),
     correctAnswer
   }
 }

 const handleAnswer = (answer: string) => {
   if (!answered) {
     setAnswered(true)
     if (answer === questions[currentQuestionIndex]?.correctAnswer) {
       setScore(score + 1)
     }
     setTimeout(() => {
       if (currentQuestionIndex < questions.length - 1) {
         setCurrentQuestionIndex(currentQuestionIndex + 1)
         setAnswered(false)
       } else {
         setIsSetupMode(true)
       }
     }, 1000)
   }
 }

 const toggleQuestionType = (type: QuestionType) => {
   setQuizSettings(prev => ({
     ...prev,
     questionTypes: prev.questionTypes.includes(type)
       ? prev.questionTypes.filter(t => t !== type)
       : [...prev.questionTypes, type]
   }))
 }

 const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const count = parseInt(e.target.value)
   if (!isNaN(count) && count > 0 && count <= 50) {
     setQuizSettings(prev => ({ ...prev, questionCount: count }))
   }
 }

 const startQuiz = () => {
   if (quizSettings.questionTypes.length > 0) {
     setIsSetupMode(false)
   }
 }

 if (isSetupMode) {
   return (
     <div className="h-full flex flex-col p-4 text-[#00FFFF]">
       <h2 className="text-2xl mb-4">QUIZ SETUP</h2>
       <div className="mb-4">
         <label className="block mb-2">NUMBER OF QUESTIONS:</label>
         <input
           type="number"
           min="1"
           max="50"
           value={quizSettings.questionCount}
           onChange={handleQuestionCountChange}
           className="w-full p-2 bg-[rgba(24,191,191,0.1)] text-[#00FFFF] border border-[#18BFBF]"
         />
       </div>
       <div className="mb-4">
         <h3 className="text-xl mb-2">QUESTION TYPES:</h3>
         {(['name', 'whos-that-pokemon', 'type', 'move', 'stat'] as QuestionType[]).map(type => (
           <button
             key={`question-type-${type}`}
             onClick={() => toggleQuestionType(type)}
             className={`mr-2 mb-2 px-2 py-1 rounded ${quizSettings.questionTypes.includes(type) ? 'bg-[#18BFBF] text-[#0F2F2F]' : 'bg-[rgba(24,191,191,0.1)] text-[#00FFFF]'}`}
           >
             {type === 'whos-that-pokemon' ? "WHO'S THAT POKEMON" : type.toUpperCase()}
           </button>
         ))}
       </div>
       <button
         onClick={startQuiz}
         disabled={quizSettings.questionTypes.length === 0}
         className="mt-auto p-2 bg-[#18BFBF] text-[#0F2F2F] disabled:opacity-50"
       >
         START QUIZ
       </button>
     </div>
   )
 }

 const currentQuestion = questions[currentQuestionIndex]

 return (
   <div className="h-full flex flex-col p-4 pb-8 text-[#00FFFF]">
     <div className="pokemon-entry bg-[rgba(24,191,191,0.1)] mb-4">
       <span className="pokemon-name">
         {getQuestionText(currentQuestion)} ({currentQuestionIndex + 1}/{questions.length})
       </span>
     </div>
     <div className="flex-grow flex flex-col items-center justify-center mb-4">
       <div className="w-[400px] h-[400px] relative flex items-center justify-center mb-4">
         <img
           src={currentQuestion?.pokemon.image}
           alt="Mystery Pokemon"
           className="w-full h-full object-contain pixelated"
           style={{ 
             filter: (currentQuestion?.type === 'name' || currentQuestion?.type === 'whos-that-pokemon') && !answered ? 'brightness(0)' : 'none',
           }}
         />
       </div>
       <div className="w-full grid grid-cols-2 gap-4">
         {currentQuestion?.options.map((option, index) => (
           <button
             key={`answer-${currentQuestionIndex}-${index}`}
             onClick={() => handleAnswer(option)}
             className={`pokemon-entry p-4 text-center transition-colors ${
               answered && option === currentQuestion.correctAnswer 
                 ? 'bg-[#18BFBF] text-[#0F2F2F]' 
                 : 'bg-[rgba(24,191,191,0.1)] text-[#00FFFF] hover:bg-[rgba(24,191,191,0.2)]'
             }`}
             disabled={answered}
           >
             <span className="pokemon-name text-lg">{option}</span>
           </button>
         ))}
       </div>
     </div>
     <div className="pokemon-entry bg-[rgba(24,191,191,0.1)] text-[#00FFFF]">
       <span className="pokemon-name">SCORE: {score}/{questions.length}</span>
     </div>
   </div>
 )
}

function getRandomPokemonNames(pokemonList: Pokemon[], count: number, exclude: string): string[] {
 return pokemonList
   .map(p => p.name)
   .filter(name => name !== exclude)
   .sort(() => 0.5 - Math.random())
   .slice(0, count)
}

function getRandomMoves(pokemonList: Pokemon[], count: number, exclude: string): string[] {
 const allMoves = pokemonList.flatMap(p => p.moves.map(m => m.name))
 return [...new Set(allMoves)]
   .filter(name => name !== exclude)
   .sort(() => 0.5 - Math.random())
   .slice(0, count)
}

function getRandomStats(count: number, exclude: number): string[] {
 return Array.from({ length: count }, () => 
   Math.floor(Math.random() * 200 + 1)
 )
   .filter(stat => stat !== exclude)
   .map(String)
}

function getQuestionText(question: Question | undefined): string {
 if (!question) return "Loading..."
 
 switch (question.type) {
   case 'name':
   case 'whos-that-pokemon':
     return "WHO'S THAT POKEMON?"
   case 'type':
     return `WHAT IS ${question.pokemon.name.toUpperCase()}'S TYPE?`
   case 'move':
     return `WHICH MOVE CAN ${question.pokemon.name.toUpperCase()} LEARN?`
   case 'stat':
     const stat = question.pokemon.stats.find(s => s.value.toString() === question.correctAnswer)
     return `WHAT IS ${question.pokemon.name.toUpperCase()}'S ${stat?.name.toUpperCase()} STAT?`
   default:
     return "Unknown question type"
 }
}
