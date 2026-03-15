export type EventDraftFields = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  maxParticipants: string;
  minLevel: number | null;
  isForKids: boolean;
  kidsMinAge: number | null;
  coverUrl: string | null;
  coverSeed: string;
  selectedClubId: string;
};

export type EventOriginalData = {
  title: string;
  description: string;
  locationOrLink: string;
  startsAt: string;
  endsAt: string;
  maxParticipants: string;
  minLevel: number | null;
  isForKids: boolean;
  kidsMinAge: number | null;
  coverUrl: string | null;
  coverSeed: string;
  clubId: string;
};
