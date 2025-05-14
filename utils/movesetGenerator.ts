import { Pokemon, Move } from '@/types/pokemon';

export function generateRandomMoveset(pokemon: Pokemon): Move[] {
  const allMoves = [...pokemon.moves, ...pokemon.tmMoves];
  const shuffledMoves = allMoves.sort(() => 0.5 - Math.random());
  return shuffledMoves.slice(0, 4).map(move => ({
    name: move.name,
    type: move.type,
    power: move.power || 0,
    accuracy: move.accuracy || 100,
    pp: move.pp || 20,
    category: move.category || 'physical'
  }));
}

