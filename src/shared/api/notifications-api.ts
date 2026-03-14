import { apiBase } from './base-api';
import { ApiTag } from '@/shared/redux';

export type NotificationType = 'event_changed' | 'member_joined';
export type NotificationTargetType = 'club' | 'event';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  preview: string;
  isRead: boolean;
  createdAt: string;
  targetType: NotificationTargetType | null;
  targetId: string | null;
  isTargetAvailable: boolean | null;
};

export const notificationsApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    notifications: builder.query<
      { items: NotificationItem[]; nextCursor: string | null },
      { filter: 'all' | 'unread'; cursor?: string | null }
    >({
      query: ({ filter, cursor }) => {
        const cursorQuery = cursor
          ? `&cursor=${encodeURIComponent(cursor)}`
          : '';
        return `/notifications?filter=${filter}&limit=20${cursorQuery}`;
      },
      providesTags: [ApiTag.NOTIFICATIONS],
    }),
    markRead: builder.mutation<{ status: 'ok' }, { id: string }>({
      query: ({ id }) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
        headers: { 'idempotency-key': `notification-read-${id}-${Date.now()}` },
      }),
      invalidatesTags: [ApiTag.NOTIFICATIONS],
    }),
  }),
});

export const {
  useNotificationsQuery,
  useLazyNotificationsQuery,
  useMarkReadMutation,
} = notificationsApi;
