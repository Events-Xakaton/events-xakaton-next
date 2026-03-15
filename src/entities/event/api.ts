/**
 * Event entity API endpoints
 *
 * Подключается к базовому RTK Query API через injectEndpoints.
 * Читающие запросы (queries) для событий.
 */
import type { PersonRow } from '@/entities/user';

import { apiBase } from '@/shared/api/base-api';
import { ApiTag } from '@/shared/redux';

import type { ClubEventListItem, EventCard, EventDetails } from './types';

// Re-export types so consumers can import from a single entry point
export type { EventCard, EventDetails, ClubEventListItem } from './types';

export type LuckyWheelStreakRes = {
  currentStreak: number;
  daysUntilFreeSpin: number;
  freeSpinBalance: number;
  hasUsedWeeklySpin: boolean;
  nextWeekKey: string;
};

/** Машинно-читаемые коды ошибок random endpoint согласно контракту lucky-wheel */
export enum LuckyWheelErrorCode {
  NO_ELIGIBLE_EVENTS = 'NO_ELIGIBLE_EVENTS',
  DAILY_LIMIT_REACHED = 'DAILY_LIMIT_REACHED',
}

export type LuckyWheelErrorResponse = {
  message: string;
  code: LuckyWheelErrorCode;
};

export type ClubEventBucket = 'upcoming' | 'ongoing' | 'past';

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
      query: () => '/events',
      transformResponse: (response: unknown): EventCard[] => {
        if (!Array.isArray(response)) return [];
        return response as EventCard[];
      },
      providesTags: [ApiTag.FEED],
    }),
    eventDetails: builder.query<EventDetails, { eventId: string }>({
      query: ({ eventId }) => `/events/${eventId}`,
      providesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
    eventParticipants: builder.query<PersonRow[], { eventId: string }>({
      query: ({ eventId }) => `/events/${eventId}/participants`,
      providesTags: [ApiTag.FEED],
    }),
    randomEvent: builder.query<{ id: string; usedFreeSpin: boolean }, void>({
      query: () => '/events/random',
      providesTags: [ApiTag.FEED],
    }),
    luckyWheelStreak: builder.query<LuckyWheelStreakRes, void>({
      query: () => '/events/lucky-wheel/streak',
    }),
    joinEvent: builder.mutation<
      { status: string },
      { eventId: string; lucky?: boolean }
    >({
      query: ({ eventId, lucky }) => ({
        url: `/events/${eventId}/join${lucky ? '?lucky=true' : ''}`,
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
      }),
      async onQueryStarted({ eventId }, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          eventApi.util.updateQueryData('events', undefined, (draft) => {
            const event = draft.find((e) => e.id === eventId);
            if (event) {
              event.joinedByMe = true;
              event.participantsCount += 1;
              if (event.freeSpots !== null) {
                event.freeSpots = Math.max(0, event.freeSpots - 1);
              }
            }
          }),
        );
        const detailsPatch = dispatch(
          eventApi.util.updateQueryData(
            'eventDetails',
            { eventId },
            (draft) => {
              draft.joinedByMe = true;
              draft.participantsCount += 1;
              if (draft.freeSpots !== null) {
                draft.freeSpots = Math.max(0, draft.freeSpots - 1);
              }
            },
          ),
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
    unjoinEvent: builder.mutation<{ status: string }, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/unjoin`,
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
      }),
      async onQueryStarted({ eventId }, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          eventApi.util.updateQueryData('events', undefined, (draft) => {
            const event = draft.find((e) => e.id === eventId);
            if (event) {
              event.joinedByMe = false;
              event.participantsCount = Math.max(
                0,
                event.participantsCount - 1,
              );
              if (event.freeSpots !== null) {
                event.freeSpots += 1;
              }
            }
          }),
        );
        const detailsPatch = dispatch(
          eventApi.util.updateQueryData(
            'eventDetails',
            { eventId },
            (draft) => {
              draft.joinedByMe = false;
              draft.participantsCount = Math.max(
                0,
                draft.participantsCount - 1,
              );
              if (draft.freeSpots !== null) {
                draft.freeSpots += 1;
              }
            },
          ),
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
    cancelEvent: builder.mutation<{ status: string }, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/cancel`,
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE, ApiTag.NOTIFICATIONS],
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
        minLevel?: number;
        categoryCode: string;
        tags?: string[];
        coverSeed?: string;
      }
    >({
      query: (body) => ({
        url: '/events',
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
        body,
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE],
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
        minLevel?: number | null;
        coverSeed?: string;
        clubId?: string | null;
      }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}`,
        method: 'PATCH',
        headers: { 'idempotency-key': crypto.randomUUID() },
        body,
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE, ApiTag.NOTIFICATIONS],
    }),
    submitAttendanceFeedback: builder.mutation<
      { status: string },
      { eventId: string; rating: number; comment?: string }
    >({
      query: ({ eventId, ...body }) => ({
        url: `/events/${eventId}/feedback`,
        method: 'POST',
        headers: {
          'idempotency-key': crypto.randomUUID(),
        },
        body,
      }),
      invalidatesTags: [ApiTag.FEED, ApiTag.PROFILE],
    }),
    confirmAttendance: builder.mutation<
      { status: string },
      { eventId: string; attendances: Array<{ userId: string; rating?: number }> }
    >({
      query: ({ eventId, attendances }) => ({
        url: `/events/${eventId}/attendance`,
        method: 'POST',
        body: { attendances },
        headers: { 'idempotency-key': crypto.randomUUID() },
      }),
      invalidatesTags: [ApiTag.FEED],
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
  useLuckyWheelStreakQuery,
  useConfirmAttendanceMutation,
} = eventApi;
