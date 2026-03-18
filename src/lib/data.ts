export type Rarity = 'common' | 'rare' | 'legendary';

export type GachaPhase =
  | 'idle'
  | 'unlocking'
  | 'opening'
  | 'flipping'
  | 'decelerating'
  | 'nearMiss'
  | 'stopped'
  | 'revealing'
  | 'result';

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  emoji: string;
}

export const characters: Character[] = [
  { id: '1', name: '별빛 여우', rarity: 'common', description: '밤하늘의 별빛을 모으는 여우', emoji: '🦊' },
  { id: '2', name: '달빛 토끼', rarity: 'common', description: '보름달 아래에서 춤추는 토끼', emoji: '🐰' },
  { id: '3', name: '숲의 요정', rarity: 'common', description: '이끼 낀 바위 사이에 사는 작은 요정', emoji: '🧚' },
  { id: '4', name: '수정 용', rarity: 'rare', description: '수정 동굴을 지키는 아기 용', emoji: '🐉' },
  { id: '5', name: '바람의 정령', rarity: 'rare', description: '봄바람을 타고 여행하는 정령', emoji: '🌬' },
  { id: '6', name: '황금 불사조', rarity: 'legendary', description: '천 년에 한 번 깨어나는 전설의 새', emoji: '🔥' },
];

export const rarityConfig: Record<Rarity, {
  label: string;
  color: string;
  glowColor: string;
  spreadColor: string;
  stars: number;
  spreadScale: number;
  spreadDuration: number;
}> = {
  common: {
    label: '일반',
    color: '#d4c5a0',
    glowColor: 'rgba(200, 230, 200, 0.5)',
    spreadColor: 'rgba(40, 35, 25, 0.85)',
    stars: 1,
    spreadScale: 0.6,
    spreadDuration: 1.5,
  },
  rare: {
    label: '레어',
    color: '#c4b5fd',
    glowColor: 'rgba(167, 139, 250, 0.5)',
    spreadColor: 'rgba(167, 139, 250, 0.6)',
    stars: 2,
    spreadScale: 0.8,
    spreadDuration: 1.2,
  },
  legendary: {
    label: '전설',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    spreadColor: 'rgba(251, 191, 36, 0.7)',
    stars: 3,
    spreadScale: 1.6,
    spreadDuration: 0.8,
  },
};

export function rollGacha(): { character: Character; isNearMiss: boolean } {
  const rand = Math.random();
  let rarity: Rarity;
  if (rand < 0.65) rarity = 'common';
  else if (rand < 0.90) rarity = 'rare';
  else rarity = 'legendary';

  const pool = characters.filter(c => c.rarity === rarity);
  const character = pool[Math.floor(Math.random() * pool.length)];

  // Near miss: ~25% chance when result is common
  const isNearMiss = rarity === 'common' && Math.random() < 0.25;

  return { character, isNearMiss };
}
