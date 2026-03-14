export type EventDraftFields = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  maxParticipants: string;
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
  coverSeed: string;
  clubId: string;
};
