import { Stat } from '@/types/pokemon';

export function calculateStats(baseStats: Stat[], level: number): Stat[] {
  return baseStats.map(stat => {
    let calculatedValue: number;

    if (stat.name === 'hp') {
      calculatedValue = Math.floor(((2 * stat.base_value + 31 + 5) * level) / 100 + level + 10);
    } else {
      calculatedValue = Math.floor(((2 * stat.base_value + 31 + 5) * level) / 100 + 5);
    }

    return {
      ...stat,
      value: calculatedValue
    };
  });
}

