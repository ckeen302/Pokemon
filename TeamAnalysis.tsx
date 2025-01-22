import { Pokemon } from '@/types/pokemon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface TeamAnalysisProps {
  team: Pokemon[]
  onChangePosition: (fromIndex: number, toIndex: number) => void
}

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

export default function TeamAnalysis({ team, onChangePosition }: TeamAnalysisProps) {
  const validTeam = team.filter(pokemon => pokemon && pokemon.id !== undefined);

  const analyzeTeam = () => {
    const typeCount: { [key: string]: number } = {}
    const strengths: { [key: string]: number } = {}
    const weaknesses: { [key: string]: number } = {}

    validTeam.forEach(pokemon => {
      if (pokemon && pokemon.types) {
        pokemon.types.forEach(type => {
          typeCount[type] = (typeCount[type] || 0) + 1
          if (typeEffectiveness[type]) {
            typeEffectiveness[type].strengths.forEach(strength => {
              strengths[strength] = (strengths[strength] || 0) + 1
            })
            typeEffectiveness[type].weaknesses.forEach(weakness => {
              weaknesses[weakness] = (weaknesses[weakness] || 0) + 1
            })
          }
        })
      }
    })

    return { typeCount, strengths, weaknesses }
  }

  const { typeCount, strengths, weaknesses } = analyzeTeam()

  const calculateAverageStats = () => {
    const totalStats = validTeam.reduce((acc, pokemon) => {
      if (pokemon && pokemon.stats) {
        pokemon.stats.forEach(stat => {
          acc[stat.name] = (acc[stat.name] || 0) + stat.value
        })
      }
      return acc
    }, {} as { [key: string]: number })

    return Object.entries(totalStats).map(([name, total]) => ({
      name,
      average: Math.round(total / validTeam.length)
    }))
  }

  const averageStats = calculateAverageStats()

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    onChangePosition(result.source.index, result.destination.index)
  }

  if (validTeam.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Add Pokémon to your team to see the analysis.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(typeCount).map(([type, count]) => (
            <div key={type} className="flex items-center mb-2">
              <span className="w-20 capitalize">{type}:</span>
              <Progress value={count} max={validTeam.length} className="flex-grow" />
              <span className="ml-2">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Type Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-bold mb-2">Strengths:</h3>
          {Object.entries(strengths).map(([type, count]) => (
            <div key={type} className="flex items-center mb-2">
              <span className="w-20 capitalize">{type}:</span>
              <Progress value={count} max={validTeam.length * 2} className="flex-grow" />
              <span className="ml-2">{count}</span>
            </div>
          ))}
          <h3 className="font-bold mt-4 mb-2">Weaknesses:</h3>
          {Object.entries(weaknesses).map(([type, count]) => (
            <div key={type} className="flex items-center mb-2">
              <span className="w-20 capitalize">{type}:</span>
              <Progress value={count} max={validTeam.length * 2} className="flex-grow" />
              <span className="ml-2">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Team Lineup</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="team">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {validTeam.map((pokemon, index) => (
                    <Draggable key={pokemon.id ? pokemon.id.toString() : `temp-${index}`} draggableId={pokemon.id ? pokemon.id.toString() : `temp-${index}`} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center p-2 mb-2 bg-gray-100 rounded"
                        >
                          <img src={pokemon.image} alt={pokemon.name} className="w-12 h-12 mr-4" />
                          <span>{pokemon.name}</span>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Average Team Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {averageStats.map(stat => (
            <div key={stat.name} className="flex items-center mb-2">
              <span className="w-32 capitalize">{stat.name}:</span>
              <Progress value={stat.average} max={255} className="flex-grow" />
              <span className="ml-2">{stat.average}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

