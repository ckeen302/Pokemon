import React from 'react'
import { Pokemon } from '@/types/pokemon'
import { Progress } from "@/components/ui/progress"

interface BattleVisualizationProps {
  team1: Pokemon[]
  team2: Pokemon[]
  hp1: number[]
  hp2: number[]
  maxHp1: number[]
  maxHp2: number[]
  currentIndex1: number
  currentIndex2: number
}

const BattleVisualization: React.FC<BattleVisualizationProps> = ({
  team1,
  team2,
  hp1,
  hp2,
  maxHp1,
  maxHp2,
  currentIndex1,
  currentIndex2
}) => {
  const renderPokemon = (pokemon: Pokemon, hp: number, maxHp: number, isCurrent: boolean, index: number) => (
    <div key={`${pokemon.id}-${index}`} className={`flex flex-col items-center ${isCurrent ? 'border-2 border-yellow-400 p-2 rounded' : ''}`}>
      <img
        src={pokemon.officialArtwork || pokemon.image || "/placeholder.svg"}
        alt={pokemon.name}
        className={`w-16 h-16 object-contain ${hp === 0 ? 'opacity-50 grayscale' : ''}`}
      />
      <h3 className="text-sm font-bold mt-1 text-[#00FFFF]">{pokemon.name}</h3>
      <Progress value={(hp / maxHp) * 100} className="w-16 mt-1" />
      <p className="text-xs mt-1 text-[#00FFFF]">{`${hp}/${maxHp} HP`}</p>
    </div>
  )

  return (
    <div className="flex justify-between items-center p-4 bg-[rgba(24,191,191,0.2)] rounded-lg text-[#00FFFF]">
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2">Team 1</h2>
        <div className="grid grid-cols-3 gap-4">
          {team1.map((pokemon, index) => renderPokemon(
            pokemon,
            hp1[index],
            maxHp1[index],
            index === currentIndex1,
            index
          ))}
        </div>
      </div>
      <div className="text-4xl font-bold text-[#00FFFF]">VS</div>
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2">Team 2</h2>
        <div className="grid grid-cols-3 gap-4">
          {team2.map((pokemon, index) => renderPokemon(
            pokemon,
            hp2[index],
            maxHp2[index],
            index === currentIndex2,
            index
          ))}
        </div>
      </div>
    </div>
  )
}

export default BattleVisualization

