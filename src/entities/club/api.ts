/**
 * Club entity API endpoints
 *
 * Подключается к базовому RTK Query API через injectEndpoints.
 */
import type { PersonRow } from '@/entities/user';

import { apiBase } from '@/shared/api/base-api';
import { ApiTag } from '@/shared/redux';

import type {
  ClubCard,
  ClubDetails,
  ClubEventAuthoring,
  ClubEventBucket,
  ClubEventsPage,
} from './types';

// Re-export types so consumers can import from a single entry point
export type { ClubCard, ClubDetails, ClubEventAuthoring } from './types';
export type { ClubEventBucket, ClubEventsPage } from './types';
export type { ClubEventListItem } from '@/entities/event/types';

export const clubApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    clubs: builder.query<ClubCard[], void>({
      query: () => '/clubs',
      transformResponse: (response: unknown): ClubCard[] => {
        if (!Array.isArray(response)) return [];
        return response as ClubCard[];
      },
      providesTags: [ApiTag.FEED],
    }),
    clubDetails: builder.query<ClubDetails, { clubId: string }>({
      query: ({ clubId }) => `/clubs/${clubId}`,
      providesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
    clubMembers: builder.query<PersonRow[], { clubId: string }>({
      query: ({ clubId }) => `/clubs/${clubId}/members`,
      providesTags: [ApiTag.FEED],
    }),
    eventAuthoringClubs: builder.query<ClubEventAuthoring[], void>({
      query: () => '/clubs/meta/event-authoring',
      providesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
    clubEvents: builder.query<
      ClubEventsPage,
      { clubId: string; bucket: ClubEventBucket; page?: number; limit?: number }
    >({
      query: ({ clubId, bucket, page = 1, limit = 8 }) =>
        `/clubs/${clubId}/events?bucket=${bucket}&page=${page}&limit=${limit}`,
      providesTags: [ApiTag.FEED],
    }),
    joinClub: builder.mutation<{ status: string }, { clubId: string }>({
      query: ({ clubId }) => ({
        url: `/clubs/${clubId}/join`,
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
      }),
      async onQueryStarted({ clubId }, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          clubApi.util.updateQueryData('clubs', undefined, (draft) => {
            const club = draft.find((c) => c.id === clubId);
            if (club) {
              club.joinedByMe = true;
              club.membersCount += 1;
            }
          }),
        );
        const detailsPatch = dispatch(
          clubApi.util.updateQueryData('clubDetails', { clubId }, (draft) => {
            draft.joinedByMe = true;
            draft.membersCount += 1;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
          detailsPatch.undo();
        }
      },
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
    leaveClub: builder.mutation<{ status: string }, { clubId: string }>({
      query: ({ clubId }) => ({
        url: `/clubs/${clubId}/leave`,
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
      }),
      async onQueryStarted({ clubId }, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          clubApi.util.updateQueryData('clubs', undefined, (draft) => {
            const club = draft.find((c) => c.id === clubId);
            if (club) {
              club.joinedByMe = false;
              club.membersCount = Math.max(0, club.membersCount - 1);
            }
          }),
        );
        const detailsPatch = dispatch(
          clubApi.util.updateQueryData('clubDetails', { clubId }, (draft) => {
            draft.joinedByMe = false;
            draft.membersCount = Math.max(0, draft.membersCount - 1);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
          detailsPatch.undo();
        }
      },
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
    deleteClub: builder.mutation<{ status: string }, { clubId: string }>({
      query: ({ clubId }) => ({
        url: `/clubs/${clubId}`,
        method: 'DELETE',
        headers: { 'idempotency-key': crypto.randomUUID() },
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
    createClub: builder.mutation<
      { id: string },
      {
        title: string;
        description: string;
        categoryCode: string;
        tags?: string[];
        coverUrl?: string;
        coverSeed?: string;
      }
    >({
      query: (body) => ({
        url: '/clubs',
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
        body,
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
    updateClub: builder.mutation<
      { status: string },
      {
        clubId: string;
        title?: string;
        description?: string;
        categoryCode?: string;
        tags?: string[];
        coverUrl?: string;
        coverSeed?: string;
      }
    >({
      query: ({ clubId, ...body }) => ({
        url: `/clubs/${clubId}`,
        method: 'PATCH',
        headers: { 'idempotency-key': crypto.randomUUID() },
        body,
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
  }),
});

export const {
  useClubsQuery,
  useClubDetailsQuery,
  useClubMembersQuery,
  useEventAuthoringClubsQuery,
  useClubEventsQuery,
  useJoinClubMutation,
  useLeaveClubMutation,
  useDeleteClubMutation,
  useCreateClubMutation,
  useUpdateClubMutation,
} = clubApi;
