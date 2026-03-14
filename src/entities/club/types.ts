/**
 * Club entity types
 */

export type ClubCard = {
  id: string;
  title: string;
  description: string;
  categoryCode: string;
  membersCount: number;
  coverSeed?: string | null;
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
