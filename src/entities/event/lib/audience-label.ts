type AudienceInput = {
  isForKids: boolean;
  kidsMinAge: number | null;
};

export function getEventAudienceLabel({
  isForKids,
  kidsMinAge,
}: AudienceInput): string | null {
  if (!isForKids) return null;
  if (typeof kidsMinAge === 'number') return `Для детей ${kidsMinAge}+`;
  return 'Для детей';
}
