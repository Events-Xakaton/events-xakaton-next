/**
 * User entity types
 *
 * Типы пользователя, используемые в API ответах и UI-компонентах.
 * PersonRow — строка участника/члена клуба в списках.
 */

export type PersonRow = {
  telegramUserId: string;
  fullName: string;
  avatarUrl?: string | null;
  followedByMe: boolean;
};
