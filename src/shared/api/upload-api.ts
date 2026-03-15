import {
  getTelegramInitData,
  getTelegramUserIdFallback,
} from '@/shared/lib/telegram';

import { apiBase } from './base-api';

type UploadBannerResponse = {
  url: string;
};

export const uploadApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    uploadBanner: builder.mutation<UploadBannerResponse, File>({
      // Используем queryFn + нативный fetch, так как base-api принудительно
      // ставит content-type: application/json, что ломает multipart/form-data
      queryFn: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
        const headers: Record<string, string> = {};

        if (typeof window !== 'undefined') {
          const initData = getTelegramInitData();
          if (initData) {
            headers['x-telegram-init-data'] = initData;
          } else {
            headers['x-telegram-user-id'] = getTelegramUserIdFallback();
          }
        }

        try {
          const response = await fetch(`${baseUrl}/upload/banner`, {
            method: 'POST',
            body: formData,
            headers,
          });

          if (!response.ok) {
            return {
              error: { status: response.status, data: await response.text() },
            };
          }

          const data = (await response.json()) as UploadBannerResponse;
          return { data };
        } catch (e) {
          return { error: { status: 'FETCH_ERROR', error: String(e) } };
        }
      },
    }),
  }),
});

export const { useUploadBannerMutation } = uploadApi;
