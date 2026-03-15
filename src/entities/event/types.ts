/**
 * Event entity types
 */

export type EventCard = {
  id: string;
  title: string;
  status: string;
  startsAtUtc: string;
  endsAtUtc?: string | null;
  participantsCount: number;
  freeSpots: number | null;
  minLevel: number | null;
  coverUrl: string | null;
  coverSeed?: string | null;
  isForKids: boolean;
  kidsMinAge: number | null;
  joinedByMe: boolean;
  isOrganizer: boolean;
};

export type EventDetails = {
  id: string;
  title: string;
  description: string;
  locationOrLink: string;
  status: string;
  startsAtUtc: string;
  endsAtUtc: string;
  maxParticipants: number | null;
  participantsCount: number;
  freeSpots: number | null;
  creatorTelegramUserId: string;
  creatorName: string;
  clubId: string | null;
  clubTitle: string | null;
  tags: string[];
  minLevel: number | null;
  coverUrl: string | null;
  coverSeed: string | null;
  isForKids: boolean;
  kidsMinAge: number | null;
  joinedByMe: boolean;
  canManage: boolean;
};

export type ClubEventListItem = {
  id: string;
  title: string;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  startsAtUtc: string;
  endsAtUtc: string;
  participantsCount: number;
  freeSpots: number | null;
  minLevel: number | null;
  isForKids: boolean;
  kidsMinAge: number | null;
};
