import { ApiTag } from '@/shared/redux';

import { apiBase } from './base-api';

export type AchievementDto = {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  isActive: boolean;
};

export const achievementsApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    getUserAchievements: builder.query<AchievementDto[], void>({
      query: () => '/achievements/me',
      transformResponse: (res: AchievementDto[]): AchievementDto[] => res,
      providesTags: [ApiTag.ACHIEVEMENTS],
    }),
    setActiveAchievement: builder.mutation<
      void,
      { achievementId: string | null }
    >({
      query: (body) => ({
        url: '/achievements/me/active',
        method: 'POST',
        body,
      }),
      invalidatesTags: [ApiTag.ACHIEVEMENTS, ApiTag.PROFILE],
    }),
  }),
});

export const { useGetUserAchievementsQuery, useSetActiveAchievementMutation } =
  achievementsApi;
