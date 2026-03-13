"use client";

import { Card } from "./card";

/**
 * ListSkeleton - Loading placeholder for lists
 */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} variant="default" padding="md">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton mt-2 h-3 w-1/2" />
          <div className="skeleton mt-3 h-9 w-24 rounded-xl" />
        </Card>
      ))}
    </div>
  );
}
