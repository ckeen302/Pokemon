"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowLeft, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import type { Pokemon } from "@/types/pokemon"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface PokédexModeProps {
  pokemonList: Pokemon[]
}

// Type badge colors matching official site
const TYPE_COLORS: Record<string, string> = {
  normal: "bg-[#A8A878] text-white",
  fire: "bg-[#F08030] text-white",
  water: "bg-[#6890F0] text-white",
  electric: "bg-[#F8D030] text-white",
  grass: "bg-[#78C850] text-white",
  ice: "bg-[#98D8D8] text-white",
  fighting: "bg-[#C03028] text-white",
  poison: "bg-[#A040A0] text-white",
  ground: "bg-[#E0C068] text-white",
  flying: "bg-[#A890F0] text-white",
  psychic: "bg-[#F85888] text-white",
  bug: "bg-[#A8B820] text-white",
  rock: "bg-[#B8A038] text-white",
  ghost: "bg-[#705898] text-white",
  dragon: "bg-[#7038F8] text-white",
  dark: "bg-[#705848] text-white",
  steel: "bg-[#B8B8D0] text-white",
  fairy: "bg-[#EE99AC] text-white",
}

const PokemonCard = memo(({ pokemon, onClick }: { pokemon: Pokemon; onClick: () => void }) => {
  return (
    <div
      className="bg-gray-50 rounded-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-md"
      onClick={onClick}
    >
      <div className="p-4 flex items-center justify-center bg-white">
        <img
          src={pokemon.officialArtwork || pokemon.image || "/placeholder.svg"}
          alt={pokemon.name}
          className="w-28 h-28 object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-3 text-center">
        <div className="text-gray-500 text-xs mb-1">#{String(pokemon.id).padStart(3, "0")}</div>
        <h3 className="font-semibold text-gray-900 capitalize mb-2">{pokemon.name}</h3>
        <div className="flex justify-center gap-1 flex-wrap">
          {pokemon.types.map((type) => (
            <Badge key={type} className={`${TYPE_COLORS[type]} text-xs px-2 py-1 rounded-full`}>
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
})

PokemonCard.displayName = "PokemonCard"

export default function PokédexMode({ pokemonList }: PokédexModeProps) {
  const [filter, setFilter] = useState("")
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [visiblePokemon, setVisiblePokemon] = useState<Pokemon[]>([])
  const [isFiltering, setIsFiltering] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsFiltering(true)
    const timer = setTimeout(() => {
      let filtered = pokemonList

      // Filter by region
      if (selectedRegion !== "all") {
        filtered = filtered.filter((pokemon) => pokemon.region === selectedRegion)
      }

      // Filter by search query (name or number)
      if (filter.trim()) {
        const searchTerm = filter.toLowerCase().trim()
        filtered = filtered.filter((pokemon) => {
          const matchesName = pokemon.name.toLowerCase().includes(searchTerm)
          const matchesId = pokemon.id.toString().includes(searchTerm)
          const matchesPaddedId = String(pokemon.id).padStart(3, "0").includes(searchTerm)
          return matchesName || matchesId || matchesPaddedId
        })
      }

      setVisiblePokemon(filtered)
      setIsFiltering(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [filter, selectedRegion, pokemonList])

  const handleSelectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon)
  }

  // Find the index of the current Pokémon in the filtered list
  const getCurrentPokemonIndex = useCallback(() => {
    if (!selectedPokemon) return -1
    return visiblePokemon.findIndex((p) => p.id === selectedPokemon.id)
  }, [selectedPokemon, visiblePokemon])

  // Navigate to the next Pokémon
  const goToNextPokemon = useCallback(() => {
    const currentIndex = getCurrentPokemonIndex()
    if (currentIndex < visiblePokemon.length - 1) {
      setSelectedPokemon(visiblePokemon[currentIndex + 1])
      // Scroll to top when changing Pokémon
      window.scrollTo({ top: 0, behavior: "smooth" })
      return true
    }
    toast({
      title: "End of Pokédex",
      description: "You've reached the last Pokémon in this filtered list.",
    })
    return false
  }, [getCurrentPokemonIndex, visiblePokemon, toast])

  // Navigate to the previous Pokémon
  const goToPreviousPokemon = useCallback(() => {
    const currentIndex = getCurrentPokemonIndex()
    if (currentIndex > 0) {
      setSelectedPokemon(visiblePokemon[currentIndex - 1])
      // Scroll to top when changing Pokémon
      window.scrollTo({ top: 0, behavior: "smooth" })
      return true
    }
    toast({
      title: "Start of Pokédex",
      description: "You've reached the first Pokémon in this filtered list.",
    })
    return false
  }, [getCurrentPokemonIndex, visiblePokemon, toast])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPokemon) return

      if (e.key === "ArrowRight") {
        goToNextPokemon()
      } else if (e.key === "ArrowLeft") {
        goToPreviousPokemon()
      } else if (e.key === "Escape") {
        setSelectedPokemon(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedPokemon, goToNextPokemon, goToPreviousPokemon])

  const SelectedPokemonView = ({ pokemon, onBack }: { pokemon: Pokemon; onBack: () => void }) => {
    const currentIndex = getCurrentPokemonIndex()
    const isFirst = currentIndex === 0
    const isLast = currentIndex === visiblePokemon.length - 1

    // Group moves by type for better organization
    const movesByType = pokemon.moves.reduce(
      (acc, move) => {
        const type = move.type || "unknown"
        if (!acc[type]) acc[type] = []
        acc[type].push(move)
        return acc
      },
      {} as Record<string, typeof pokemon.moves>,
    )

    // Sort types by number of moves (descending)
    const sortedTypes = Object.keys(movesByType).sort((a, b) => movesByType[b].length - movesByType[a].length)

    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Pokédex
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={goToPreviousPokemon}
              variant="outline"
              disabled={isFirst}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {visiblePokemon.length}
            </span>
            <Button onClick={goToNextPokemon} variant="outline" disabled={isLast} className="flex items-center gap-1">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with Pokemon name and ID */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold capitalize mb-2">{pokemon.name}</h1>
                <p className="text-blue-100 text-lg">#{String(pokemon.id).padStart(3, "0")}</p>
              </div>
              <div className="flex gap-3">
                {pokemon.types.map((type) => (
                  <Badge key={type} className={`${TYPE_COLORS[type]} text-lg px-6 py-2 rounded-full shadow-lg`}>
                    {type.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="p-8 space-y-8">
            {/* Top section - Image and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column - Image and basic info */}
              <div className="space-y-6">
                {/* Pokemon image */}
                <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-6 flex items-center justify-center border-2 border-gray-200 shadow-inner min-h-[350px]">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-8 left-8 w-24 h-24 bg-blue-300 rounded-full blur-xl"></div>
                    <div className="absolute bottom-8 right-8 w-32 h-32 bg-purple-300 rounded-full blur-xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-200 rounded-full blur-2xl"></div>
                  </div>

                  {/* Pokemon image */}
                  <div className="relative z-10">
                    <img
                      src={pokemon.officialArtwork || pokemon.image || "/placeholder.svg"}
                      alt={pokemon.name}
                      className="w-72 h-72 object-contain drop-shadow-2xl"
                    />
                  </div>

                  {/* Floating ID badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
                    <span className="text-sm font-bold text-gray-600">#{String(pokemon.id).padStart(3, "0")}</span>
                  </div>
                </div>

                {/* Height and Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200">
                    <h4 className="font-semibold text-blue-700 mb-2">Height</h4>
                    <p className="text-3xl font-bold text-blue-900">{pokemon.height}m</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border border-purple-200">
                    <h4 className="font-semibold text-purple-700 mb-2">Weight</h4>
                    <p className="text-3xl font-bold text-purple-900">{pokemon.weight}kg</p>
                  </div>
                </div>
              </div>

              {/* Right column - Base Stats */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                    Base Stats
                  </h3>
                  <div className="space-y-4">
                    {pokemon.stats.map((stat) => (
                      <div key={stat.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700 capitalize">{stat.name.replace("-", " ")}</span>
                          <span className="font-bold text-gray-900 bg-white px-4 py-2 rounded-full shadow-sm min-w-[60px] text-center">
                            {stat.value}
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{ width: `${Math.min((stat.value / 255) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Full-width Moves section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                  Moves by Type
                </h4>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {pokemon.moves.length > 0 ? (
                  <div className="p-6 space-y-8">
                    {sortedTypes.map((type) => (
                      <div key={type} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h5 className="text-lg font-semibold text-gray-800 capitalize">{type} Moves</h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {movesByType[type].map((move, index) => (
                            <div
                              key={`${move.name}-${index}`}
                              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-gray-900 capitalize text-sm">
                                  {move.name.replace(/-/g, " ")}
                                </h5>
                                <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-full">
                                  Lv. {move.level_learned_at}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                                {move.power && (
                                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full">
                                    Power: {move.power}
                                  </span>
                                )}
                                {move.accuracy && (
                                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                    Acc: {move.accuracy}%
                                  </span>
                                )}
                                {move.category && (
                                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full capitalize">
                                    {move.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <p className="text-lg">No move data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom navigation for mobile */}
        <div className="mt-6 flex items-center justify-between md:hidden">
          <Button onClick={goToPreviousPokemon} variant="outline" disabled={isFirst} className="flex-1 mr-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button onClick={goToNextPokemon} variant="outline" disabled={isLast} className="flex-1 ml-2">
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  if (selectedPokemon) {
    return (
      <div className="fade-in">
        <SelectedPokemonView pokemon={selectedPokemon} onBack={() => setSelectedPokemon(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Pokédex</h2>
          <p className="text-gray-600 mt-1">Discover and explore Pokémon</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search Pokémon by name or number (e.g., 'Pikachu' or '025')..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 search-input"
            />
          </div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions ({pokemonList.length})</SelectItem>
              <SelectItem value="kanto">Kanto ({pokemonList.filter((p) => p.region === "kanto").length})</SelectItem>
              <SelectItem value="johto">Johto ({pokemonList.filter((p) => p.region === "johto").length})</SelectItem>
              <SelectItem value="hoenn">Hoenn ({pokemonList.filter((p) => p.region === "hoenn").length})</SelectItem>
              <SelectItem value="sinnoh">Sinnoh ({pokemonList.filter((p) => p.region === "sinnoh").length})</SelectItem>
              <SelectItem value="unova">Unova ({pokemonList.filter((p) => p.region === "unova").length})</SelectItem>
              <SelectItem value="kalos">Kalos ({pokemonList.filter((p) => p.region === "kalos").length})</SelectItem>
              <SelectItem value="alola">Alola ({pokemonList.filter((p) => p.region === "alola").length})</SelectItem>
              <SelectItem value="galar">Galar ({pokemonList.filter((p) => p.region === "galar").length})</SelectItem>
              <SelectItem value="paldea">Paldea ({pokemonList.filter((p) => p.region === "paldea").length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(filter || selectedRegion !== "all") && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {visiblePokemon.length} of {pokemonList.length} Pokémon
            {selectedRegion !== "all" && ` from ${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}`}
            {filter && ` matching "${filter}"`}
          </div>
        )}
      </div>

      {/* Pokemon Grid */}
      <div className="fade-in">
        {isFiltering ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Filtering Pokémon...</span>
          </div>
        ) : visiblePokemon.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {visiblePokemon.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} onClick={() => handleSelectPokemon(pokemon)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Pokémon found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
