'use client'

import { useState, useEffect } from 'react'
import { Pokemon } from '@/types/pokemon'
import TeamBuilderMode from './components/TeamBuilderMode'
import PokédexMode from './components/PokédexMode'
import QuizMode from './components/QuizMode'
import RegionExplorerMode from './components/RegionExplorerMode'
import ItemsMode from './components/ItemsMode'
import TrainersMode from './components/TrainersMode'
import TCGMode from './components/TCGMode'
import BattleSimulator from '@/components/BattleSimulator'
import { ThemeToggle } from "@/components/ThemeToggle"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const MODES = ['TEAM', 'POKEDEX', 'QUIZ', 'REGION', 'ITEMS', 'TRAINERS', 'TCG', 'BATTLE'] as const
type Mode = typeof MODES[number]

export default function Page() {
  const [mode, setMode] = useState<Mode>('POKEDEX')
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

const fetchAllPokemon = async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    console.log('Fetching Pokemon list...')
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon list: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`Fetched ${data.results.length} Pokemon`)
    
    const detailedPokemon = await Promise.allSettled(
      data.results.map(async (pokemon: any, index: number) => {
        try {
          console.log(`Fetching details for ${pokemon.name} (${index + 1}/${data.results.length})`)
          const detailResponse = await fetch(pokemon.url)
          if (!detailResponse.ok) {
            throw new Error(`Failed to fetch details for ${pokemon.name}`)
          }
          
          const pokemonData = await detailResponse.json()
          
          let region = 'national'
          if (pokemonData.id <= 151) region = 'kanto'
          else if (pokemonData.id <= 251) region = 'johto'
          else if (pokemonData.id <= 386) region = 'hoenn'
          else if (pokemonData.id <= 493) region = 'sinnoh'
          else if (pokemonData.id <= 649) region = 'unova'
          else if (pokemonData.id <= 721) region = 'kalos'
          else if (pokemonData.id <= 809) region = 'alola'
          else if (pokemonData.id <= 898) region = 'galar'
          else if (pokemonData.id <= 1025) region = 'paldea'

          let megaForm = null
          try {
            const megaResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonData.name}-mega`)
            if (megaResponse.ok) {
              const megaData = await megaResponse.json()
              megaForm = {
                name: megaData.name,
                image: megaData.sprites.front_default || megaData.sprites.other['official-artwork'].front_default,
                types: megaData.types.map((t: any) => t.type.name),
                stats: megaData.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat }))
              }
            }
          } catch (error) {
            // Silently handle mega form errors as not all Pokemon have mega forms
          }

          if (pokemonData.is_default) {
            return {
              id: pokemonData.id,
              name: pokemonData.name.split('-')[0],
              image: pokemonData.sprites.front_default,
              officialArtwork: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
              types: pokemonData.types.map((t: any) => t.type.name),
              stats: pokemonData.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat })),
              moves: pokemonData.moves
                .filter((move: any) => move.version_group_details.some((detail: any) => detail.move_learn_method.name === "level-up"))
                .map((move: any) => ({
                  name: move.move.name,
                  level_learned_at: move.version_group_details.find((detail: any) => detail.move_learn_method.name === "level-up").level_learned_at,
                  type: move.move.type
                })),
              tmMoves: pokemonData.moves
                .filter((move: any) => move.version_group_details.some((detail: any) => detail.move_learn_method.name === "machine"))
                .map((move: any) => ({ name: move.move.name, type: move.move.type })),
              height: pokemonData.height / 10,
              weight: pokemonData.weight / 10,
              region: region,
              megaForm: megaForm,
              dynamaxForm: {
                name: `Dynamax ${pokemonData.name}`,
                image: pokemonData.sprites.other['official-artwork'].front_default
              }
            }
          }
          return null
        } catch (error) {
          console.error(`Error fetching details for ${pokemon.name}:`, error)
          return null
        }
      })
    )

    const successfulFetches = detailedPokemon
      .filter((result): result is PromiseFulfilledResult<Pokemon> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)

    console.log(`Successfully fetched details for ${successfulFetches.length} Pokemon`)

    if (successfulFetches.length === 0) {
      throw new Error('Failed to fetch any Pokemon data')
    }

    setPokemonList(successfulFetches)
    setIsLoading(false)
    console.log('Pokemon data loaded successfully')
    toast({
      title: "Pokémon data loaded",
      description: `Successfully loaded ${successfulFetches.length} Pokémon.`,
    })
  } catch (error) {
    console.error('Error fetching Pokemon:', error)
    setError(error instanceof Error ? error.message : 'An unknown error occurred')
    setIsLoading(false)
    toast({
      title: "Error",
      description: "Failed to load Pokémon data. Please try again.",
      variant: "destructive",
    })
  }
}

  useEffect(() => {
    fetchAllPokemon()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F2F2F] text-[#00FFFF] bg-ds-grid p-4 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            <Button 
              onClick={fetchAllPokemon} 
              variant="outline" 
              className="mt-4 w-full"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F2F2F] text-[#00FFFF] bg-ds-grid">
      <div className="gameboy-screen">
        <div className="section-header flex justify-between items-center">
          <div>
            {MODES.map((m) => (
              <button
                key={m}
                className={`px-4 py-2 ${
                  mode === m 
                    ? 'bg-[#18BFBF] text-[#0F2F2F]' 
                    : 'text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)]'
                }`}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <div className="text-lg">Loading Pokémon...</div>
              </div>
            </div>
          ) : (
            <>
              {mode === 'TEAM' && <TeamBuilderMode pokemonList={pokemonList} />}
              {mode === 'POKEDEX' && <PokédexMode pokemonList={pokemonList} />}
              {mode === 'QUIZ' && <QuizMode pokemonList={pokemonList} />}
              {mode === 'REGION' && <RegionExplorerMode />}
              {mode === 'ITEMS' && <ItemsMode />}
              {mode === 'TRAINERS' && <TrainersMode />}
              {mode === 'TCG' && <TCGMode />}
              {mode === 'BATTLE' && <BattleSimulator pokemonList={pokemonList} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
