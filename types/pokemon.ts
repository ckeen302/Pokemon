export interface Move {
  name: string;
  type: string;
  power?: number;
  accuracy?: number;
  pp: number;
  category: 'physical' | 'special' | 'status';
}

export interface Stat {
  name: string;
  base_value: number;
  value: number;
}

export interface Ability {
  name: string;
  effect: string;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  officialArtwork: string;
  types: string[];
  stats: Stat[];
  moves: Move[];
  tmMoves: { name: string; type: string }[];
  height: number;
  weight: number;
  region?: string;
  level: number;
  ability: string;
  nature: string;
  megaForm?: {
    name: string;
    image: string;
    types: string[];
    stats: Stat[];
    ability: string;
  };
  dynamaxForm?: {
    name: string;
    image: string;
  };
  moveset: Move[];
}

