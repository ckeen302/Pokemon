import { Pokemon } from '@/types/pokemon'

interface TeamRatingProps {
  team: Pokemon[]
}

export function TeamRating({ team }: TeamRatingProps) {
  // Implement team rating logic here
  return (
    <div className="pokemon-entry bg-[#306230]">
      <span className="pokemon-name">TEAM RATING</span>
      {/* Add rating logic here */}
    </div>
  )
}

