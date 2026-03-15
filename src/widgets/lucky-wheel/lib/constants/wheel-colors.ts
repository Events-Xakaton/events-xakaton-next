// Цветовая схема PURPLE SOFT — светлая, приятная, соответствует primary-палитре.
export const WHEEL_COLORS = {
  // Мягкий фиолетовый градиент вместо почти чёрного
  background: { start: '#8B6CD0', end: '#4A2A9C' },
  // Светлая лавандовая обводка
  backgroundBorder: { start: '#DDD0FF', end: '#9B6FD4' },
  // Белый указатель — максимальный контраст на фиолетовом фоне
  pointer: { start: '#FFFFFF', end: '#EAE0FF' },
  // Светлый центр
  centralPoint: '#F0EAFF',
  // Чередование: средний и светлый фиолетовый — читаемо, не мрачно
  segments: ['#7048C8', '#C4B0F0', '#8B5EC4', '#DDD0FF'],
} as const;
