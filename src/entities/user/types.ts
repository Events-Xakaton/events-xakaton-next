/**
 * User entity types
 *
 * Типы пользователя, используемые в API ответах и UI-компонентах.
 * PersonRow — строка участника/члена клуба в списках.
 */

import type { RankInfo } from '@/shared/types/rank';

export type PersonRow = {
  telegramUserId: string;
  fullName: string;
  avatarUrl?: string | null;
  followedByMe: boolean;
  rankInfo?: RankInfo;
  role?: 'owner' | 'admin' | 'event_manager' | 'member';
};
