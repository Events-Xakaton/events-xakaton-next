/**
 * Auth feature API endpoints
 *
 * Двухфакторная аутентификация через Reddy-мессенджер:
 * 1. requestCode — запрос OTP-кода на указанный Reddy ID
 * 2. verifyCode — подтверждение кода
 * 3. reverify — повторная верификация (если сессия устарела)
 */
import { apiBase } from '@/shared/api/base-api';
import { ApiTag } from '@/shared/redux';

// Генерация криптографически безопасного ключа идемпотентности
const generateIdempotencyKey = (prefix: string): string => {
  return `${prefix}-${crypto.randomUUID()}`;
};

export const authApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    requestCode: builder.mutation<
      { status: string; ttlSec: number },
      { reddyUserKey: string }
    >({
      query: ({ reddyUserKey }) => ({
        url: '/auth/request-code',
        method: 'POST',
        headers: {
          'idempotency-key': generateIdempotencyKey('otp'),
        },
        body: { reddyUserKey },
      }),
    }),
    verifyCode: builder.mutation<
      { status: string },
      { reddyUserKey: string; code: string }
    >({
      query: ({ reddyUserKey, code }) => ({
        url: '/auth/verify-code',
        method: 'POST',
        headers: {
          'idempotency-key': generateIdempotencyKey('verify'),
        },
        body: { reddyUserKey, code },
      }),
      invalidatesTags: [ApiTag.AUTH, ApiTag.FEED, ApiTag.PROFILE],
    }),
    reverify: builder.mutation<{ status: string; ttlSec: number }, void>({
      query: () => ({
        url: '/auth/re-verify',
        method: 'POST',
        headers: {
          'idempotency-key': generateIdempotencyKey('reverify'),
        },
      }),
    }),
  }),
});

export const {
  useRequestCodeMutation,
  useVerifyCodeMutation,
  useReverifyMutation,
} = authApi;
