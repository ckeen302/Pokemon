import { Pokemon } from '@/types/pokemon'

interface PokemonCardProps {
  pokemon: Pokemon
  selected?: boolean
  onSelect?: () => void
  megaDynamaxMode: boolean
  showAbilityAndNature?: boolean
}

export default function PokemonCard({ pokemon, selected, onSelect, megaDynamaxMode, showAbilityAndNature }: PokemonCardProps) {
  const displayedPokemon = megaDynamaxMode && (pokemon.megaForm || pokemon.dynamaxForm) 
    ? (pokemon.megaForm || pokemon.dynamaxForm || pokemon)
    : pokemon

  return (
    <div 
      className={`pokemon-entry cursor-pointer text-[#00FFFF] ${selected ? 'bg-[#306230]' : ''}`}
      onClick={onSelect}
    >
      <span className="w-8 text-right">#{String(pokemon.id).padStart(3, '0')}</span>
      <div className="w-16 h-16 bg-[rgba(24,191,191,0.1)] flex items-center justify-center rounded">
        <img 
          src={displayedPokemon.officialArtwork || displayedPokemon.image || pokemon.officialArtwork || pokemon.image || "/placeholder.svg"} 
          alt={displayedPokemon.name || pokemon.name} 
          className="w-14 h-14 object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="pokemon-name text-[#00FFFF]">
          {(displayedPokemon.name || pokemon.name).toUpperCase()} L{pokemon.level}
        </span>
        {showAbilityAndNature && (
          <>
            <span className="text-xs text-[#00FFFF]">Ability: {pokemon.ability}</span>
            <span className="text-xs text-[#00FFFF]">Nature: {pokemon.nature}</span>
          </>
        )}
      </div>
    </div>
  )
}

