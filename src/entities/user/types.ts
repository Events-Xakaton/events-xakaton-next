/**
 * User entity types
 *
 * Типы пользователя, используемые в API ответах и UI-компонентах.
 * PersonRow — строка участника/члена клуба в списках.
 */
import type { RankInfo } from '@/shared/types/rank';

export type PersonRow = {
  telegramUserId: string;
  userId?: string; // internal UUID for attendance payload
  fullName: string;
  avatarUrl?: string | null;
  followedByMe: boolean;
  rankInfo?: RankInfo;
  role?: 'owner' | 'admin' | 'event_manager' | 'member';
  rating: number | null; // 1–5 or null
  attendanceConfirmed: boolean; // whether attendance was confirmed
};
