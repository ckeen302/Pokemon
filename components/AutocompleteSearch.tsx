import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Pokemon, Move } from '@/types/pokemon'

interface AutocompleteSearchProps {
  onSelect: (pokemon: Pokemon) => void
}

export default function AutocompleteSearch({ onSelect }: AutocompleteSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [allPokemon, setAllPokemon] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
        const data = await response.json()
        const pokemonNames = data.results.map((pokemon: { name: string }) => pokemon.name)
        setAllPokemon(pokemonNames)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching Pokémon list:', error)
        setIsLoading(false)
      }
    }

    fetchAllPokemon()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filteredSuggestions = allPokemon.filter(pokemon =>
        pokemon.toLowerCase().startsWith(searchTerm.toLowerCase())
      )
      setSuggestions(filteredSuggestions.slice(0, 10))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm, allPokemon])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSelectPokemon = async (pokemonName: string) => {
    setSearchTerm(pokemonName)
    setShowSuggestions(false)
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      const moves: Move[] = await Promise.all(
        data.moves
          .filter((move: any) => move.version_group_details.some((detail: any) => detail.move_learn_method.name === "level-up"))
          .map(async (move: any) => {
            const moveResponse = await fetch(move.move.url);
            const moveData = await moveResponse.json();
            return {
              name: move.move.name,
              level_learned_at: move.version_group_details.find((detail: any) => detail.move_learn_method.name === "level-up").level_learned_at,
              type: moveData.type.name
            };
          })
      );

      const tmMoves: { name: string; type: string }[] = await Promise.all(
        data.moves
          .filter((move: any) => move.version_group_details.some((detail: any) => detail.move_learn_method.name === "machine"))
          .map(async (move: any) => {
            const moveResponse = await fetch(move.move.url);
            const moveData = await moveResponse.json();
            return {
              name: move.move.name,
              type: moveData.type.name
            };
          })
      );

      const pokemon: Pokemon = {
        id: data.id,
        name: data.name,
        image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        types: data.types.map((type: any) => type.type.name),
        stats: data.stats.map((stat: any) => ({
          name: stat.stat.name,
          value: stat.base_stat
        })),
        moves: moves,
        tmMoves: tmMoves,
        height: data.height / 10, // Convert to meters
        weight: data.weight / 10, // Convert to kilograms
      }
      onSelect(pokemon)
    } catch (error) {
      console.error('Error fetching Pokémon details:', error)
      alert('Failed to fetch Pokémon details. Please try again.')
    }
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="flex">
        <Input
          type="text"
          placeholder={isLoading ? "Loading Pokémon..." : "Enter Pokémon name"}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          className="flex-grow border-2 border-gray-300"
          disabled={isLoading}
        />
        <Button 
          onClick={() => handleSelectPokemon(searchTerm)} 
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold"
        >
          Search
        </Button>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ScrollArea className="absolute z-10 w-full max-h-60 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {suggestions.map((pokemon, index) => (
            <div
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectPokemon(pokemon)}
            >
              {pokemon}
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  )
}

