import { apiBase } from "./base-api";

export type Balance = {
  lifetime: number;
  weekly: number;
  monthly: number;
};

export type PointsRule = {
  rule: string;
  points: number;
};

export type PointsHistoryItem = {
  id: string;
  ruleCode: string;
  deltaPoints: number;
  createdAt: string;
};

export const gamificationApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    balance: builder.query<Balance, void>({
      query: () => "/points/balance",
      providesTags: ["Profile"],
    }),
    leaderboard: builder.query<{
      period: "weekly" | "monthly";
      top: Array<{ rank: number; userId: string; fullName: string; points: number }>;
      currentUser: { rank: number; userId: string; fullName: string; points: number } | null;
    }, { period: "weekly" | "monthly" }>({
      query: ({ period }) => `/leaderboard?period=${period}`,
      providesTags: ["Profile"],
    }),
    pointsRules: builder.query<PointsRule[], void>({
      query: () => "/points/rules",
      providesTags: ["Profile"],
    }),
    pointsHistory: builder.query<PointsHistoryItem[], void>({
      query: () => "/points/history",
      providesTags: ["Profile"],
    }),
  }),
});

export const {
  useBalanceQuery,
  useLeaderboardQuery,
  usePointsRulesQuery,
  usePointsHistoryQuery,
} = gamificationApi;
