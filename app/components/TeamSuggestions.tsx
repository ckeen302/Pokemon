import { Pokemon } from '@/types/pokemon'

interface TeamSuggestionsProps {
  team: Pokemon[]
  pokemonList: Pokemon[]
}

export function TeamSuggestions({ team, pokemonList }: TeamSuggestionsProps) {
  // Implement team suggestions logic here
  return (
    <div className="pokemon-entry bg-[#306230]">
      <span className="pokemon-name">TEAM SUGGESTIONS</span>
      {/* Add suggestion logic here */}
    </div>
  )
}

