import { Pokemon, Move } from '@/types/pokemon'

const TYPE_CHART: { [key: string]: { [key: string]: number } } = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

interface MoveDetails {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number;
  type: string;
  damage_class: {
    name: string;
  };
  effect_entries: {
    effect: string;
    short_effect: string;
  }[];
  meta: {
    category: {
      name: string;
    };
  };
}

const moveCache: { [key: string]: MoveDetails } = {};

async function fetchMoveDetails(moveName: string): Promise<MoveDetails> {
  if (moveCache[moveName]) {
    return moveCache[moveName];
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName.toLowerCase().replace(' ', '-')}`);
    if (!response.ok) throw new Error(`Failed to fetch move: ${moveName}`);
    const data = await response.json();
    
    const moveDetails: MoveDetails = {
      id: data.id,
      name: data.name,
      accuracy: data.accuracy,
      power: data.power,
      pp: data.pp,
      type: data.type.name,
      damage_class: data.damage_class,
      effect_entries: data.effect_entries,
      meta: data.meta
    };
    
    moveCache[moveName] = moveDetails;
    return moveDetails;
  } catch (error) {
    console.error(`Error fetching move details for ${moveName}:`, error);
    throw error;
  }
}

export async function calculateDamage(
  attacker: Pokemon, 
  defender: Pokemon, 
  moveName: string
): Promise<{ damage: number; message: string }> {
  try {
    const moveDetails = await fetchMoveDetails(moveName);

    // Handle status moves
    if (moveDetails.damage_class.name === 'status') {
      return handleStatusMove(attacker, defender, moveDetails);
    }

    // If move has no power, return 0 damage
    if (!moveDetails.power) {
      return {
        damage: 0,
        message: `${attacker.name} used ${moveDetails.name}, but it had no effect!`
      };
    }

    const level = attacker.level;
    const critical = Math.random() < 0.0625 ? 1.5 : 1; // 6.25% chance of critical hit, 1.5x damage
    const A = moveDetails.damage_class.name === 'physical' ? getStat(attacker, 'attack') : getStat(attacker, 'special-attack');
    const D = moveDetails.damage_class.name === 'physical' ? getStat(defender, 'defense') : getStat(defender, 'special-defense');
    const power = moveDetails.power;

    // Calculate base damage
    let damage = Math.floor(
      ((((2 * level * critical) / 5 + 2) * power * A / D) / 50) + 2
    );

    // Apply STAB (Same Type Attack Bonus)
    const stab = attacker.types.includes(moveDetails.type) ? 1.5 : 1;
    damage = Math.floor(damage * stab);

    // Calculate type effectiveness
    const typeEffectiveness = calculateTypeEffectiveness(moveDetails.type, defender.types);
    damage = Math.floor(damage * typeEffectiveness);

    // Apply random factor (between 0.85 and 1.00, inclusive)
    const random = (Math.floor(Math.random() * 16) + 85) / 100;
    damage = Math.floor(damage * random);

    // Construct message
    let message = `${attacker.name} used ${moveDetails.name}!`;
    if (critical > 1) message += " A critical hit!";
    if (typeEffectiveness > 1) message += " It's super effective!";
    if (typeEffectiveness < 1 && typeEffectiveness > 0) message += " It's not very effective...";
    if (typeEffectiveness === 0) {
      message += " It had no effect...";
      damage = 0;
    }

    return { damage, message };
  } catch (error) {
    console.error('Error in calculateDamage:', error);
    return {
      damage: 0,
      message: `${attacker.name} tried to use ${moveName}, but something went wrong!`
    };
  }
}

function calculateTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
  let effectiveness = 1;
  defenderTypes.forEach(defenderType => {
    if (TYPE_CHART[moveType] && TYPE_CHART[moveType][defenderType]) {
      effectiveness *= TYPE_CHART[moveType][defenderType];
    }
  });
  return effectiveness;
}

function getStat(pokemon: Pokemon, statName: string): number {
  const stat = pokemon.stats.find(s => s.name === statName);
  return stat ? stat.value : 50; // Default to 50 if stat is not found
}

function handleStatusMove(attacker: Pokemon, defender: Pokemon, moveDetails: MoveDetails): { damage: number; message: string } {
  const effect = moveDetails.effect_entries.find(entry => entry.language?.name === 'en')?.short_effect || 'No effect description available.';
  return {
    damage: 0,
    message: `${attacker.name} used ${moveDetails.name}! ${effect}`
  };
}

export async function checkAccuracy(attacker: Pokemon, moveName: string): Promise<boolean> {
  const moveDetails = await fetchMoveDetails(moveName);
  if (moveDetails.accuracy === null) return true; // Moves with null accuracy always hit
  return Math.random() * 100 <= moveDetails.accuracy;
}

export async function selectRandomMove(pokemon: Pokemon): Promise<string> {
  if (!pokemon.moveset || pokemon.moveset.length === 0) {
    return 'struggle';
  }

  const randomIndex = Math.floor(Math.random() * pokemon.moveset.length);
  return pokemon.moveset[randomIndex].name;
}

