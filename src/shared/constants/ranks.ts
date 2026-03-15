export type RankEntry = {
  level: number;
  title: string;
  minPoints: number;
};

/** Эмодзи для каждого уровня — отображается вместо аватарки */
export const RANK_EMOJIS: Record<number, string> = {
  1: '🐣', // Новичок — только вылупился
  2: '🧭', // Исследователь — в поиске
  3: '🙌', // Участник — вовлечён
  4: '🎊', // Тусовщик — веселится
  5: '🔥', // Завсегдатай — горит
  6: '⚡', // Организатор — энергия
  7: '🌐', // Коннектор — связывает людей
  8: '💎', // Амбассадор — ценность
  9: '🌟', // Легенда — сияет
  10: '👑', // Гуру — корона
};

export const RANKS: RankEntry[] = [
  { level: 1, title: 'Новичок', minPoints: 0 },
  { level: 2, title: 'Исследователь', minPoints: 15 },
  { level: 3, title: 'Участник', minPoints: 40 },
  { level: 4, title: 'Тусовщик', minPoints: 90 },
  { level: 5, title: 'Завсегдатай', minPoints: 170 },
  { level: 6, title: 'Организатор', minPoints: 290 },
  { level: 7, title: 'Коннектор', minPoints: 450 },
  { level: 8, title: 'Амбассадор', minPoints: 660 },
  { level: 9, title: 'Легенда', minPoints: 940 },
  { level: 10, title: 'Гуру', minPoints: 1300 },
];
