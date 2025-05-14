'use client'

import { useState, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Pokemon } from '@/types/pokemon'
import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MegaDynamaxToggle } from '@/components/MegaDynamaxToggle'

interface TeamBuilderModeProps {
  pokemonList: Pokemon[]
}

interface TeamMember {
  pokemon: Pokemon
  form: 'regular' | 'mega' | 'dynamax'
}

const POKEMON_TYPES = [
  'all',
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy'
] as const

type PokemonType = typeof POKEMON_TYPES[number]

const POKEDEX_REGIONS = [
  'national',
  'kanto',
  'johto',
  'hoenn',
  'sinnoh',
  'unova',
  'kalos',
  'alola',
  'galar',
  'paldea'
] as const

type PokedexRegion = typeof POKEDEX_REGIONS[number]

const TYPE_COLORS = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-600',
  rock: 'bg-yellow-700',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-700',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

export default function TeamBuilderMode({ pokemonList }: TeamBuilderModeProps) {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [selectedType, setSelectedType] = useState<PokemonType>('all')
  const [selectedRegion, setSelectedRegion] = useState<PokedexRegion>('national')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMegaDynamax, setShowMegaDynamax] = useState(false)

  const filteredPokemon = useMemo(() => {
    const uniquePokemon = pokemonList.reduce((acc, pokemon) => {
      if (!acc.some(p => p.id === pokemon.id)) {
        acc.push(pokemon)
      }
      return acc
    }, [] as Pokemon[])

    return uniquePokemon
      .sort((a, b) => a.id - b.id)
      .filter(pokemon => {
        const matchesType = selectedType === 'all' || pokemon.types.includes(selectedType)
        const matchesRegion = selectedRegion === 'national' || pokemon.region === selectedRegion
        const matchesSearch = searchQuery === '' || 
          pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pokemon.id.toString().includes(searchQuery)
        return matchesType && matchesRegion && matchesSearch
      })
  }, [pokemonList, selectedType, selectedRegion, searchQuery])

  const addToTeam = (pokemon: Pokemon, form: 'regular' | 'mega' | 'dynamax' = 'regular') => {
    if (team.length < 6) {
      setTeam([...team, { pokemon, form }])
    }
  }

  const removeFromTeam = (index: number) => {
    setTeam(team.filter((_, i) => i !== index))
  }

  const togglePokemonForm = (index: number) => {
    setTeam(team.map((member, i) => {
      if (i === index) {
        const pokemon = member.pokemon
        // Cycle through available forms
        if (member.form === 'regular') {
          if (pokemon.megaForm) return { pokemon, form: 'mega' as const }
          if (pokemon.dynamaxForm) return { pokemon, form: 'dynamax' as const }
        }
        if (member.form === 'mega' && pokemon.dynamaxForm) {
          return { pokemon, form: 'dynamax' as const }
        }
        return { pokemon, form: 'regular' as const }
      }
      return member
    }))
  }

  const PokemonItem = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const pokemon = filteredPokemon[index]
    const displayedPokemon = showMegaDynamax && (pokemon.megaForm || pokemon.dynamaxForm) 
      ? (pokemon.megaForm || pokemon.dynamaxForm || pokemon)
      : pokemon

    return (
      <div style={style}>
        <div
          className="pokemon-list-item"
          onClick={() => addToTeam(pokemon, showMegaDynamax && pokemon.megaForm ? 'mega' : 'regular')}
        >
          <div className="pokemon-number">#{String(pokemon.id).padStart(4, '0')}</div>
          <div className="pokemon-sprite">
            <img
              src={displayedPokemon.image || pokemon.image || "/placeholder.svg"}
              alt={displayedPokemon.name || pokemon.name}
              className="pixelated w-8 h-8"
            />
          </div>
          <div className="pokemon-name">{displayedPokemon.name || pokemon.name}</div>
          <div className="pokemon-types">
            {(displayedPokemon.types || pokemon.types || []).map((type, index) => (
              <span 
                key={`${type}-${index}`} 
                className={`pokemon-type text-xs mr-1 px-2 py-0.5 rounded text-white ${TYPE_COLORS[type as keyof typeof TYPE_COLORS]}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="gameboy-content-inner">
      <div className="section-header">YOUR TEAM ({team.length}/6)</div>
      <div className="team-list grid grid-cols-2 gap-2 mb-4">
        {team.map((member, index) => {
          const displayedPokemon = member.form === 'regular' 
            ? member.pokemon 
            : member.form === 'mega' 
              ? member.pokemon.megaForm 
              : member.pokemon.dynamaxForm || member.pokemon

          return (
            <div
              key={`team-${member.pokemon.id}-${index}`}
              className="pokemon-list-item relative grid grid-cols-[60px_40px_1fr_80px_24px] items-center gap-2"
            >
              <div className="pokemon-number">#{String(member.pokemon.id).padStart(4, '0')}</div>
              <div className="pokemon-sprite">
                <img
                  src={displayedPokemon?.image || member.pokemon.image || "/placeholder.svg"}
                  alt={displayedPokemon?.name || member.pokemon.name}
                  className="pixelated w-8 h-8"
                />
              </div>
              <div className="pokemon-name">
                {displayedPokemon?.name || member.pokemon.name}
                {member.form !== 'regular' && (
                  <span className="text-xs ml-1 opacity-75">({member.form})</span>
                )}
              </div>
              <div className="flex gap-2">
                {(member.pokemon.megaForm || member.pokemon.dynamaxForm) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0.5 hover:bg-[rgba(24,191,191,0.1)]"
                    onClick={() => togglePokemonForm(index)}
                  >
                    <span className="text-xs">↻</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0.5 hover:bg-[rgba(24,191,191,0.1)]"
                  onClick={() => removeFromTeam(index)}
                >
                  <X className="h-4 w-4 text-[#00FFFF]" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="section-header">AVAILABLE POKEMON</div>
      <div className="filter-container">
        <div className="flex gap-4 mb-2">
          <Select
            value={selectedRegion}
            onValueChange={(value: PokedexRegion) => setSelectedRegion(value)}
          >
            <SelectTrigger className="w-[180px] bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
              <SelectValue placeholder="Select Pokédex" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
              {POKEDEX_REGIONS.map((region) => (
                <SelectItem 
                  key={region} 
                  value={region}
                  className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
                >
                  {region.charAt(0).toUpperCase() + region.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedType}
            onValueChange={(value: PokemonType) => setSelectedType(value)}
          >
            <SelectTrigger className="w-[180px] bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
              {POKEMON_TYPES.map((type) => (
                <SelectItem 
                  key={type} 
                  value={type}
                  className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-2">
          <MegaDynamaxToggle
            isEnabled={showMegaDynamax}
            onToggle={() => setShowMegaDynamax(!showMegaDynamax)}
          />
        </div>
        <Input
          type="text"
          placeholder="Search by name or ID number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF] placeholder:text-[#00FFFF]/50"
        />
      </div>
      <div className="pokemon-list" style={{ height: 'calc(100vh - 250px)' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={filteredPokemon.length}
              itemSize={40}
              width={width}
            >
              {({ index, style }) => (
                <PokemonItem key={`pokemon-${filteredPokemon[index].id}`} index={index} style={style} />
              )}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  )
}

