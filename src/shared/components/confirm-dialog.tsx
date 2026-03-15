'use client';

import type { FC } from 'react';
import { useEffect } from 'react';

import { Button, ButtonVariant } from './button';
import {
  Card,
  CardDescription,
  CardPadding,
  CardTitle,
  CardVariant,
} from './card';
import './styles/confirm-dialog.css';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export const ConfirmDialog: FC<Props> = ({
  open,
  title,
  description,
  confirmText,
  cancelText = 'Отмена',
  onCancel,
  onConfirm,
  loading,
}) => {
  useEffect(() => {
    if (!open) return;

    function onEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-description' : undefined}
    >
      <Card
        variant={CardVariant.ELEVATED}
        padding={CardPadding.LG}
        className="w-full max-w-sm !bg-white !border-neutral-200 !shadow-xl"
      >
        <CardTitle id="confirm-dialog-title" className="text-base !text-neutral-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription id="confirm-dialog-description" className="mt-2 !text-neutral-500">
            {description}
          </CardDescription>
        )}
        <div className="confirm-dialog__actions">
          <Button
            className="flex-1 !bg-neutral-100 !border-neutral-200 !text-neutral-900 hover:!bg-neutral-200"
            variant={ButtonVariant.SECONDARY}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            className="flex-1"
            variant={ButtonVariant.DESTRUCTIVE}
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};
