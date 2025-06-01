"use client"

import { useState, useEffect, Suspense } from "react"
import type { Pokemon } from "@/types/pokemon"
import PokédexMode from "./components/PokédexMode"
import QuizMode from "./components/QuizMode"
import TCGMode from "./components/TCGMode"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, BookOpen, Brain } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PokeSpherelogo } from "@/components/PokeSpherelogo"
import { LoadingPokeball } from "@/components/LoadingPokeball"
import { TradingCardIcon } from "@/components/TradingCardIcon"

const MODES = [
  { id: "POKEDEX", label: "Pokédex", icon: BookOpen },
  { id: "QUIZ", label: "Quiz", icon: Brain },
  { id: "TCG", label: "TCG", icon: TradingCardIcon },
] as const

type Mode = (typeof MODES)[number]["id"]

// Create a cache for Pokemon data
const POKEMON_CACHE_KEY = "pokemon_data_cache_v5" // Updated cache key for improved move data
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Priority order for version groups to get the most relevant move data
const VERSION_GROUP_PRIORITY = [
  "scarlet-violet",
  "sword-shield",
  "sun-moon",
  "ultra-sun-ultra-moon",
  "omega-ruby-alpha-sapphire",
  "x-y",
  "black-white",
  "black-2-white-2",
  "diamond-pearl",
  "platinum",
  "heartgold-soulsilver",
  "ruby-sapphire",
  "emerald",
  "firered-leafgreen",
  "gold-silver",
  "crystal",
  "red-blue",
  "yellow",
]

