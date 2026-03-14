import { apiBase } from './base-api';
import { ApiTag } from '@/shared/redux';

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
      query: () => '/points/balance',
      providesTags: [ApiTag.PROFILE],
    }),
    leaderboard: builder.query<
      {
        period: 'weekly' | 'monthly';
        top: Array<{
          rank: number;
          userId: string;
          fullName: string;
          points: number;
        }>;
        currentUser: {
          rank: number;
          userId: string;
          fullName: string;
          points: number;
        } | null;
      },
      { period: 'weekly' | 'monthly' }
    >({
      query: ({ period }) => `/leaderboard?period=${period}`,
      providesTags: [ApiTag.PROFILE],
    }),
    pointsRules: builder.query<PointsRule[], void>({
      query: () => '/points/rules',
      providesTags: [ApiTag.PROFILE],
    }),
    pointsHistory: builder.query<PointsHistoryItem[], void>({
      query: () => '/points/history',
      providesTags: [ApiTag.PROFILE],
    }),
  }),
});

export const {
  useBalanceQuery,
  useLeaderboardQuery,
  usePointsRulesQuery,
  usePointsHistoryQuery,
} = gamificationApi;
