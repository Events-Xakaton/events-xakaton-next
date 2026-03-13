"use client";

import { ServerOff, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

export function BackendError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-500/10">
            <ServerOff className="h-8 w-8 text-red-400" aria-hidden="true" />
          </div>

          <h2 className="mb-2 text-xl font-semibold text-neutral-100">
            Сервер недоступен
          </h2>

          <p className="mb-6 text-sm text-neutral-400">
            Backend не запущен. Выполните в терминале:
          </p>

          <div className="mb-6 w-full rounded-lg bg-neutral-900 p-3">
            <code className="text-sm text-accent-400">
              npm start
            </code>
          </div>

          <p className="mb-6 text-xs text-neutral-500">
            Или используйте: ./scripts/quick-start.sh
          </p>

          {onRetry && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onRetry}
              className="rounded-lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" aria-hidden="true" />
              Повторить
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
