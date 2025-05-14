import { Pokemon } from '@/types/pokemon'

interface TeamSharingProps {
  team: Pokemon[]
}

export function TeamSharing({ team }: TeamSharingProps) {
  // Implement team sharing logic here
  return (
    <div className="pokemon-entry bg-[#306230]">
      <span className="pokemon-name">SHARE TEAM</span>
      {/* Add sharing functionality here */}
    </div>
  )
}

