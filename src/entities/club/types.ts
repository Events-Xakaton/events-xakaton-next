/**
 * Club entity types
 */

// Типы пагинации событий клуба живут здесь, а не в entities/event,
// так как эндпоинт /clubs/:id/events принадлежит клубному API.
export type ClubEventBucket = 'upcoming' | 'ongoing' | 'past';

export type ClubEventsPage = {
  bucket: ClubEventBucket;
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
  items: import('@/entities/event/types').ClubEventListItem[];
};

export type ClubCard = {
  id: string;
  title: string;
  description: string;
  categoryCode: string;
  membersCount: number;
  coverSeed?: string | null;
  coverUrl?: string | null;
  joinedByMe: boolean;
  isCreator: boolean;
};

export type ClubDetails = {
  id: string;
  title: string;
  description: string;
  categoryCode: string;
  coverUrl: string | null;
  creatorTelegramUserId: string;
  creatorName: string;
  membersCount: number;
  joinedByMe: boolean;
  canManage: boolean;
  tags: string[];
  coverSeed: string | null;
};

export type ClubEventAuthoring = {
  id: string;
  title: string;
  role: 'owner' | 'admin' | 'event_manager' | 'member';
};
