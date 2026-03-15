import type { RankInfo } from '@/shared/types/rank';

import { ApiTag } from '@/shared/redux';

import { apiBase } from './base-api';

export type FollowingItem = {
  telegramUserId: string;
  fullName: string;
  followedAt: string; // ISO 8601
  rankInfo: RankInfo;
};

export const connectionsApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    following: builder.query<FollowingItem[], void>({
      query: () => '/connections',
      providesTags: [ApiTag.PROFILE],
    }),
    follow: builder.mutation<{ status: string }, { telegramUserId: string }>({
      query: ({ telegramUserId }) => ({
        url: `/connections/${telegramUserId}/follow`,
        method: 'POST',
        headers: {
          'idempotency-key': `follow-${telegramUserId}-${Date.now()}`,
        },
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.NOTIFICATIONS],
    }),
    unfollow: builder.mutation<{ status: string }, { telegramUserId: string }>({
      query: ({ telegramUserId }) => ({
        url: `/connections/${telegramUserId}/unfollow`,
        method: 'POST',
        headers: {
          'idempotency-key': `unfollow-${telegramUserId}-${Date.now()}`,
        },
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.NOTIFICATIONS],
    }),
  }),
});

export const {
  useFollowingQuery,
  useFollowMutation,
  useUnfollowMutation,
} = connectionsApi;
