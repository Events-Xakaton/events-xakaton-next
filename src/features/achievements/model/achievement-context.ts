import { createContext, useContext } from 'react';

import type { AchievementDto } from '@/shared/api/achievements-api';

export type AchievementContextValue = {
  triggerAchievement: (achievements: AchievementDto[]) => void;
};

export const AchievementContext = createContext<AchievementContextValue>({
  triggerAchievement: () => undefined,
});

export function useAchievementContext(): AchievementContextValue {
  return useContext(AchievementContext);
}
