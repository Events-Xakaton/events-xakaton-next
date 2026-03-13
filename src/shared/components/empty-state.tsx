"use client";

import { Card, CardTitle, CardDescription } from "./card";

/**
 * EmptyState - Placeholder for empty lists/views
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card variant="outlined" padding="lg" className="text-center">
      <CardTitle as="h3" className="text-lg text-neutral-200">
        {title}
      </CardTitle>
      {description && (
        <CardDescription className="mt-2">{description}</CardDescription>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
