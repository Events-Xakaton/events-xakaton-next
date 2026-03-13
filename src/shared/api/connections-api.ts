import { apiBase } from "./base-api";

export const connectionsApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    follow: builder.mutation<{ status: string }, { telegramUserId: string }>({
      query: ({ telegramUserId }) => ({
        url: `/connections/${telegramUserId}/follow`,
        method: "POST",
        headers: { "idempotency-key": `follow-${telegramUserId}-${Date.now()}` },
      }),
      invalidatesTags: ["Feed", "Notifications"],
    }),
    unfollow: builder.mutation<{ status: string }, { telegramUserId: string }>({
      query: ({ telegramUserId }) => ({
        url: `/connections/${telegramUserId}/unfollow`,
        method: "POST",
        headers: { "idempotency-key": `unfollow-${telegramUserId}-${Date.now()}` },
      }),
      invalidatesTags: ["Feed", "Notifications"],
    }),
  }),
});

export const { useFollowMutation, useUnfollowMutation } = connectionsApi;
