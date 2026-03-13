/**
 * Club entity API endpoints
 *
 * Подключается к базовому RTK Query API через injectEndpoints.
 */

import { apiBase } from "@/shared/api/base-api";
import type { ClubCard, ClubDetails, ClubEventAuthoring } from "./types";
import type { PersonRow } from "@/entities/user";
import type { ClubEventBucket, ClubEventsPage } from "@/entities/event/api";

// Re-export types so consumers can import from a single entry point
export type { ClubCard, ClubDetails, ClubEventAuthoring } from "./types";
export type { ClubEventBucket, ClubEventsPage } from "@/entities/event/api";
// ClubEventListItem lives in event/types — re-export via event/api
export type { ClubEventListItem } from "@/entities/event/api";

export const clubApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    clubs: builder.query<ClubCard[], void>({
      query: () => "/clubs",
      providesTags: ["Feed"],
    }),
    clubDetails: builder.query<ClubDetails, { clubId: string }>({
      query: ({ clubId }) => `/clubs/${clubId}`,
      providesTags: ["Feed", "Profile"],
    }),
    clubMembers: builder.query<PersonRow[], { clubId: string }>({
      query: ({ clubId }) => `/clubs/${clubId}/members`,
      providesTags: ["Feed"],
    }),
    eventAuthoringClubs: builder.query<ClubEventAuthoring[], void>({
      query: () => "/clubs/meta/event-authoring",
      providesTags: ["Feed", "Profile"],
    }),
    clubEvents: builder.query<
      ClubEventsPage,
      { clubId: string; bucket: ClubEventBucket; page?: number; limit?: number }
    >({
      query: ({ clubId, bucket, page = 1, limit = 8 }) =>
        `/clubs/${clubId}/events?bucket=${bucket}&page=${page}&limit=${limit}`,
      providesTags: ["Feed"],
    }),
    joinClub: builder.mutation<{ status: string }, { clubId: string }>({
      query: ({ clubId }) => ({
        url: `/clubs/${clubId}/join`,
        method: "POST",
        headers: { "idempotency-key": `join-club-${clubId}-${Date.now()}` },
      }),
      invalidatesTags: ["Feed", "Profile"],
    }),
    leaveClub: builder.mutation<{ status: string }, { clubId: string }>({
      query: ({ clubId }) => ({
        url: `/clubs/${clubId}/leave`,
        method: "POST",
        headers: { "idempotency-key": `leave-club-${clubId}-${Date.now()}` },
      }),
      invalidatesTags: ["Feed", "Profile"],
    }),
    deleteClub: builder.mutation<{ status: string }, { clubId: string }>({
      query: ({ clubId }) => ({
        url: `/clubs/${clubId}`,
        method: "DELETE",
        headers: { "idempotency-key": `delete-club-${clubId}-${Date.now()}` },
      }),
      invalidatesTags: ["Feed", "Profile"],
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
        url: "/clubs",
        method: "POST",
        headers: { "idempotency-key": `create-club-${Date.now()}` },
        body,
      }),
      invalidatesTags: ["Feed", "Profile"],
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
        method: "PATCH",
        headers: { "idempotency-key": `update-club-${clubId}-${Date.now()}` },
        body,
      }),
      invalidatesTags: ["Feed", "Profile"],
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
