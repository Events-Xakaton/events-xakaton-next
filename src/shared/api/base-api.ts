import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getTelegramInitData, getTelegramUserIdFallback } from "@/shared/lib/telegram";
import { trackApiError } from "@/shared/observability/telemetry";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  prepareHeaders: (headers) => {
    headers.set("content-type", "application/json");
    if (typeof window !== "undefined") {
      const initData = getTelegramInitData();
      if (initData) {
        headers.set("x-telegram-init-data", initData);
      } else {
        headers.set("x-telegram-user-id", getTelegramUserIdFallback());
      }
    }
    return headers;
  },
});

export const apiBase = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (result.error) {
      const url = typeof args === "string" ? args : args.url;
      const method = typeof args === "string" ? "GET" : args.method || "GET";
      trackApiError({
        url,
        method,
        status:
          typeof result.error === "object" &&
          "status" in result.error &&
          typeof result.error.status === "number"
            ? result.error.status
            : undefined,
        requestId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      });
    }
    return result;
  },
  tagTypes: ["Auth", "Feed", "Notifications", "Profile"],
  endpoints: () => ({}),
});
