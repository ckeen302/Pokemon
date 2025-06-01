'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react'
import { Pokemon } from '@/types/pokemon'

interface PokédexModeProps {
 pokemonList: Pokemon[]
}

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


export default function PokédexMode({ pokemonList }: PokédexModeProps) {
 const [filter, setFilter] = useState('')
 const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
 const scrollContainerRef = useRef<HTMLDivElement>(null)
 const audioRef = useRef<HTMLAudioElement | null>(null)
 const [isPlayingCry, setIsPlayingCry] = useState(false)
 const [selectedRegion, setSelectedRegion] = useState<string>('all')

 const filteredPokemon = pokemonList
   .sort((a, b) => a.id - b.id)
   .filter(pokemon => 
    (selectedRegion === 'all' || pokemon.region === selectedRegion) &&
    (pokemon.name.toLowerCase().includes(filter.toLowerCase()) ||
    pokemon.id.toString().includes(filter))
   )

 const scrollLeft = () => {
   if (scrollContainerRef.current) {
     const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement;
     if (firstChild) {
       firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
     }
   }
 }

 const scrollRight = () => {
   if (scrollContainerRef.current) {
     const lastChild = scrollContainerRef.lastElementChild as HTMLElement;
     if (lastChild) {
       lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
     }
   }
 }

 const playPokemonCry = async (pokemonId: number) => {
   if (!audioRef.current) return;
   
   try {
     setIsPlayingCry(true)
     // Format the ID to match the audio file naming convention (3 digits)
     const formattedId = String(pokemonId).padStart(3, '0')
     audioRef.current.src = `https://play.pokemonshowdown.com/audio/cries/${formattedId}.mp3`
     await audioRef.current.play()
   } catch (error) {
     console.error('Error playing Pokemon cry:', error)
   } finally {
     setIsPlayingCry(false)
   }
 }

 const handleSelectPokemon = (pokemon: Pokemon) => {
   setSelectedPokemon(pokemon)
   playPokemonCry(pokemon.id)
 }

const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => (
 <div 
   className="w-[400px] h-[calc(100vh-220px)] shrink-0 bg-[rgba(24,191,191,0.1)] p-4 rounded border border-[#18BFBF] flex flex-col items-center cursor-pointer" 
   onClick={() => handleSelectPokemon(pokemon)}
 >
   <div className="text-center mb-2">
     <span className="text-lg font-semibold">#{String(pokemon.id).padStart(4, '0')}</span>
   </div>
   <div className="bg-[rgba(24,191,191,0.1)] rounded border border-[#18BFBF] p-4 flex items-center justify-center h-[400px] w-full mb-4">
     <div className="relative w-full h-full">
       <img 
         src={pokemon.officialArtwork || pokemon.image || "/placeholder.svg"} 
         alt={pokemon.name} 
         className="absolute inset-0 w-full h-full object-contain"
       />
     </div>
   </div>
   <h3 className="text-xl font-semibold mb-2 uppercase">{pokemon.name}</h3>
   <div className="flex gap-2 mb-4">
     {pokemon.types.map((type) => (
       <span 
         key={type}
         className={`px-3 py-1 rounded-full text-white text-sm uppercase ${TYPE_COLORS[type as keyof typeof TYPE_COLORS]}`}
       >
         {type}
       </span>
     ))}
   </div>
   <div className="bg-[rgba(24,191,191,0.2)] w-full p-4 rounded flex-grow overflow-y-auto">
     <div className="space-y-2">
       {pokemon.stats.map((stat) => (
         <div key={stat.name} className="flex justify-between items-center">
           <span className="text-sm uppercase">{stat.name}</span>
           <span className="text-sm font-semibold">{stat.value}</span>
         </div>
       ))}
     </div>
   </div>
 </div>
)

const SelectedPokemonView = ({ pokemon, onBack }: { pokemon: Pokemon, onBack: () => void }) => (
 <div className="h-[calc(100vh-220px)]">
   <div className="flex justify-between items-center mb-4">
     <Input
       type="text"
       placeholder="Search by name or number..."
       value={filter}
       onChange={(e) => setFilter(e.target.value)}
       className="flex-grow bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF] placeholder:text-[#00FFFF]/50"
     />
     <Button 
       onClick={() => playPokemonCry(pokemon.id)}
       className="mx-2 bg-[rgba(24,191,191,0.2)] hover:bg-[rgba(24,191,191,0.3)]"
       disabled={isPlayingCry}
     >
       <Volume2 className="h-4 w-4" />
     </Button>
     <Button 
       onClick={onBack}
       className="bg-[rgba(24,191,191,0.2)] hover:bg-[rgba(24,191,191,0.3)]"
     >
       Back to List
     </Button>
   </div>
   <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
     <div className="bg-[rgba(24,191,191,0.1)] rounded border border-[#18BFBF] p-4 flex items-center justify-center min-h-[500px]">
       <div className="relative w-[400px] h-[400px]">
         <img 
           src={pokemon.officialArtwork || pokemon.image || "/placeholder.svg"} 
           alt={pokemon.name} 
           className="absolute inset-0 w-full h-full object-contain"
         />
       </div>
     </div>
     <div className="bg-[rgba(24,191,191,0.1)] rounded border border-[#18BFBF] p-6">
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-2xl font-bold">{pokemon.name.toUpperCase()}</h2>
         <span className="text-xl">#{String(pokemon.id).padStart(3, '0')}</span>
       </div>
       <div className="flex gap-2 mb-4">
         {pokemon.types.map((type) => (
           <span 
             key={type}
             className={`px-4 py-1 rounded-full text-white text-sm uppercase ${TYPE_COLORS[type as keyof typeof TYPE_COLORS]}`}
           >
             {type}
           </span>
         ))}
       </div>
       <div className="space-y-4">
         <section>
           <h3 className="text-lg font-semibold mb-2">BASE STATS</h3>
           {pokemon.stats.map((stat) => (
             <div key={stat.name} className="mb-2">
               <div className="flex justify-between text-sm mb-1">
                 <span className="uppercase">{stat.name}</span>
                 <span>{stat.value}</span>
               </div>
               <div className="h-2 bg-[rgba(24,191,191,0.1)] rounded-full overflow-hidden">
                 <div
                   className="h-full bg-[#18BFBF]"
                   style={{ width: `${(stat.value / 255) * 100}%` }}
                 />
               </div>
             </div>
           ))}
         </section>
         <section>
           <h3 className="text-lg font-semibold mb-2">DETAILS</h3>
           <p>Height: {pokemon.height}m</p>
           <p>Weight: {pokemon.weight}kg</p>
         </section>
         <section>
           <h3 className="text-lg font-semibold mb-2">LEVEL-UP MOVES</h3>
           <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
             {pokemon.moves
               .sort((a, b) => a.level_learned_at - b.level_learned_at)
               .map((move) => (
                 <div key={move.name} className="flex justify-between bg-[rgba(24,191,191,0.1)] px-3 py-1 rounded">
                   <span className="text-sm uppercase">{move.name}</span>
                   <span className="text-sm">Lv. {move.level_learned_at}</span>
                 </div>
               ))}
           </div>
         </section>
         <section>
           <h3 className="text-lg font-semibold mb-2">TM MOVES</h3>
           <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
             {pokemon.tmMoves.map((move) => (
               <div key={move.name} className="bg-[rgba(24,191,191,0.1)] px-3 py-1 rounded">
                 <span className="text-sm uppercase">{move.name}</span>
               </div>
             ))}
           </div>
         </section>
       </div>
     </div>
   </div>
 </div>
)

 const handleTouchStart = (e: React.TouchEvent) => {
   const touch = e.touches[0];
   if (touch && scrollContainerRef.current) {
     const scrollLeft = scrollContainerRef.current.scrollLeft;
     scrollContainerRef.current.dataset.scrollLeft = scrollLeft.toString();
     scrollContainerRef.current.dataset.startX = touch.clientX.toString();
   }
 }

 const handleTouchMove = (e: React.TouchEvent) => {
   const touch = e.touches[0];
   if (touch && scrollContainerRef.current) {
     const startX = parseInt(scrollContainerRef.current.dataset.startX || '0');
     const scrollLeft = parseInt(scrollContainerRef.current.dataset.scrollLeft || '0');
     const x = touch.clientX - startX;
     scrollContainerRef.current.scrollLeft = scrollLeft - x;
   }
 }

 return (
   <div className="p-4 bg-[#0F2F2F] text-[#00FFFF] h-full">
     <audio ref={audioRef} />
     <h2 className="text-2xl uppercase tracking-wider mb-6">Pokédex</h2>
     {selectedPokemon ? (
       <SelectedPokemonView 
         pokemon={selectedPokemon} 
         onBack={() => setSelectedPokemon(null)} 
       />
     ) : (
       <>
         <div className="mb-4 flex flex-col sm:flex-row gap-4">
           <Input
             type="text"
             placeholder="Search by name or number..."
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="flex-grow bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF] placeholder:text-[#00FFFF]/50"
           />
           <Select
            value={selectedRegion}
            onValueChange={setSelectedRegion}
          >
            <SelectTrigger className="w-[180px] bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
              <SelectItem value="all" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">All Regions</SelectItem>
              <SelectItem value="kanto" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Kanto</SelectItem>
              <SelectItem value="johto" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Johto</SelectItem>
              <SelectItem value="hoenn" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Hoenn</SelectItem>
              <SelectItem value="sinnoh" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Sinnoh</SelectItem>
              <SelectItem value="unova" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Unova</SelectItem>
              <SelectItem value="kalos" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Kalos</SelectItem>
              <SelectItem value="alola" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Alola</SelectItem>
              <SelectItem value="galar" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Galar</SelectItem>
              <SelectItem value="paldea" className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Paldea</SelectItem>
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
             className="flex flex-nowrap gap-6 overflow-x-auto overflow-y-hidden h-[calc(100vh-220px)] px-6"
             style={{ 
               scrollbarWidth: 'none', 
               msOverflowStyle: 'none',
               whiteSpace: 'nowrap',
               scrollSnapType: 'x mandatory'
             }}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
           >
             {filteredPokemon.map(pokemon => (
               <PokemonCard key={pokemon.id} pokemon={pokemon} />
             ))}
           </div>
           <Button 
             onClick={scrollRight} 
             className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[rgba(24,191,191,0.5)] hover:bg-[rgba(24,191,191,0.7)]"
           >
             <ChevronRight className="h-6 w-6" />
           </Button>
         </div>
       </>
     )}
   </div>
 )
}
