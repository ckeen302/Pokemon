import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pokemon } from '@/types/pokemon'

interface TeamSelectionModalProps {
  team: Pokemon[]
  newPokemon: Pokemon
  onClose: () => void
  onAddPokemon: (pokemon: Pokemon, index?: number) => void
}

export function TeamSelectionModal({ team, newPokemon, onClose, onAddPokemon }: TeamSelectionModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleAddPokemon = () => {
    onAddPokemon(newPokemon, selectedIndex !== null ? selectedIndex : undefined)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {newPokemon.name} to Your Team</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <p>Select a position to add or replace:</p>
          <div className="grid grid-cols-3 gap-2">
            {team.map((pokemon, index) => (
              <Button
                key={pokemon.id}
                variant={selectedIndex === index ? "default" : "outline"}
                onClick={() => setSelectedIndex(index)}
              >
                {pokemon.name} (Position {index + 1})
              </Button>
            ))}
            {team.length < 6 && (
              <Button
                variant={selectedIndex === team.length ? "default" : "outline"}
                onClick={() => setSelectedIndex(team.length)}
              >
                New Position {team.length + 1}
              </Button>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleAddPokemon} disabled={selectedIndex === null}>
              {selectedIndex !== null && selectedIndex < team.length ? 'Replace' : 'Add'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

