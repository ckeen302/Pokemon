"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"

interface TCGCard {
  id: string
  name: string
  supertype: string
  subtypes: string[]
  hp?: string
  types?: string[]
  images: {
    small: string
    large: string
  }
  tcgplayer?: {
    url: string
    updatedAt: string
    prices: {
      holofoil?: { market: number; directLow: number }
      reverseHolofoil?: { market: number; directLow: number }
      normal?: { market: number; directLow: number }
      "1stEditionHolofoil"?: { market: number; directLow: number }
      unlimitedHolofoil?: { market: number; directLow: number }
    }
  }
  cardmarket?: {
    url: string
    updatedAt: string
    prices: {
      averageSellPrice: number
      lowPrice: number
      trendPrice: number
      germanProLow: number
      suggestedPrice: number
      reverseHoloSell: number
      reverseHoloLow: number
      reverseHoloTrend: number
      lowPriceExPlus: number
      avg1: number
      avg7: number
      avg30: number
      reverseHoloAvg1: number
      reverseHoloAvg7: number
      reverseHoloAvg30: number
    }
  }
  set: {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    legalities: { [key: string]: string }
    ptcgoCode?: string
    releaseDate: string
    updatedAt: string
    images: {
      symbol: string
      logo: string
    }
  }
  number: string
  artist?: string
  rarity?: string
  flavorText?: string
  nationalPokedexNumbers?: number[]
  legalities: { [key: string]: string }
  regulationMark?: string
  abilities?: Array<{
    name: string
    text: string
    type: string
  }>
  attacks?: Array<{
    name: string
    cost: string[]
    convertedEnergyCost: number
    damage: string
    text: string
  }>
  weaknesses?: Array<{
    type: string
    value: string
  }>
  resistances?: Array<{
    type: string
    value: string
  }>
  retreatCost?: string[]
}

interface TCGSet {
  id: string
  name: string
  series: string
  printedTotal: number
  total: number
  legalities: { [key: string]: string }
  ptcgoCode?: string
  releaseDate: string
  updatedAt: string
  images: {
    symbol: string
    logo: string
  }
}

const CARD_TYPES = ["All", "Pokémon", "Trainer", "Energy"] as const

type CardType = (typeof CARD_TYPES)[number]

type SortOrder =
  | "none"
  | "price-asc"
  | "price-desc"
  | "number-asc"
  | "number-desc"
  | "name-asc"
  | "name-desc"
  | "type-asc"
  | "type-desc"
  | "rarity-asc"
  | "rarity-desc"

const getHighestPrice = (card: TCGCard): number => {
  if (!card.tcgplayer?.prices && !card.cardmarket?.prices) return 0

  const tcgPlayerPrices = card.tcgplayer?.prices
    ? Object.values(card.tcgplayer.prices).flatMap((priceObj) => [
        priceObj?.market || 0,
        priceObj?.directLow || 0,
        priceObj?.low || 0,
        priceObj?.mid || 0,
        priceObj?.high || 0,
      ])
    : []

  const cardmarketPrices = card.cardmarket?.prices
    ? [
        card.cardmarket.prices.averageSellPrice,
        card.cardmarket.prices.lowPrice,
        card.cardmarket.prices.trendPrice,
        card.cardmarket.prices.reverseHoloSell,
        card.cardmarket.prices.reverseHoloLow,
        card.cardmarket.prices.reverseHoloTrend,
      ]
    : []

  return Math.max(...tcgPlayerPrices, ...cardmarketPrices)
}

const getRelevantPrice = (card: TCGCard): { price: number; source: string } => {
  if (card.tcgplayer?.prices) {
    const { normal, holofoil, reverseHolofoil, "1stEditionHolofoil": firstEdition } = card.tcgplayer.prices
    if (normal?.market) return { price: normal.market, source: "TCGplayer (Normal)" }
    if (holofoil?.market) return { price: holofoil.market, source: "TCGplayer (Holofoil)" }
    if (reverseHolofoil?.market) return { price: reverseHolofoil.market, source: "TCGplayer (Reverse Holofoil)" }
    if (firstEdition?.market) return { price: firstEdition.market, source: "TCGplayer (1st Edition Holofoil)" }
  }

  if (card.cardmarket?.prices) {
    if (card.cardmarket.prices.averageSellPrice)
      return { price: card.cardmarket.prices.averageSellPrice, source: "Cardmarket (Avg Sell Price)" }
    if (card.cardmarket.prices.trendPrice)
      return { price: card.cardmarket.prices.trendPrice, source: "Cardmarket (Trend Price)" }
  }

  return { price: 0, source: "No price data available" }
}

const getRarityOrder = (rarity: string): number => {
  const rarityOrder = ["Common", "Uncommon", "Rare", "Rare Holo", "Rare Holo EX", "Rare Ultra", "Rare Secret"]
  return rarityOrder.indexOf(rarity)
}

