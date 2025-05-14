'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Item {
  id: number
  name: string
  sprite: string
  category: string
  effect: string
}

const ITEM_CATEGORIES = [
  'All',
  'pokeballs',
  'medicine',
  'battle-items',
  'berries',
  'key-items',
  'held-items',
  'machines',
] as const

type ItemCategory = typeof ITEM_CATEGORIES[number]

export default function ItemsMode() {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, selectedCategory, searchQuery])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('https://pokeapi.co/api/v2/item?limit=1000')
      const data = await response.json()
      const itemDetails = await Promise.all(
        data.results.map(async (item: any) => {
          const itemResponse = await fetch(item.url)
          const itemData = await itemResponse.json()
          return {
            id: itemData.id,
            name: itemData.name.replace(/-/g, ' '),
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemData.name}.png`,
            category: itemData.category.name,
            effect: itemData.effect_entries.find((entry: any) => entry.language.name === 'en')?.effect || 'No effect description available.'
          }
        })
      )
      setItems(itemDetails)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching items:', error)
      setIsLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items
    if (selectedCategory !== 'All') {
      const categoryMap: Record<string, string[]> = {
        'pokeballs': ['pokeballs'],
        'medicine': ['medicine', 'healing'],
        'battle-items': ['battle', 'stat-boosts'],
        'berries': ['berries'],
        'key-items': ['gameplay', 'plot-advancement'],
        'held-items': ['held-items', 'training'],
        'machines': ['machines']
      }
      
      filtered = filtered.filter(item => {
        const validCategories = categoryMap[selectedCategory.toLowerCase()] || []
        return validCategories.some(cat => item.category.includes(cat))
      })
    }
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toString().includes(searchQuery)
      )
    }
    setFilteredItems(filtered)
  }

  const ItemCard = ({ item }: { item: Item }) => (
    <div className="bg-[rgba(24,191,191,0.1)] p-4 rounded border border-[#18BFBF] flex flex-col items-center w-64 h-[calc(100vh-220px)] shrink-0 mr-4">
      <div className="w-32 h-32 bg-[rgba(24,191,191,0.2)] rounded-full flex items-center justify-center mb-4">
        <img 
          src={item.sprite || "/placeholder.svg"} 
          alt={item.name} 
          className="w-24 h-24 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
          }}
        />
      </div>
      <h3 className="uppercase font-pixel text-base mb-2 text-center tracking-wider">{item.name}</h3>
      <div className="bg-[rgba(24,191,191,0.2)] w-full p-2 rounded flex-grow overflow-y-auto mt-2">
        <p className="text-sm mb-2 uppercase font-pixel tracking-wider">Category: {item.category}</p>
        <p className="text-sm font-pixel leading-relaxed">{item.effect}</p>
      </div>
    </div>
  )

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  return (
    <div className="p-4 bg-[#0F2F2F] text-[#00FFFF] h-full flex flex-col">
      <h2 className="text-2xl font-pixel uppercase tracking-wider mb-6">Pokémon Items</h2>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF] placeholder:text-[#00FFFF]/50"
        />
        <Select
          value={selectedCategory}
          onValueChange={(value: ItemCategory) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
            {ITEM_CATEGORIES.map((category) => (
              <SelectItem 
                key={category} 
                value={category}
                className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
              >
                {category === 'All' ? 'All' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="text-center">Loading items...</div>
      ) : (
        <div className="relative flex-grow">
          <Button 
            onClick={scrollLeft} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[rgba(24,191,191,0.3)] hover:bg-[rgba(24,191,191,0.5)] backdrop-filter backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <Button 
            onClick={scrollRight} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[rgba(24,191,191,0.3)] hover:bg-[rgba(24,191,191,0.5)] backdrop-filter backdrop-blur-sm"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}

