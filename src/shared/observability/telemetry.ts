export type ApiErrorTelemetry = {
  url: string;
  method: string;
  status?: number;
  requestId: string;
};

export type WebVitalTelemetry = {
  id: string;
  name: string;
  value: number;
  rating?: string;
};

function emit(name: string, payload: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(name, { detail: payload }));
}

export function initFrontendTelemetry(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("error", (event) => {
    emit("frontend.error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    emit("frontend.unhandled_rejection", {
      reason: String(event.reason ?? "unknown"),
    });
  });
}

export function trackApiError(payload: ApiErrorTelemetry): void {
  emit("frontend.api_error", payload);
}

export function trackWebVital(payload: WebVitalTelemetry): void {
  emit("frontend.web_vital", payload);
}