export default function TCGMode() {
  const [cards, setCards] = useState<TCGCard[]>([])
  const [filteredCards, setFilteredCards] = useState<TCGCard[]>([])
  const [selectedType, setSelectedType] = useState<CardType>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sets, setSets] = useState<TCGSet[]>([])
  const [selectedSet, setSelectedSet] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("none")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchSets()
  }, [])

  useEffect(() => {
    if (selectedSet) {
      fetchCards(selectedSet)
    }
  }, [selectedSet])

  useEffect(() => {
    filterCards()
  }, [cards, selectedType, searchQuery, sortOrder])

  const fetchSets = async () => {
    try {
      const response = await fetch("https://api.pokemontcg.io/v2/sets", {
        headers: {
          "X-Api-Key": "b66ce160-feb8-4d71-8628-203af6a73e4e",
        },
      })
      const data = await response.json()
      const sortedSets = data.data.sort(
        (a: TCGSet, b: TCGSet) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
      )
      setSets(sortedSets)
      setSelectedSet(sortedSets[0].id)
    } catch (error) {
      console.error("Error fetching sets:", error)
      setError("Failed to load card sets. Please try again.")
    }
  }

  const fetchCards = async (setId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`, {
        headers: {
          "X-Api-Key": "b66ce160-feb8-4d71-8628-203af6a73e4e",
        },
      })
      const data = await response.json()
      const sortedCards = data.data.sort(
        (a: TCGCard, b: TCGCard) => Number.parseInt(a.number) - Number.parseInt(b.number),
      )
      setCards(sortedCards)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching cards:", error)
      setIsLoading(false)
      setError("Failed to load cards. Please try again.")
    }
  }

  const filterCards = () => {
    let filtered = cards
    if (selectedType !== "All") {
      filtered = filtered.filter((card) => card.supertype === selectedType)
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (card) => card.name.toLowerCase().includes(searchQuery.toLowerCase()) || card.number.includes(searchQuery),
      )
    }

    switch (sortOrder) {
      case "price-asc":
        filtered = filtered.sort((a, b) => getRelevantPrice(a).price - getRelevantPrice(b).price)
        break
      case "price-desc":
        filtered = filtered.sort((a, b) => getRelevantPrice(b).price - getRelevantPrice(a).price)
        break
      case "number-asc":
        filtered = filtered.sort((a, b) => Number.parseInt(a.number) - Number.parseInt(b.number))
        break
      case "number-desc":
        filtered = filtered.sort((a, b) => Number.parseInt(b.number) - Number.parseInt(a.number))
        break
      case "name-asc":
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filtered = filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "type-asc":
        filtered = filtered.sort((a, b) => a.supertype.localeCompare(b.supertype))
        break
      case "type-desc":
        filtered = filtered.sort((a, b) => b.supertype.localeCompare(a.supertype))
        break
      case "rarity-asc":
        filtered = filtered.sort((a, b) => getRarityOrder(a.rarity || "") - getRarityOrder(b.rarity || ""))
        break
      case "rarity-desc":
        filtered = filtered.sort((a, b) => getRarityOrder(b.rarity || "") - getRarityOrder(a.rarity || ""))
        break
    }

    setFilteredCards(filtered)
  }

  const formatPrice = (price?: number) => {
    if (!price) return "N/A"
    return `$${price.toFixed(2)}`
  }

  const CardDisplay = ({ card }: { card: TCGCard }) => {
    const { price, source } = getRelevantPrice(card)
    return (
      <Card className="bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF] hover:bg-[rgba(24,191,191,0.2)] transition-colors">
        <CardContent className="p-4 flex flex-col items-center">
          <div className="relative w-full h-[250px] mb-4">
            <img
              src={card.images.small || "/placeholder.svg"}
              alt={card.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-center">{card.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <img src={card.set.images.symbol || "/placeholder.svg"} alt={card.set.name} className="w-6 h-6" />
            <span className="text-sm">{card.set.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[rgba(24,191,191,0.2)] text-sm">
              {card.number}/{card.set.printedTotal}
            </span>
            {card.rarity && (
              <span className="px-3 py-1 rounded-full bg-[rgba(24,191,191,0.2)] text-sm">{card.rarity}</span>
            )}
          </div>
          <div className="mt-2 text-sm">Price: {formatPrice(price)}</div>
          <div className="mt-1 text-xs opacity-70">{source}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 bg-[#0F2F2F] text-[#00FFFF] h-full overflow-y-auto">
      <h2 className="text-2xl uppercase tracking-wider mb-6">Pokémon TCG Explorer</h2>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF] placeholder:text-[#00FFFF]/50 pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00FFFF] opacity-50" />
        </div>
        <Select value={selectedType} onValueChange={(value: CardType) => setSelectedType(value)}>
          <SelectTrigger className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
            {CARD_TYPES.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSet} onValueChange={(value: string) => setSelectedSet(value)}>
          <SelectTrigger className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
            <SelectValue placeholder="Select set" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF] max-h-[300px] overflow-y-auto">
            {sets.map((set) => (
              <SelectItem
                key={set.id}
                value={set.id}
                className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
              >
                {set.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
          <SelectTrigger className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
            <SelectItem
              value="none"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Default Order
            </SelectItem>
            <SelectItem
              value="price-asc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Price: Low to High
            </SelectItem>
            <SelectItem
              value="price-desc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Price: High to Low
            </SelectItem>
            <SelectItem
              value="number-asc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Number: Low to High
            </SelectItem>
            <SelectItem
              value="number-desc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Number: High to Low
            </SelectItem>
            <SelectItem
              value="name-asc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Name: A to Z
            </SelectItem>
            <SelectItem
              value="name-desc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Name: Z to A
            </SelectItem>
            <SelectItem
              value="type-asc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Type: A to Z
            </SelectItem>
            <SelectItem
              value="type-desc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Type: Z to A
            </SelectItem>
            <SelectItem
              value="rarity-asc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Rarity: Common to Rare
            </SelectItem>
            <SelectItem
              value="rarity-desc"
              className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Rarity: Rare to Common
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF] hover:bg-[rgba(24,191,191,0.2)]"
        >
          {viewMode === "grid" ? "List View" : "Grid View"}
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#00FFFF]" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-1"}`}
        >
          {filteredCards.map((card) => (
            <CardDisplay key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}
