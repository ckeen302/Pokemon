import { Pokemon } from '@/types/pokemon'

interface SavedTeamsProps {
  onLoadTeam: (team: Pokemon[]) => void
}

export function SavedTeams({ onLoadTeam }: SavedTeamsProps) {
  // Implement saved teams logic here
  return (
    <div className="pokemon-entry bg-[#306230]">
      <span className="pokemon-name">SAVED TEAMS</span>
      {/* Add saved teams functionality here */}
    </div>
  )
}

