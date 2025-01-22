'use client'

import React, { useState, useEffect } from 'react'
import { Pokemon, Move, Stat, Ability } from '@/types/pokemon'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import PokemonCard from './PokemonCard'
import BattleVisualization from './BattleVisualization'
import { calculateDamage, checkAccuracy, selectRandomMove } from '@/utils/battleMechanics'
import { calculateStats } from '@/utils/statCalculator'
import { generateRandomMoveset } from '@/utils/movesetGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface BattleSimulatorProps {
  pokemonList: Pokemon[]
}

interface BattleState {
  team1: Pokemon[]
  team2: Pokemon[]
  hp1: number[]
  maxHp1: number[]
  hp2: number[]
  maxHp2: number[]
  currentIndex1: number
  currentIndex2: number
  turn: number
  isExecutingTurn: boolean
}

const BattleSimulator: React.FC<BattleSimulatorProps> = ({ pokemonList }) => {
  const [team1, setTeam1] = useState<Pokemon[]>([])
  const [team2, setTeam2] = useState<Pokemon[]>([])
  const [team1Size, setTeam1Size] = useState<number>(3)
  const [team2Size, setTeam2Size] = useState<number>(3)
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showMovesetDialog, setShowMovesetDialog] = useState<{teamIndex: number, pokemonIndex: number} | null>(null);

  const NATURE_MODIFIERS = {
    Adamant: { attack: 1.1, specialAttack: 0.9 },
    Jolly: { speed: 1.1, specialAttack: 0.9 },
    Naughty: { attack: 1.1, defense: 0.9 },
    Brave: { attack: 1.1, speed: 0.9 },
    Lonely: { attack: 1.1, defense: 0.9 },
    Hasty: { speed: 1.1, defense: 0.9 },
    Careful: { defense: 1.1, specialAttack: 0.9 },
    Relaxed: { defense: 1.1, speed: 0.9 },
    Impish: { defense: 1.1, specialDefense: 0.9 },
    Lax: { defense: 1.1, specialAttack: 0.9 },
    Modest: { specialAttack: 1.1, attack: 0.9 },
    Mild: { specialAttack: 1.1, defense: 0.9 },
    Quiet: { specialAttack: 1.1, speed: 0.9 },
    Rash: { specialAttack: 1.1, specialDefense: 0.9 },
    Calm: { specialDefense: 1.1, attack: 0.9 },
    Gentle: { specialDefense: 1.1, defense: 0.9 },
    Sassy: { specialDefense: 1.1, speed: 0.9 },
    Timid: { speed: 1.1, attack: 0.9 },
    Bold: { defense: 1.1, attack: 0.9 },
    Docile: { attack: 1, defense: 1, speed: 1, specialAttack: 1, specialDefense: 1 },
  };

  const applyNatureModifiers = (pokemon: Pokemon) => {
    const natureModifiers = NATURE_MODIFIERS[pokemon.nature as keyof typeof NATURE_MODIFIERS];
    if (natureModifiers) {
      pokemon.stats = pokemon.stats.map(stat => ({
        ...stat,
        value: Math.floor(stat.value * (natureModifiers[stat.name as keyof typeof natureModifiers] || 1))
      }));
    }
    return pokemon;
  }

  const addToTeam = (teamNumber: 1 | 2, pokemon: Pokemon) => {
    const abilities = ['Adaptability', 'Huge Power', 'Thick Fat', 'Super Luck'];
    const natures = Object.keys(NATURE_MODIFIERS);
    const newPokemon = { 
      ...pokemon, 
      level: 50,
      ability: abilities[Math.floor(Math.random() * abilities.length)],
      nature: natures[Math.floor(Math.random() * natures.length)],
      moveset: generateRandomMoveset(pokemon)
    };
    if (teamNumber === 1 && team1.length < team1Size) {
      setTeam1([...team1, newPokemon])
    } else if (teamNumber === 2 && team2.length < team2Size) {
      setTeam2([...team2, newPokemon])
    }
  }

  const removeFromTeam = (teamNumber: 1 | 2, index: number) => {
    if (teamNumber === 1) {
      setTeam1(team1.filter((_, i) => i !== index))
    } else {
      setTeam2(team2.filter((_, i) => i !== index))
    }
  }

  const updatePokemonLevel = (teamNumber: 1 | 2, index: number, level: number) => {
    const updateTeam = (team: Pokemon[]) =>
      team.map((pokemon, i) => 
        i === index 
          ? { ...pokemon, level, stats: calculateStats(pokemon.stats, level) }
          : pokemon
      );

    if (teamNumber === 1) {
      setTeam1(updateTeam(team1));
    } else {
      setTeam2(updateTeam(team2));
    }
  }

  const generateRandomTeam = (size: number): Pokemon[] => {
    const abilities = ['Adaptability', 'Huge Power', 'Thick Fat', 'Super Luck']; 
    const natures = Object.keys(NATURE_MODIFIERS);
    return [...pokemonList]
      .sort(() => 0.5 - Math.random())
      .slice(0, size)
      .map(pokemon => {
        const newPokemon = {
          ...pokemon,
          level: Math.floor(Math.random() * 95) + 5, 
          stats: calculateStats(pokemon.stats, Math.floor(Math.random() * 95) + 5),
          ability: abilities[Math.floor(Math.random() * abilities.length)],
          nature: natures[Math.floor(Math.random() * natures.length)],
          moveset: generateRandomMoveset(pokemon)
        };
        return applyNatureModifiers(newPokemon);
      });
  }

  const generateRandomBattle = () => {
    const newTeam1 = generateRandomTeam(team1Size)
    const newTeam2 = generateRandomTeam(team2Size)
    setTeam1(newTeam1)
    setTeam2(newTeam2)
    setBattleState(null)
    setBattleLog([])
  }

  const startBattle = () => {
    if (team1.length === 0 || team2.length === 0) {
      console.error('Both teams must have at least one Pokémon')
      return
    }

    const initialState: BattleState = {
      team1: team1.map(applyNatureModifiers),
      team2: team2.map(applyNatureModifiers),
      hp1: team1.map(p => p.stats.find(stat => stat.name === 'hp')?.value || 100),
      maxHp1: team1.map(p => p.stats.find(stat => stat.name === 'hp')?.value || 100),
      hp2: team2.map(p => p.stats.find(stat => stat.name === 'hp')?.value || 100),
      maxHp2: team2.map(p => p.stats.find(stat => stat.name === 'hp')?.value || 100),
      currentIndex1: 0,
      currentIndex2: 0,
      turn: 1,
      isExecutingTurn: false
    }
    setBattleState(initialState)
    setBattleLog([`${team1[0].name} and ${team2[0].name} are sent out to battle!`])
  }

  const executeTurn = async () => {
    if (!battleState || battleState.isExecutingTurn) return;

    setIsLoading(true);
    setBattleState(prev => prev ? { ...prev, isExecutingTurn: true } : null);

    try {
      const { team1, team2, hp1, hp2, maxHp1, maxHp2, currentIndex1, currentIndex2, turn } = battleState;
      let newHp1 = [...hp1];
      let newHp2 = [...hp2];
      let newCurrentIndex1 = currentIndex1;
      let newCurrentIndex2 = currentIndex2;
      let newLog: string[] = [];

      const attackingTeam = turn === 1 ? team1 : team2;
      const defendingTeam = turn === 1 ? team2 : team1;
      const attackingIndex = turn === 1 ? currentIndex1 : currentIndex2;
      const defendingIndex = turn === 1 ? currentIndex2 : currentIndex1;

      const attackingPokemon = attackingTeam[attackingIndex];
      const defendingPokemon = defendingTeam[defendingIndex];

      const selectedMove = await selectRandomMove(attackingPokemon);
      const moveHits = await checkAccuracy(attackingPokemon, selectedMove);

      newLog.push(`${attackingPokemon.name} used ${selectedMove.name}!`);

      if (moveHits) {
        const { damage, message } = await calculateDamage(attackingPokemon, defendingPokemon, selectedMove);
        
        if (damage > 0) {
          if (turn === 1) {
            const oldHp = newHp2[defendingIndex];
            newHp2[defendingIndex] = Math.max(0, oldHp - damage);
            newLog.push(`${defendingPokemon.name} lost ${oldHp - newHp2[defendingIndex]} HP! (${newHp2[defendingIndex]}/${maxHp2[defendingIndex]} HP remaining)`);
          } else {
            const oldHp = newHp1[defendingIndex];
            newHp1[defendingIndex] = Math.max(0, oldHp - damage);
            newLog.push(`${defendingPokemon.name} lost ${oldHp - newHp1[defendingIndex]} HP! (${newHp1[defendingIndex]}/${maxHp1[defendingIndex]} HP remaining)`);
          }
        }
        
        if (message) newLog.push(message);
      } else {
        newLog.push(`${attackingPokemon.name}'s attack missed!`);
      }

      // Check if the defending Pokémon fainted
      if ((turn === 1 && newHp2[defendingIndex] === 0) || (turn === 2 && newHp1[defendingIndex] === 0)) {
        newLog.push(`${defendingPokemon.name} fainted!`);
        
        // Find the next available Pokémon
        const nextIndex = turn === 1 
          ? newHp2.findIndex((hp, i) => i > defendingIndex && hp > 0)
          : newHp1.findIndex((hp, i) => i > defendingIndex && hp > 0);

        if (nextIndex !== -1) {
          if (turn === 1) {
            newCurrentIndex2 = nextIndex;
            newLog.push(`Go! ${team2[nextIndex].name}!`);
          } else {
            newCurrentIndex1 = nextIndex;
            newLog.push(`Go! ${team1[nextIndex].name}!`);
          }
        } else {
          // If no more Pokémon are available, end the battle
          newLog.push(`Team ${turn === 1 ? '2' : '1'} is out of usable Pokémon!`);
          newLog.push(`Team ${turn === 1 ? '1' : '2'} wins the battle!`);
          setBattleState(null);
          setBattleLog(prevLog => [...prevLog, ...newLog]);
          setIsLoading(false);
          return;
        }
      }

      const newState: BattleState = {
        ...battleState,
        hp1: newHp1,
        hp2: newHp2,
        currentIndex1: newCurrentIndex1,
        currentIndex2: newCurrentIndex2,
        turn: turn === 1 ? 2 : 1,
        isExecutingTurn: false
      };

      setBattleState(newState);
      setBattleLog(prevLog => [...prevLog, ...newLog]);

      // Check if the battle has ended
      if (newHp1.every(hp => hp === 0) || newHp2.every(hp => hp === 0)) {
        const winningTeam = newHp1.every(hp => hp === 0) ? 'Team 2' : 'Team 1';
        newLog.push(`${winningTeam} wins the battle!`);
        setBattleState(null);
      }
    } catch (error) {
      console.error('Error executing turn:', error);
      setBattleLog(prevLog => [...prevLog, 'An error occurred during the battle turn.']);
    } finally {
      setIsLoading(false);
      setBattleState(prev => prev ? { ...prev, isExecutingTurn: false } : null);
    }
  };

  const handleMovesetSelection = (teamIndex: number, pokemonIndex: number, selectedMoves: Move[]) => {
    const updatedTeam = teamIndex === 1 ? [...team1] : [...team2];
    updatedTeam[pokemonIndex] = {
      ...updatedTeam[pokemonIndex],
      moveset: selectedMoves
    };
    if (teamIndex === 1) {
      setTeam1(updatedTeam);
    } else {
      setTeam2(updatedTeam);
    }
    setShowMovesetDialog(null);
  };

  const MovesetDialog = ({ pokemon, onClose, onSelect }: { pokemon: Pokemon, onClose: () => void, onSelect: (moves: Move[]) => void }) => {
    const [selectedMoves, setSelectedMoves] = useState<Move[]>(pokemon.moveset || []);
    
    // Combine and format moves data
    const allMoves = [
      ...(pokemon.moves || []).map(move => ({
        name: move.name,
        type: move.type,
        category: 'level-up' as const
      })),
      ...(pokemon.tmMoves || []).map(move => ({
        name: move.name,
        type: move.type,
        category: 'tm' as const
      }))
    ];

    const handleMoveToggle = (move: Move) => {
      if (selectedMoves.find(m => m.name === move.name)) {
        setSelectedMoves(selectedMoves.filter(m => m.name !== move.name));
      } else if (selectedMoves.length < 4) {
        setSelectedMoves([...selectedMoves, move]);
      }
    };

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-[#0F2F2F] border-[#18BFBF] text-[#00FFFF] max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Select Moveset for {pokemon.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
            {allMoves.map((move) => (
              <div key={`${move.name}-${move.category}`} className="flex items-center space-x-2 bg-[rgba(24,191,191,0.1)] p-2 rounded">
                <Checkbox
                  id={move.name}
                  checked={selectedMoves.some(m => m.name === move.name)}
                  onCheckedChange={() => handleMoveToggle(move)}
                  disabled={selectedMoves.length >= 4 && !selectedMoves.some(m => m.name === move.name)}
                  className="border-[#18BFBF]"
                />
                <div className="flex flex-col">
                  <Label htmlFor={move.name} className="text-[#00FFFF]">{move.name}</Label>
                  <span className="text-xs text-[#00FFFF] opacity-70">
                    {move.type} • {move.category === 'level-up' ? 'Level-up' : 'TM'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={() => onSelect(selectedMoves)} 
              disabled={selectedMoves.length !== 4}
              className="bg-[#18BFBF] text-[#0F2F2F] hover:bg-[#18BFBF]/80"
            >
              Confirm Moveset ({selectedMoves.length}/4)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-4 bg-[#0F2F2F] text-[#00FFFF] h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Battle Simulator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[1, 2].map((teamNumber) => (
          <Card key={teamNumber} className="bg-[rgba(24,191,191,0.2)] border-[#18BFBF] text-[#00FFFF]">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-[#00FFFF]">
                <span>Team {teamNumber}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Size: {teamNumber === 1 ? team1Size : team2Size}</span>
                  <Slider
                    min={1}
                    max={6}
                    step={1}
                    value={[teamNumber === 1 ? team1Size : team2Size]}
                    onValueChange={(value) => teamNumber === 1 ? setTeam1Size(value[0]) : setTeam2Size(value[0])}
                    className="w-24"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {(teamNumber === 1 ? team1 : team2).map((pokemon, index) => (
                  <div key={index} className="relative w-full">
                    <PokemonCard 
                      pokemon={pokemon} 
                      selected={false} 
                      megaDynamaxMode={false}
                      showAbilityAndNature={true}
                    />
                    <div className="flex items-center mt-2">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={pokemon.level}
                        onChange={(e) => updatePokemonLevel(teamNumber as 1 | 2, index, parseInt(e.target.value))}
                        className="w-16 mr-2"
                      />
                      <span className="text-sm">Level</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowMovesetDialog({ teamIndex: teamNumber, pokemonIndex: index })}
                    >
                      Select Moves
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 z-10"
                      onClick={() => removeFromTeam(teamNumber as 1 | 2, index)}
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
              <Select onValueChange={(value) => addToTeam(teamNumber as 1 | 2, JSON.parse(value))}>
                <SelectTrigger className="w-full bg-[rgba(24,191,191,0.2)] border-[#18BFBF] text-[#00FFFF]">
                  <SelectValue placeholder="Add Pokémon" className="text-[#00FFFF]" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F2F2F] border-[#18BFBF] text-[#00FFFF]">
                  {pokemonList.map((pokemon) => (
                    <SelectItem key={pokemon.id} value={JSON.stringify(pokemon)} className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)]">
                      {pokemon.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-between mb-4">
        <Button onClick={generateRandomBattle} className="w-[48%]">
          Generate Random Battle
        </Button>
        <Button onClick={startBattle} disabled={team1.length === 0 || team2.length === 0} className="w-[48%]">
          {battleState ? 'Restart Battle' : 'Start Battle'}
        </Button>
      </div>
      {battleState && (
        <>
          <BattleVisualization
            team1={team1}
            team2={team2}
            hp1={battleState.hp1}
            hp2={battleState.hp2}
            maxHp1={battleState.maxHp1}
            maxHp2={battleState.maxHp2}
            currentIndex1={battleState.currentIndex1}
            currentIndex2={battleState.currentIndex2}
          />
          <Button 
            onClick={executeTurn} 
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Executing Turn...' : 'Execute Turn'}
          </Button>
        </>
      )}
      <Card className="bg-[rgba(24,191,191,0.2)] border-[#18BFBF] mt-4 text-[#00FFFF]">
        <CardHeader>
          <CardTitle className="text-[#00FFFF]">Battle Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 overflow-y-auto text-[#00FFFF]">
            {battleLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </CardContent>
      </Card>
      {showMovesetDialog && (
        <MovesetDialog
          pokemon={showMovesetDialog.teamIndex === 1 ? team1[showMovesetDialog.pokemonIndex] : team2[showMovesetDialog.pokemonIndex]}
          onClose={() => setShowMovesetDialog(null)}
          onSelect={(moves) => handleMovesetSelection(showMovesetDialog.teamIndex, showMovesetDialog.pokemonIndex, moves)}
        />
      )}
    </div>
  )
}

export default BattleSimulator

