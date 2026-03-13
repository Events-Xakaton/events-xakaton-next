/**
 * Event entity API endpoints
 *
 * Подключается к базовому RTK Query API через injectEndpoints.
 * Читающие запросы (queries) для событий.
 */

import { apiBase } from "@/shared/api/base-api";
import type { EventCard, EventDetails, ClubEventListItem } from "./types";
import type { PersonRow } from "@/entities/user";

// Re-export types so consumers can import from a single entry point
export type { EventCard, EventDetails, ClubEventListItem } from "./types";

export type ClubEventBucket = "upcoming" | "ongoing" | "past";

export type ClubEventsPage = {
  bucket: ClubEventBucket;
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
  items: ClubEventListItem[];
};

export const eventApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    events: builder.query<EventCard[], void>({
      query: () => "/events",
      providesTags: ["Feed"],
    }),
    eventDetails: builder.query<EventDetails, { eventId: string }>({
      query: ({ eventId }) => `/events/${eventId}`,
      providesTags: ["Feed", "Profile"],
    }),
    eventParticipants: builder.query<PersonRow[], { eventId: string }>({
      query: ({ eventId }) => `/events/${eventId}/participants`,
      providesTags: ["Feed"],
    }),
    randomEvent: builder.query<{ id: string }, void>({
      query: () => "/events/random",
      providesTags: ["Feed"],
    }),
    joinEvent: builder.mutation<{ status: string }, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/join`,
        method: "POST",
        headers: { "idempotency-key": `join-event-${eventId}-${Date.now()}` },
      }),
      invalidatesTags: ["Feed", "Profile"],
    }),
    unjoinEvent: builder.mutation<{ status: string }, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/unjoin`,
        method: "POST",
        headers: { "idempotency-key": `unjoin-event-${eventId}-${Date.now()}` },
      }),
      invalidatesTags: ["Feed", "Profile"],
    }),
    cancelEvent: builder.mutation<{ status: string }, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/cancel`,
        method: "POST",
        headers: { "idempotency-key": `cancel-event-${eventId}-${Date.now()}` },
      }),
      invalidatesTags: ["Feed", "Profile", "Notifications"],
    }),
    createEvent: builder.mutation<
      { id: string },
      {
        clubId?: string;
        title: string;
        description: string;
        locationOrLink: string;
        startsAtUtc: string;
        endsAtUtc: string;
        maxParticipants?: number;
        categoryCode: string;
        tags?: string[];
        coverSeed?: string;
      }
    >({
      query: (body) => ({
        url: "/events",
        method: "POST",
        headers: { "idempotency-key": `create-event-${Date.now()}` },
        body,
      }),
      invalidatesTags: ["Feed", "Profile"],
    }),
    updateEvent: builder.mutation<
      { status: string },
      {
        eventId: string;
        title?: string;
        description?: string;
        locationOrLink?: string;
        startsAtUtc?: string;
        endsAtUtc?: string;
        maxParticipants?: number;
        coverSeed?: string;
        clubId?: string | null;
      }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}`,
        method: "PATCH",
        headers: { "idempotency-key": `update-event-${eventId}-${Date.now()}` },
        body,
      }),
      invalidatesTags: ["Feed", "Profile", "Notifications"],
    }),
    submitAttendanceFeedback: builder.mutation<
      { status: string },
      { eventId: string; rating: number; comment?: string }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/feedback`,
        method: "POST",
        headers: { "idempotency-key": `event-feedback-${eventId}-${Date.now()}` },
        body,
      }),
      invalidatesTags: ["Feed", "Profile"],
    }),
  }),
});

export const {
  useEventsQuery,
  useEventDetailsQuery,
  useEventParticipantsQuery,
  useRandomEventQuery,
  useLazyRandomEventQuery,
  useJoinEventMutation,
  useUnjoinEventMutation,
  useCancelEventMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useSubmitAttendanceFeedbackMutation,
} = eventApi;
