'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Pokemon {
  name: string
  level: number
  sprite: string
}

interface Trainer {
  id: number
  name: string
  sprite: string
  class: string
  game: string
  location: string
  reward: string
  team: Pokemon[]
  specialDialog?: string
}

const POKEMON_GAMES = [
  'All Games',
  'Red/Blue/Yellow',
  'Gold/Silver/Crystal',
  'Ruby/Sapphire/Emerald',
  'FireRed/LeafGreen',
  'Diamond/Pearl/Platinum',
  'HeartGold/SoulSilver',
  'Black/White',
  'Black 2/White 2',
  'X/Y',
  'Omega Ruby/Alpha Sapphire',
  'Sun/Moon',
  'Ultra Sun/Ultra Moon',
  'Sword/Shield',
  'Brilliant Diamond/Shining Pearl',
  'Legends: Arceus',
  'Scarlet/Violet'
] as const

type PokemonGame = typeof POKEMON_GAMES[number]

const TRAINERS: Trainer[] = [
  {
    id: 1,
    name: "Blue",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/blue.png",
    class: "Champion",
    game: "Red/Blue/Yellow",
    location: "Indigo Plateau",
    reward: "P¥10000",
    team: [
      { name: "Pidgeot", level: 59, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png" },
      { name: "Alakazam", level: 57, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png" },
      { name: "Rhydon", level: 59, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png" },
      { name: "Gyarados", level: 61, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png" },
      { name: "Arcanine", level: 61, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png" },
      { name: "Venusaur", level: 65, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png" }
    ],
    specialDialog: "Smell ya later!"
  },
  {
    id: 2,
    name: "Lance",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/lance.png",
    class: "Dragon Master",
    game: "Gold/Silver/Crystal",
    location: "Indigo Plateau",
    reward: "P¥11000",
    team: [
      { name: "Gyarados", level: 58, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png" },
      { name: "Dragonite", level: 60, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png" },
      { name: "Dragonite", level: 60, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png" },
      { name: "Aerodactyl", level: 58, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png" },
      { name: "Dragonite", level: 62, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png" },
    ],
    specialDialog: "I've been waiting for you."
  },
  {
    id: 3,
    name: "Steven",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/steven.png",
    class: "Champion",
    game: "Ruby/Sapphire/Emerald",
    location: "Ever Grande City",
    reward: "P¥12000",
    team: [
      { name: "Skarmory", level: 57, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/227.png" },
      { name: "Aggron", level: 55, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/306.png" },
      { name: "Cradily", level: 56, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/346.png" },
      { name: "Armaldo", level: 56, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/348.png" },
      { name: "Claydol", level: 55, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png" },
      { name: "Metagross", level: 58, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png" }
    ],
    specialDialog: "I'm still one step ahead of you!"
  },
  {
    id: 4,
    name: "Cynthia",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/cynthia.png",
    class: "Champion",
    game: "Diamond/Pearl/Platinum",
    location: "Pokemon League",
    reward: "P¥12760",
    team: [
      { name: "Spiritomb", level: 61, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/442.png" },
      { name: "Roserade", level: 60, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png" },
      { name: "Togekiss", level: 60, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png" },
      { name: "Lucario", level: 63, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png" },
      { name: "Milotic", level: 61, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png" },
      { name: "Garchomp", level: 66, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/445.png" }
    ],
    specialDialog: "There are no weak Pokémon in a Pokémon battle."
  },
  {
    id: 5,
    name: "Alder",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/alder.png",
    class: "Champion",
    game: "Black/White",
    location: "Pokemon League",
    reward: "P¥13000",
    team: [
      { name: "Accelgor", level: 71, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/617.png" },
      { name: "Bouffalant", level: 71, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/626.png" },
      { name: "Druddigon", level: 71, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/621.png" },
      { name: "Vanilluxe", level: 71, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/584.png" },
      { name: "Escavalier", level: 71, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/589.png" },
      { name: "Volcarona", level: 73, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/637.png" }
    ],
    specialDialog: "Pokémon are our allies and our friends!"
  },
  {
    id: 6,
    name: "Diantha",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/diantha.png",
    class: "Champion",
    game: "X/Y",
    location: "Pokemon League",
    reward: "P¥13200",
    team: [
      { name: "Hawlucha", level: 64, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/701.png" },
      { name: "Tyrantrum", level: 65, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/697.png" },
      { name: "Aurorus", level: 65, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/699.png" },
      { name: "Gourgeist", level: 65, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/711.png" },
      { name: "Goodra", level: 65, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/706.png" },
      { name: "Gardevoir", level: 68, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png" }
    ],
    specialDialog: "I will not lose! No, I will not lose. I will not lose!"
  },
  {
    id: 7,
    name: "Kukui",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/kukui.png",
    class: "Professor",
    game: "Sun/Moon",
    location: "Mount Lanakila",
    reward: "P¥13500",
    team: [
      { name: "Lycanroc", level: 57, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/745.png" },
      { name: "Ninetales", level: 56, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png" },
      { name: "Braviary", level: 56, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/628.png" },
      { name: "Magnezone", level: 56, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/462.png" },
      { name: "Snorlax", level: 56, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png" },
      { name: "Primarina", level: 59, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/730.png" }
    ],
    specialDialog: "Woo! What a great battle! I'm still burning with excitement!"
  },
  {
    id: 8,
    name: "Leon",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/leon.png",
    class: "Champion",
    game: "Sword/Shield",
    location: "Wyndon Stadium",
    reward: "P¥14000",
    team: [
      { name: "Aegislash", level: 62, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/681.png" },
      { name: "Haxorus", level: 63, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/612.png" },
      { name: "Dragapult", level: 64, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/887.png" },
      { name: "Mr. Rime", level: 63, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/866.png" },
      { name: "Rhyperior", level: 64, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/464.png" },
      { name: "Charizard", level: 65, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" }
    ],
    specialDialog: "My time as Champion is over... But what a champion time it's been!"
  },
  {
    id: 9,
    name: "Geeta",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/geeta.png",
    class: "Top Champion",
    game: "Scarlet/Violet",
    location: "Pokemon League",
    reward: "P¥15000",
    team: [
      { name: "Espathra", level: 66, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/956.png" },
      { name: "Gogoat", level: 66, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/673.png" },
      { name: "Veluza", level: 66, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/976.png" },
      { name: "Kingambit", level: 66, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/983.png" },
      { name: "Avalugg", level: 66, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/713.png" },
      { name: "Glimmora", level: 67, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/970.png" }
    ],
    specialDialog: "The strength of your convictions has shaken me to my core!"
  }
]

const fetchTrainerImage = async (trainerName: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/trainer/${trainerName.toLowerCase()}`);
    if (!response.ok) throw new Error('Trainer not found');
    const data = await response.json();
    return data.sprites.front_default;
  } catch (error) {
    console.error(`Error fetching image for ${trainerName}:`, error);
    return null;
  }
};

export default function TrainersMode() {
  const [selectedGame, setSelectedGame] = useState<PokemonGame>('All Games')
  const [searchQuery, setSearchQuery] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const filteredTrainers = TRAINERS.filter(trainer => {
    const matchesGame = selectedGame === 'All Games' || trainer.game === selectedGame
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trainer.class.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGame && matchesSearch
  })

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const TrainerCard = ({ trainer }: { trainer: Trainer }) => {
    const [trainerImage, setTrainerImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      setIsLoading(true);
      fetchTrainerImage(trainer.name).then((image) => {
        setTrainerImage(image);
        setIsLoading(false);
      });
    }, [trainer.name]);

    return (
      <div className="bg-[rgba(24,191,191,0.1)] p-4 rounded border border-[#18BFBF] flex flex-col w-[350px] h-[calc(100vh-220px)] shrink-0 mr-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-[rgba(24,191,191,0.2)] rounded-lg flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-[#00FFFF]" />
            ) : (
              <img 
                src={trainerImage || trainer.sprite || "/placeholder.svg"} 
                alt={trainer.name} 
                className="w-12 h-12 object-contain pixelated"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallbackSprites: { [key: string]: string } = {
                    "Blue": "https://archives.bulbagarden.net/media/upload/6/6d/Spr_RG_Blue_1.png",
                    "Lance": "https://archives.bulbagarden.net/media/upload/a/a2/Spr_GS_Lance.png",
                    "Steven": "https://archives.bulbagarden.net/media/upload/f/f3/Spr_RS_Steven.png",
                    "Cynthia": "https://archives.bulbagarden.net/media/upload/8/88/Spr_DP_Cynthia.png",
                    "Alder": "https://archives.bulbagarden.net/media/upload/7/7e/Spr_BW_Alder.png",
                    "Diantha": "https://archives.bulbagarden.net/media/upload/9/9e/VSpr_XY_Diantha.png",
                    "Kukui": "https://archives.bulbagarden.net/media/upload/b/b1/VSpr_SM_Kukui.png",
                    "Leon": "https://archives.bulbagarden.net/media/upload/3/39/VSpr_SwSh_Leon.png",
                    "Geeta": "https://archives.bulbagarden.net/media/upload/5/5f/VSpr_SV_Geeta.png"
                  };
                  
                  target.src = fallbackSprites[trainer.name] || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
                }}
              />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold uppercase">{trainer.name}</h3>
            <p className="text-sm opacity-80 uppercase">{trainer.class}</p>
          </div>
        </div>
        
        <div className="bg-[rgba(24,191,191,0.2)] p-3 rounded mb-4">
          <p className="text-sm mb-1"><span className="font-semibold">Location:</span> {trainer.location}</p>
          <p className="text-sm mb-1"><span className="font-semibold">Game:</span> {trainer.game}</p>
          <p className="text-sm"><span className="font-semibold">Reward:</span> {trainer.reward}</p>
        </div>

        <div className="flex-grow overflow-y-auto">
          <h4 className="font-semibold mb-2 uppercase">Team</h4>
          <div className="grid grid-cols-2 gap-2">
            {trainer.team.map((pokemon, index) => (
              <div 
                key={`${trainer.id}-pokemon-${index}`}
                className="bg-[rgba(24,191,191,0.1)] p-2 rounded flex items-center gap-2"
              >
                <img 
                  src={pokemon.sprite || "/placeholder.svg"} 
                  alt={pokemon.name} 
                  className="w-8 h-8 pixelated"
                />
                <div>
                  <p className="text-sm font-semibold">{pokemon.name}</p>
                  <p className="text-xs opacity-80">Lv. {pokemon.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {trainer.specialDialog && (
          <div className="mt-4 p-3 bg-[rgba(24,191,191,0.2)] rounded">
            <p className="text-sm italic">"{trainer.specialDialog}"</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 bg-[#0F2F2F] text-[#00FFFF] h-full flex flex-col">
      <h2 className="text-2xl uppercase tracking-wider mb-6">Pokémon Trainers</h2>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Search trainers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF] placeholder:text-[#00FFFF]/50"
        />
        <Select
          value={selectedGame}
          onValueChange={(value: PokemonGame) => setSelectedGame(value)}
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
            <SelectValue placeholder="Select Game" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
            {POKEMON_GAMES.map((game) => (
              <SelectItem 
                key={game} 
                value={game}
                className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
              >
                {game}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative flex-grow">
        <Button 
          onClick={scrollLeft} 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[rgba(24,191,191,0.5)] hover:bg-[rgba(24,191,191,0.7)]"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredTrainers.map(trainer => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
        <Button 
          onClick={scrollRight} 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[rgba(24,191,191,0.5)] hover:bg-[rgba(24,191,191,0.7)]"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
