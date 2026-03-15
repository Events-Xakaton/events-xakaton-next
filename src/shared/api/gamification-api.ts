import type { RankInfo } from '@/shared/types/rank';

import { ApiTag } from '@/shared/redux';

import { apiBase } from './base-api';

export type { RankInfo };

export type BalanceRank = {
  level: number;
  title: string;
  label: string;
  pointsToNextLevel: number | null;
};

export type Balance = {
  lifetime: number;
  weekly: number;
  monthly: number;
  rank: BalanceRank;
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
          rankInfo?: RankInfo;
        }>;
        currentUser: {
          rank: number;
          userId: string;
          fullName: string;
          points: number;
          rankInfo?: RankInfo;
        } | null;
      },
      { period: 'weekly' | 'monthly' }
    >({
      query: ({ period }) => `/leaderboard?period=${period}`,
      // Бэкенд возвращает поле `position`, фронтенд ожидает `rank`
      transformResponse: (raw: {
        period: 'weekly' | 'monthly';
        top: Array<{ position: number; userId: string; fullName: string; points: number; rankInfo?: RankInfo }>;
        currentUser: { position: number; userId: string; fullName: string; points: number; rankInfo?: RankInfo } | null;
      }) => ({
        period: raw.period,
        top: raw.top.map(({ position, ...rest }) => ({ rank: position, ...rest })),
        currentUser: raw.currentUser
          ? (({ position, ...rest }) => ({ rank: position, ...rest }))(raw.currentUser)
          : null,
      }),
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
