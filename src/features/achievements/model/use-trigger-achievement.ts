import { useAchievementContext } from './achievement-context';

export function useTriggerAchievement(): {
  triggerAchievement: ReturnType<
    typeof useAchievementContext
  >['triggerAchievement'];
} {
  const { triggerAchievement } = useAchievementContext();
  return { triggerAchievement };
}
