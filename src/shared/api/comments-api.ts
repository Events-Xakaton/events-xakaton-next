import { ApiTag } from '@/shared/redux';

import { apiBase } from './base-api';

export type CommentItem = {
  id: string;
  authorTelegramUserId: string;
  authorName: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export const commentsApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    comments: builder.query<
      CommentItem[],
      { entityType: 'club' | 'event'; entityId: string }
    >({
      query: ({ entityType, entityId }) =>
        `/comments/${entityType}/${entityId}`,
      providesTags: [ApiTag.FEED],
    }),
    createComment: builder.mutation<
      { id: string },
      { entityType: 'club' | 'event'; entityId: string; text: string }
    >({
      query: (body) => ({
        url: '/comments',
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
        body,
      }),
      invalidatesTags: [ApiTag.FEED],
    }),
    editComment: builder.mutation<
      { status: string },
      { commentId: string; text: string }
    >({
      query: ({ commentId, text }) => ({
        url: `/comments/${commentId}/edit`,
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
        body: { text },
      }),
      invalidatesTags: [ApiTag.FEED],
    }),
    deleteComment: builder.mutation<{ status: string }, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
        headers: { 'idempotency-key': crypto.randomUUID() },
      }),
      invalidatesTags: [ApiTag.FEED],
    }),
  }),
});

export const {
  useCommentsQuery,
  useCreateCommentMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
