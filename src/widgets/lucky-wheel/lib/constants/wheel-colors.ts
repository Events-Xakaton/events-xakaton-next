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
  // 8 уникальных цветов — циклически применяются к 12 сегментам
  segments: [
    '#E07070',
    '#5B6FD4',
    '#F4A261',
    '#C970B0',
    '#5BC4D4',
    '#7B52C1',
    '#5BD4A0',
    '#A78BDA',
  ],
} as const;
