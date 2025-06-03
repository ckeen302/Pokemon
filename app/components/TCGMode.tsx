"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, CreditCard, Filter, Grid3X3, List, ExternalLink, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TradingCardIcon } from "@/components/TradingCardIcon"

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
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null)
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

    if (viewMode === "list") {
      return (
        <Card className="modern-card hover:shadow-medium transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-28 flex-shrink-0">
                <img
                  src={card.images.small || "/placeholder.svg"}
                  alt={card.name}
                  className="w-full h-full object-contain rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="heading-sm text-gray-900 mb-2 truncate">{card.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <img src={card.set.images.symbol || "/placeholder.svg"} alt={card.set.name} className="w-5 h-5" />
                  <span className="text-small text-gray-600 truncate">{card.set.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {card.number}/{card.set.printedTotal}
                  </Badge>
                  {card.rarity && (
                    <Badge variant="secondary" className="text-xs">
                      {card.rarity}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-900">{formatPrice(price)}</span>
                  <span className="text-xs text-gray-500 truncate">{source}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="modern-card hover:shadow-medium transition-all duration-200 h-full">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="relative w-full h-[280px] mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <img
              src={card.images.small || "/placeholder.svg"}
              alt={card.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h3 className="heading-sm text-gray-900 mb-2 text-center line-clamp-2">{card.name}</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={card.set.images.symbol || "/placeholder.svg"} alt={card.set.name} className="w-5 h-5" />
            <span className="text-small text-gray-600 truncate">{card.set.name}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {card.number}/{card.set.printedTotal}
            </Badge>
            {card.rarity && (
              <Badge variant="secondary" className="text-xs">
                {card.rarity}
              </Badge>
            )}
          </div>
          <div className="mt-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-900">{formatPrice(price)}</span>
            </div>
            <span className="text-xs text-gray-500">{source}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const CardDetailView = ({ card, onClose }: { card: TCGCard | null; onClose: () => void }) => {
    if (!card) return null

    return (
      <Dialog open={!!card} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="heading-lg text-gray-900">{card.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <img
                  src={card.images.large || "/placeholder.svg"}
                  alt={card.name}
                  className="max-w-full max-h-[500px] object-contain rounded-lg"
                />
              </div>
              <div className="space-y-6">
                <Card className="modern-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Card Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-sm font-medium text-gray-700">Type</span>
                      <span className="text-gray-900">{card.supertype}</span>
                    </div>
                    {card.hp && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-sm font-medium text-gray-700">HP</span>
                        <span className="text-gray-900">{card.hp}</span>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-sm font-medium text-gray-700">Set</span>
                      <span className="text-gray-900">{card.set.name}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="block text-sm font-medium text-gray-700">Number</span>
                      <span className="text-gray-900">
                        {card.number}/{card.set.printedTotal}
                      </span>
                    </div>
                    {card.rarity && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-sm font-medium text-gray-700">Rarity</span>
                        <span className="text-gray-900">{card.rarity}</span>
                      </div>
                    )}
                    {card.artist && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-sm font-medium text-gray-700">Artist</span>
                        <span className="text-gray-900">{card.artist}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {card.abilities && card.abilities.length > 0 && (
                  <Card className="modern-card">
                    <CardHeader>
                      <CardTitle>Abilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {card.abilities.map((ability, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">{ability.name}</h4>
                          <p className="text-sm text-blue-800">{ability.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {card.attacks && card.attacks.length > 0 && (
                  <Card className="modern-card">
                    <CardHeader>
                      <CardTitle>Attacks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {card.attacks.map((attack, index) => (
                        <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-2">{attack.name}</h4>
                          <p className="text-sm text-red-800 mb-2">{attack.text}</p>
                          <div className="flex justify-between text-sm text-red-700">
                            <span>Damage: {attack.damage}</span>
                            <span>Energy: {attack.convertedEnergyCost}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {card.tcgplayer?.prices && (
                  <Card className="modern-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        TCGplayer Prices
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(card.tcgplayer.prices).map(
                          ([priceType, priceData]) =>
                            priceData && (
                              <div key={priceType} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-green-900 capitalize">
                                    {priceType.replace(/([A-Z])/g, " $1")}
                                  </span>
                                  <span className="font-bold text-green-900">{formatPrice(priceData.market)}</span>
                                </div>
                                <div className="text-sm text-green-700 mt-1">
                                  Low: {formatPrice(priceData.low)} | Mid: {formatPrice(priceData.mid)} | High:{" "}
                                  {formatPrice(priceData.high)}
                                </div>
                              </div>
                            ),
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Last updated: {new Date(card.tcgplayer.updatedAt).toLocaleDateString()}
                      </p>
                      {card.tcgplayer.url && (
                        <Button className="w-full" onClick={() => window.open(card.tcgplayer.url, "_blank")}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on TCGPlayer
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="heading-lg text-gray-900 flex items-center gap-2">
            <TradingCardIcon className="w-6 h-6 text-blue-600" />
            Pokémon Trading Cards
          </h2>
          <p className="text-gray-600 mt-1">Explore cards with real-time pricing</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="flex items-center gap-2"
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            {viewMode === "grid" ? "List" : "Grid"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="modern-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 search-input focus-ring"
              />
            </div>
            <Select value={selectedType} onValueChange={(value: CardType) => setSelectedType(value)}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {CARD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSet} onValueChange={(value: string) => setSelectedSet(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select set" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {sets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default Order</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="number-asc">Number: Low to High</SelectItem>
                <SelectItem value="number-desc">Number: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                <SelectItem value="rarity-asc">Rarity: Common to Rare</SelectItem>
                <SelectItem value="rarity-desc">Rarity: Rare to Common</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid/List */}
      <div className="fade-in">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading cards...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <CreditCard className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="heading-md text-gray-700 mb-2">Error loading cards</h3>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchCards(selectedSet)} variant="outline">
              Try Again
            </Button>
          </div>
        ) : filteredCards.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-1"
            }`}
          >
            {filteredCards.map((card) => (
              <CardDisplay key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="heading-md text-gray-700 mb-2">No cards found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* {selectedCard && <CardDetailView card={selectedCard} onClose={() => setSelectedCard(null)} />} */}
    </div>
  )
}
