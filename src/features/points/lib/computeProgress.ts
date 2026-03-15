import { RANKS } from '@/shared/constants/ranks';

/**
 * Вычисляет прогресс до следующего уровня в процентах (0–100).
 * Формула: (1 - pointsToNextLevel / (nextLevelMin - currentLevelMin)) * 100
 */
export function computeProgress(
  currentLevel: number,
  pointsToNextLevel: number | null,
): number {
  if (pointsToNextLevel === null) return 100;

  const current = RANKS.find((r) => r.level === currentLevel);
  const next = RANKS.find((r) => r.level === currentLevel + 1);

  if (!current || !next) return 100;

  const range = next.minPoints - current.minPoints;
  return Math.min(100, Math.max(0, (1 - pointsToNextLevel / range) * 100));
}
