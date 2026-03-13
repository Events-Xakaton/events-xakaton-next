"use client";

import { Card } from "./card";
import { Button } from "./button";

/**
 * ErrorState - Error display with retry option
 */
export function ErrorState({
  title,
  onRetry,
}: {
  title: string;
  onRetry?: () => void;
}) {
  return (
    <Card variant="outlined" padding="md">
      <p className="text-sm text-red-400">{title}</p>
      {onRetry && (
        <Button className="mt-3" variant="secondary" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </Card>
  );
}
