import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Pokemon } from '@/types/pokemon'

interface TeamRatingProps {
  team: Pokemon[]
}

const MAX_TEAM_SIZE = 6

const typeEffectiveness: { [key: string]: { strengths: string[], weaknesses: string[] } } = {
  normal: { strengths: [], weaknesses: ['fighting'] },
  fire: { strengths: ['grass', 'ice', 'bug', 'steel'], weaknesses: ['water', 'ground', 'rock'] },
  water: { strengths: ['fire', 'ground', 'rock'], weaknesses: ['electric', 'grass'] },
  electric: { strengths: ['water', 'flying'], weaknesses: ['ground'] },
  grass: { strengths: ['water', 'ground', 'rock'], weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'] },
  ice: { strengths: ['grass', 'ground', 'flying', 'dragon'], weaknesses: ['fire', 'fighting', 'rock', 'steel'] },
  fighting: { strengths: ['normal', 'ice', 'rock', 'dark', 'steel'], weaknesses: ['flying', 'psychic', 'fairy'] },
  poison: { strengths: ['grass', 'fairy'], weaknesses: ['ground', 'psychic'] },
  ground: { strengths: ['fire', 'electric', 'poison', 'rock', 'steel'], weaknesses: ['water', 'grass', 'ice'] },
  flying: { strengths: ['grass', 'fighting', 'bug'], weaknesses: ['electric', 'ice', 'rock'] },
  psychic: { strengths: ['fighting', 'poison'], weaknesses: ['bug', 'ghost', 'dark'] },
  bug: { strengths: ['grass', 'psychic', 'dark'], weaknesses: ['fire', 'flying', 'rock'] },
  rock: { strengths: ['fire', 'ice', 'flying', 'bug'], weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'] },
  ghost: { strengths: ['psychic', 'ghost'], weaknesses: ['ghost', 'dark'] },
  dragon: { strengths: ['dragon'], weaknesses: ['ice', 'dragon', 'fairy'] },
  dark: { strengths: ['psychic', 'ghost'], weaknesses: ['fighting', 'bug', 'fairy'] },
  steel: { strengths: ['ice', 'rock', 'fairy'], weaknesses: ['fire', 'fighting', 'ground'] },
  fairy: { strengths: ['fighting', 'dragon', 'dark'], weaknesses: ['poison', 'steel'] },
}

export default function TeamRating({ team }: TeamRatingProps) {
  const [typeCoverageScore, setTypeCoverageScore] = useState(0)
  const [statsBalanceScore, setStatsBalanceScore] = useState(0)
  const [teamSizeScore, setTeamSizeScore] = useState(0)
  const [overallScore, setOverallScore] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    calculateRatings()
  }, [team])

  const calculateRatings = () => {
    const typeCoverage = calculateTypeCoverage()
    const statsBalance = calculateStatsBalance()
    const teamSize = calculateTeamSize()

    setTypeCoverageScore(typeCoverage)
    setStatsBalanceScore(statsBalance)
    setTeamSizeScore(teamSize)

    const overall = (typeCoverage + statsBalance + teamSize) / 3
    setOverallScore(overall)

    generateSuggestions(typeCoverage, statsBalance, teamSize)
  }

  const calculateTypeCoverage = () => {
    const coveredTypes = new Set<string>()
    const weaknesses = new Set<string>()

    team.forEach(pokemon => {
      if (pokemon && pokemon.types) {
        pokemon.types.forEach(type => {
          if (typeEffectiveness[type]) {
            typeEffectiveness[type].strengths.forEach(strength => coveredTypes.add(strength))
            typeEffectiveness[type].weaknesses.forEach(weakness => weaknesses.add(weakness))
          }
        })
      }
    })

    const coverage = coveredTypes.size / Object.keys(typeEffectiveness).length
    const weaknessRatio = 1 - (weaknesses.size / Object.keys(typeEffectiveness).length)

    return (coverage + weaknessRatio) * 50 // Scale to 0-100
  }

  const calculateStatsBalance = () => {
    if (team.length === 0) return 0

    const statTotals = {
      hp: 0,
      attack: 0,
      defense: 0,
      'special-attack': 0,
      'special-defense': 0,
      speed: 0,
    }

    team.forEach(pokemon => {
      if (pokemon && pokemon.stats) {
        pokemon.stats.forEach(stat => {
          statTotals[stat.name as keyof typeof statTotals] += stat.value
        })
      }
    })

    const statAverages = Object.values(statTotals).map(total => total / team.length)
    const overallAverage = statAverages.reduce((sum, stat) => sum + stat, 0) / 6

    const variance = statAverages.reduce((sum, stat) => sum + Math.pow(stat - overallAverage, 2), 0) / 6
    const standardDeviation = Math.sqrt(variance)

    // Lower standard deviation means better balance
    const balanceScore = 100 - (standardDeviation / overallAverage) * 100
    return Math.max(0, Math.min(100, balanceScore))
  }

  const calculateTeamSize = () => {
    return (team.length / MAX_TEAM_SIZE) * 100
  }

  const generateSuggestions = (typeCoverage: number, statsBalance: number, teamSize: number) => {
    const newSuggestions: string[] = []

    if (typeCoverage < 60) {
      newSuggestions.push("Consider adding Pokémon with different types to improve type coverage.")
    }

    if (statsBalance < 60) {
      newSuggestions.push("Try to balance your team's stats by including Pokémon with diverse stat distributions.")
    }

    if (teamSize < 100) {
      newSuggestions.push(`Add ${MAX_TEAM_SIZE - team.length} more Pokémon to complete your team.`)
    }

    if (newSuggestions.length === 0) {
      newSuggestions.push("Great job! Your team looks well-balanced. Keep experimenting to find the perfect combination.")
    }

    setSuggestions(newSuggestions)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Team Rating</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
            <div className="flex items-center">
              <Progress value={overallScore} className="flex-grow mr-4" />
              <span className={`text-xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore.toFixed(1)}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Type Coverage</h3>
            <div className="flex items-center">
              <Progress value={typeCoverageScore} className="flex-grow mr-4" />
              <span className={`text-xl font-bold ${getScoreColor(typeCoverageScore)}`}>
                {typeCoverageScore.toFixed(1)}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Stats Balance</h3>
            <div className="flex items-center">
              <Progress value={statsBalanceScore} className="flex-grow mr-4" />
              <span className={`text-xl font-bold ${getScoreColor(statsBalanceScore)}`}>
                {statsBalanceScore.toFixed(1)}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Team Size</h3>
            <div className="flex items-center">
              <Progress value={teamSizeScore} className="flex-grow mr-4" />
              <span className={`text-xl font-bold ${getScoreColor(teamSizeScore)}`}>
                {teamSizeScore.toFixed(1)}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Suggestions for Improvement</h3>
            <ul className="list-disc pl-5 space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

