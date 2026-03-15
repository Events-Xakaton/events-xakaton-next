import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { clearAuthSession } from '@/shared/lib/auth-session';
import {
  getTelegramInitData,
  getTelegramUserIdFallback,
} from '@/shared/lib/telegram';
import { trackApiError } from '@/shared/observability/telemetry';
import { ApiTag } from '@/shared/redux';
import { sessionExpired } from '@/shared/store/actions';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  prepareHeaders: (headers, { endpoint }) => {
    headers.set('content-type', 'application/json');
    if (typeof window !== 'undefined') {
      const initData = getTelegramInitData();
      if (initData) {
        headers.set('x-telegram-init-data', initData);
        console.log(
          `[API headers] endpoint="${endpoint}" → x-telegram-init-data присутствует (${initData.length} chars)`,
        );
      } else {
        const fallbackId = getTelegramUserIdFallback();
        headers.set('x-telegram-user-id', fallbackId);
        console.warn(
          `[API headers] endpoint="${endpoint}" → initData отсутствует, fallback x-telegram-user-id="${fallbackId}"`,
        );
      }
    }
    return headers;
  },
});

export const apiBase = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (result.error) {
      const url = typeof args === 'string' ? args : args.url;
      const method = typeof args === 'string' ? 'GET' : args.method || 'GET';
      const status =
        typeof result.error === 'object' &&
        'status' in result.error &&
        typeof result.error.status === 'number'
          ? result.error.status
          : undefined;

      trackApiError({
        url,
        method,
        status,
        requestId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      });

      // При 401 — сессия невалидна: чистим хранилище и сбрасываем auth-state
      if (status === 401) {
        clearAuthSession();
        api.dispatch(sessionExpired());
      }
    }
    return result;
  },
  tagTypes: [
    ApiTag.AUTH,
    ApiTag.FEED,
    ApiTag.NOTIFICATIONS,
    ApiTag.PROFILE,
    ApiTag.ACHIEVEMENTS,
  ],
  endpoints: () => ({}),
});