export default function Page() {
  const [mode, setMode] = useState<Mode>("POKEDEX")
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 })
  const { toast } = useToast()

  const fetchAllPokemon = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if we have cached data that's still valid
      const cachedData = localStorage.getItem(POKEMON_CACHE_KEY)
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY

        if (!isExpired && data && data.length > 0) {
          console.log("Using cached Pokemon data")
          setPokemonList(data)
          setIsLoading(false)
          return
        }
      }

      console.log("Fetching Pokemon list...")
      // Fetch all Pokémon (over 1000)
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1200")
      if (!response.ok) {
        throw new Error(`Failed to fetch Pokemon list: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Fetched ${data.results.length} Pokemon from all generations`)
      setLoadingProgress({ loaded: 0, total: data.results.length })

      // Process Pokemon data in batches
      const pokemonData = []
      const batchSize = 15 // Reduced batch size to avoid rate limiting

      for (let i = 0; i < data.results.length; i += batchSize) {
        const batch = data.results.slice(i, i + batchSize)
        const batchPromises = batch.map(async (pokemon: any) => {
          try {
            const detailResponse = await fetch(pokemon.url)
            if (!detailResponse.ok) {
              return null
            }

            const pokemonData = await detailResponse.json()

            const getRegionByID = (id: number): string => {
              if (id >= 1 && id <= 151) return "kanto"
              if (id >= 152 && id <= 251) return "johto"
              if (id >= 252 && id <= 386) return "hoenn"
              if (id >= 387 && id <= 493) return "sinnoh"
              if (id >= 494 && id <= 649) return "unova"
              if (id >= 650 && id <= 721) return "kalos"
              if (id >= 722 && id <= 809) return "alola"
              if (id >= 810 && id <= 905) return "galar"
              if (id >= 906) return "paldea"
              return "unknown"
            }

            const region = getRegionByID(pokemonData.id)

            if (pokemonData.is_default) {
              // Extract level-up moves with their URLs for later fetching
              const levelUpMoves = pokemonData.moves
                .filter((move: any) =>
                  move.version_group_details.some((detail: any) => detail.move_learn_method.name === "level-up"),
                )
                .slice(0, 30) // Increased limit for more comprehensive movesets
                .map((move: any) => {
                  // Get all level-up details for this move
                  const levelUpDetails = move.version_group_details.filter(
                    (detail: any) => detail.move_learn_method.name === "level-up",
                  )

                  // Find the most recent version group with level-up data
                  let preferredDetail = null

                  // Try to find a version group in our priority list
                  for (const versionGroup of VERSION_GROUP_PRIORITY) {
                    const matchingDetail = levelUpDetails.find(
                      (detail: any) => detail.version_group.name === versionGroup,
                    )
                    if (matchingDetail && matchingDetail.level_learned_at > 0) {
                      preferredDetail = matchingDetail
                      break
                    }
                  }

                  // If no preferred version found, try to find any detail with a valid level
                  if (!preferredDetail) {
                    preferredDetail = levelUpDetails.find(
                      (detail: any) => detail.level_learned_at && detail.level_learned_at > 0,
                    )
                  }

                  // Final fallback to first available
                  if (!preferredDetail) {
                    preferredDetail = levelUpDetails[0]
                  }

                  // Extract the level, ensuring it's a valid number
                  let learnLevel = 1 // Default fallback
                  if (preferredDetail?.level_learned_at) {
                    const level = Number.parseInt(preferredDetail.level_learned_at)
                    if (!isNaN(level) && level > 0) {
                      learnLevel = level
                    }
                  }

                  return {
                    name: move.move.name,
                    level_learned_at: learnLevel,
                    type: "normal", // Default type, will be updated with actual data
                    url: move.move.url,
                    power: null,
                    accuracy: null,
                    pp: 20,
                    category: "physical",
                    version_group: preferredDetail?.version_group?.name || "unknown",
                  }
                })
                .sort((a: any, b: any) => a.level_learned_at - b.level_learned_at)

              return {
                id: pokemonData.id,
                name: pokemonData.name.split("-")[0],
                image: pokemonData.sprites.front_default,
                officialArtwork:
                  pokemonData.sprites.other["official-artwork"].front_default || pokemonData.sprites.front_default,
                types: pokemonData.types.map((t: any) => t.type.name),
                stats: pokemonData.stats.map((s: any) => ({
                  name: s.stat.name,
                  value: s.base_stat,
                  base_value: s.base_stat,
                })),
                moves: levelUpMoves,
                tmMoves: pokemonData.moves
                  .filter((move: any) =>
                    move.version_group_details.some((detail: any) => detail.move_learn_method.name === "machine"),
                  )
                  .slice(0, 10) // Limit TM moves as well
                  .map((move: any) => ({ name: move.move.name, type: "normal" })),
                height: pokemonData.height / 10,
                weight: pokemonData.weight / 10,
                region: region,
                level: 50,
                ability: pokemonData.abilities[0]?.ability.name || "None",
                nature: "Hardy",
                moveset: [],
              }
            }
            return null
          } catch (error) {
            console.error(`Error fetching details for ${pokemon.name}:`, error)
            return null
          }
        })

        const batchResults = await Promise.all(batchPromises)
        const validResults = batchResults.filter(Boolean)
        pokemonData.push(...validResults)

        // Update the state incrementally as batches complete
        if (pokemonData.length > 0) {
          setPokemonList([...pokemonData])
          setLoadingProgress({ loaded: pokemonData.length, total: data.results.length })
        }

        // Add delay between batches to avoid rate limiting
        await delay(100)
      }

      if (pokemonData.length === 0) {
        throw new Error("Failed to fetch any Pokemon data")
      }

      // Now fetch move types for a subset of Pokemon to avoid too many API calls
      console.log("Fetching move types...")
      const pokemonWithMoveTypes = await Promise.all(
        pokemonData.slice(0, 500).map(async (pokemon, index) => {
          // Only process first 500 Pokemon
          try {
            // Add delay between Pokemon to avoid rate limiting
            if (index > 0 && index % 10 === 0) {
              await delay(200)
            }

            // Fetch move types with better error handling
            const movesWithTypes = await Promise.all(
              pokemon.moves.slice(0, 20).map(async (move) => {
                // Limit to 20 moves per Pokemon
                try {
                  const moveResponse = await fetch(move.url)
                  if (!moveResponse.ok) {
                    console.warn(`Failed to fetch move ${move.name}: ${moveResponse.status}`)
                    return {
                      ...move,
                      type: pokemon.types[0] || "normal", // Use Pokemon's primary type as fallback
                    }
                  }
                  const moveData = await moveResponse.json()
                  return {
                    ...move,
                    type: moveData.type?.name || "normal",
                    power: moveData.power || null,
                    accuracy: moveData.accuracy || null,
                    pp: moveData.pp || 20,
                    category: moveData.damage_class?.name || "physical",
                    version_group: move.version_group || "unknown",
                  }
                } catch (error) {
                  console.warn(`Error fetching move ${move.name}:`, error)
                  return {
                    ...move,
                    type: pokemon.types[0] || "normal", // Use Pokemon's primary type as fallback
                  }
                }
              }),
            )

            return {
              ...pokemon,
              moves: movesWithTypes,
            }
          } catch (error) {
            console.error(`Error fetching move types for ${pokemon.name}:`, error)
            return pokemon // Return pokemon with default move types on error
          }
        }),
      )

      // For remaining Pokemon, just use the basic data without detailed move info
      const remainingPokemon = pokemonData.slice(500).map((pokemon) => ({
        ...pokemon,
        moves: pokemon.moves.map((move) => ({
          ...move,
          type: pokemon.types[0] || "normal", // Use Pokemon's primary type as fallback
        })),
      }))

      const finalPokemonList = [...pokemonWithMoveTypes, ...remainingPokemon]

      // Cache the data with move types
      localStorage.setItem(
        POKEMON_CACHE_KEY,
        JSON.stringify({
          data: finalPokemonList,
          timestamp: Date.now(),
        }),
      )

      setPokemonList(finalPokemonList)
      setIsLoading(false)
      console.log("Pokemon data loaded successfully")
      toast({
        title: "Pokémon data loaded",
        description: `Successfully loaded ${finalPokemonList.length} Pokémon from all regions.`,
      })
    } catch (error) {
      console.error("Error fetching Pokemon:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            <Button onClick={fetchAllPokemon} variant="outline" className="mt-4 w-full">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const renderActiveMode = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="flex flex-col items-center gap-6">
            <LoadingPokeball />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Pokémon Data</h3>
              <p className="text-gray-500 mb-4">Please wait while we fetch the latest information...</p>
              {loadingProgress.total > 0 && (
                <div className="w-64 mx-auto">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Loaded {loadingProgress.loaded} of {loadingProgress.total} Pokémon
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    switch (mode) {
      case "POKEDEX":
        return <PokédexMode pokemonList={pokemonList} />
      case "QUIZ":
        return <QuizMode pokemonList={pokemonList} />
      case "TCG":
        return <TCGMode />
      default:
        return <PokédexMode pokemonList={pokemonList} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PokeSpherelogo />
              </div>
            </div>

            {/* Enhanced Navigation */}
            <nav className="hidden md:flex space-x-3">
              {MODES.map((modeOption) => {
                const Icon = modeOption.icon
                return (
                  <button
                    key={modeOption.id}
                    onClick={() => setMode(modeOption.id)}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                      mode === modeOption.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{modeOption.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Enhanced Mobile Navigation */}
            <div className="md:hidden">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {MODES.map((modeOption) => (
                  <option key={modeOption.id} value={modeOption.id}>
                    {modeOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <LoadingPokeball />
            </div>
          }
        >
          {renderActiveMode()}
        </Suspense>
      </main>
    </div>
  )
}
