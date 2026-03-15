export type RankInfo = {
  level: number;             // 1–10
  title: string;             // "Новичок" … "Гуру"
  label: string;             // "Ур. 3 · Участник"
  pointsToNextLevel: number | null; // null на уровне 10
};
