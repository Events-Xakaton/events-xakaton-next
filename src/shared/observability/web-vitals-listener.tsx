"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackWebVital } from "@/shared/observability/telemetry";

export function WebVitalsListener() {
  useReportWebVitals((metric) => {
    trackWebVital({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: "rating" in metric ? String(metric.rating) : undefined,
    });
  });

  return null;
}
