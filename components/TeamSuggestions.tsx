import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pokemon } from '@/types/pokemon'
import TypeIcons from './TypeIcons'
import { TeamSelectionModal } from './TeamSelectionModal'

interface TeamSuggestionsProps {
  team: Pokemon[]
  onAddPokemon: (pokemon: Pokemon, index?: number) => void
}

const MAX_TEAM_SIZE = 6

const typeEffectiveness: { [key: string]: { strengths: string[], weaknesses: string[] } } = {
  normal: { strengths: [], weaknesses: ['fighting'] },
  fire: { strengths: ['grass', 'ice', 'bug', 'steel'], weaknesses: ['water', 'ground', 'rock'] },
  water: { strengths: ['fire', 'ground', 'rock'], weaknesses: ['electric', 'grass'] },
  electric: { strengths: ['water', 'flying'], weaknesses: ['ground'] },
  grass: { strengths: ['water', 'ground', 'rock'], weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'] },
  ice: { strengths: ['grass', 'ground', 'flying', 'dragon'], weaknesses: ['fire', 'fighting', 'rock', 'steel'] },
  fighting: { strengths: ['normal', 'ice', 'rock', 'dark', 'steel'], weaknesses: ['flying', 'psychic', 'fairy'] },
  poison: { strengths: ['grass', 'fairy'], weaknesses: ['ground', 'psychic'] },
  ground: { strengths: ['fire', 'electric', 'poison', 'rock', 'steel'], weaknesses: ['water', 'grass', 'ice'] },
  flying: { strengths: ['grass', 'fighting', 'bug'], weaknesses: ['electric', 'ice', 'rock'] },
  psychic: { strengths: ['fighting', 'poison'], weaknesses: ['bug', 'ghost', 'dark'] },
  bug: { strengths: ['grass', 'psychic', 'dark'], weaknesses: ['fire', 'flying', 'rock'] },
  rock: { strengths: ['fire', 'ice', 'flying', 'bug'], weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'] },
  ghost: { strengths: ['psychic', 'ghost'], weaknesses: ['ghost', 'dark'] },
  dragon: { strengths: ['dragon'], weaknesses: ['ice', 'dragon', 'fairy'] },
  dark: { strengths: ['psychic', 'ghost'], weaknesses: ['fighting', 'bug', 'fairy'] },
  steel: { strengths: ['ice', 'rock', 'fairy'], weaknesses: ['fire', 'fighting', 'ground'] },
  fairy: { strengths: ['fighting', 'dragon', 'dark'], weaknesses: ['poison', 'steel'] },
}

const calculateTeamAverageStats = (team: Pokemon[]) => {
  const statTotals = {
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  };

  team.forEach(pokemon => {
    pokemon.stats.forEach(stat => {
      statTotals[stat.name as keyof typeof statTotals] += stat.value;
    });
  });

  return Object.entries(statTotals).reduce((acc, [name, total]) => {
    acc[name as keyof typeof statTotals] = Math.round(total / team.length);
    return acc;
  }, {} as typeof statTotals);
};

export default function TeamSuggestions({ team, onAddPokemon }: TeamSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<(Pokemon & { reason: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPokemon, setSelectedPokemon] = useState<(Pokemon & { reason: string }) | null>(null)

  useEffect(() => {
    if (team.length > 0) {
      generateSuggestions()
    } else {
      setSuggestions([])
    }
  }, [team])

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const teamWeaknesses = getTeamWeaknesses(team);
      const suggestedTypes = getSuggestedTypes(teamWeaknesses);
      const teamAverageStats = calculateTeamAverageStats(team);
    
      const newSuggestions: (Pokemon & { reason: string })[] = [];
      for (const type of suggestedTypes) {
        if (newSuggestions.length >= 3) break;
        const pokemon = await fetchRandomPokemonByType(type);
        if (pokemon) {
          const statComparison = pokemon.stats.reduce((acc, stat) => {
            const diff = stat.value - (teamAverageStats[stat.name as keyof typeof teamAverageStats] || 0);
            if (Math.abs(diff) >= 20) {
              acc.push(`${diff > 0 ? 'higher' : 'lower'} ${stat.name} (${diff > 0 ? '+' : ''}${diff})`);
            }
            return acc;
          }, [] as string[]);

          const statReason = statComparison.length > 0
            ? `It has ${statComparison.join(', ')} compared to your team's average.`
            : 'Its stats are similar to your team\'s average.';

          const reason = `${pokemon.name} is a ${type}-type Pokémon that can help cover your team's weakness to ${teamWeaknesses.join(', ')} types. ${statReason}`;
          newSuggestions.push({ ...pokemon, reason });
        }
      }

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamWeaknesses = (team: Pokemon[]): string[] => {
    const weaknesses = new Set<string>()
    team.forEach(pokemon => {
      if (pokemon && pokemon.types) {
        pokemon.types.forEach(type => {
          if (typeEffectiveness[type]) {
            typeEffectiveness[type].weaknesses.forEach(weakness => weaknesses.add(weakness))
          }
        })
      }
    })
    return Array.from(weaknesses)
  }

  const getSuggestedTypes = (weaknesses: string[]): string[] => {
    const suggestions = new Set<string>()
    Object.entries(typeEffectiveness).forEach(([type, effectiveness]) => {
      if (effectiveness.strengths.some(strength => weaknesses.includes(strength))) {
        suggestions.add(type)
      }
    })
    return Array.from(suggestions)
  }

  const fetchRandomPokemonByType = async (type: string): Promise<Pokemon | null> => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
      if (!response.ok) throw new Error('Failed to fetch Pokémon by type')
      const data = await response.json()
      const randomPokemon = data.pokemon[Math.floor(Math.random() * data.pokemon.length)].pokemon
      const pokemonResponse = await fetch(randomPokemon.url)
      if (!pokemonResponse.ok) throw new Error('Failed to fetch Pokémon details')
      const pokemonData = await pokemonResponse.json()
      return {
        id: pokemonData.id,
        name: pokemonData.name,
        image: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default,
        types: pokemonData.types.map((t: any) => t.type.name),
        stats: pokemonData.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat }))
      }
    } catch (error) {
      console.error('Error fetching random Pokémon:', error)
      return null
    }
  }

  const handleAddToTeam = (pokemon: Pokemon & { reason: string }) => {
    if (team.length < MAX_TEAM_SIZE) {
      onAddPokemon(pokemon)
    } else {
      setSelectedPokemon(pokemon)
    }
  }

  const handleCloseModal = () => {
    setSelectedPokemon(null)
  }

  if (team.length === 0) {
    return null
  }

  return (
    <Card className="mt-4 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Team Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center">Generating suggestions...</p>
        ) : suggestions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggestions.map((pokemon) => (
              <Card key={pokemon.id} className="overflow-hidden border-2 border-yellow-400 flex flex-col">
                <CardHeader className="p-2 bg-yellow-100">
                  <CardTitle className="text-lg">{pokemon.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 flex-grow flex flex-col justify-between">
                  <div>
                    <img src={pokemon.image} alt={pokemon.name} className="w-full h-32 object-contain" />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pokemon.types.map((type) => (
                        <span key={type} className={`px-2 py-1 rounded-full text-white text-xs font-semibold bg-${type} flex items-center`}>
                          <span className="mr-1">{TypeIcons[type]}</span>
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-sm">{pokemon.reason}</p>
                  </div>
                  <Button 
                    onClick={() => handleAddToTeam(pokemon)} 
                    className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Add to Team
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center">No suggestions available. Try adding more Pokémon to your team first.</p>
        )}
      </CardContent>
      {selectedPokemon && (
        <TeamSelectionModal
          team={team}
          newPokemon={selectedPokemon}
          onClose={handleCloseModal}
          onAddPokemon={onAddPokemon}
        />
      )}
    </Card>
  )
}

