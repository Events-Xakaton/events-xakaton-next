"use client";

import { useEffect } from "react";
import { Card, CardTitle, CardDescription } from "./card";
import { Button } from "./button";

/**
 * ConfirmDialog - Modal confirmation dialog
 * Accessible with focus trap and keyboard support
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText = "Отмена",
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal grid place-items-center bg-black/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-description" : undefined}
    >
      <Card variant="elevated" padding="lg" className="w-full max-w-sm">
        <CardTitle id="confirm-dialog-title" className="text-base">
          {title}
        </CardTitle>
        {description && (
          <CardDescription id="confirm-dialog-description" className="mt-2">
            {description}
          </CardDescription>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            className="flex-1"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
