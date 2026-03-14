'use client';

import { useState } from 'react';

import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useEditCommentMutation,
} from '@/shared/api/comments-api';
import { Button, ButtonSize, ButtonVariant } from '@/shared/components/button';
import { Card } from '@/shared/components/card';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { Textarea } from '@/shared/components/input';
import { getTelegramUserIdFallback } from '@/shared/lib/telegram';
import { formatLocalDateTime } from '@/shared/lib/time';
import { appErrorText } from '@/shared/lib/utils';

import './styles/comments-block.css';

function validateComment(text: string): string {
  const value = text.trim();
  if (!value) return 'Комментарий не может быть пустым';
  if (value.length > 500) return 'Максимум 500 символов';
  return '';
}

export function CommentsBlock({
  entityType,
  entityId,
  readOnly,
}: {
  entityType: 'club' | 'event';
  entityId: string;
  readOnly?: boolean;
}) {
  const me = getTelegramUserIdFallback();
  const [draft, setDraft] = useState('');
  const [hint, setHint] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const comments = useCommentsQuery({ entityType, entityId });
  const [createComment, createState] = useCreateCommentMutation();
  const [editComment, editState] = useEditCommentMutation();
  const [deleteComment, deleteState] = useDeleteCommentMutation();

  async function create() {
    const err = validateComment(draft);
    if (err) {
      setHint(err);
      return;
    }
    try {
      await createComment({
        entityType,
        entityId,
        text: draft.trim(),
      }).unwrap();
      setDraft('');
      setHint('');
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось сохранить комментарий'));
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    const err = validateComment(editingText);
    if (err) {
      setHint(err);
      return;
    }
    try {
      await editComment({
        commentId: editingId,
        text: editingText.trim(),
      }).unwrap();
      setEditingId(null);
      setEditingText('');
      setHint('');
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось обновить комментарий'));
    }
  }

  return (
    <Card className="comments-block">
      <h3 className="comments-block__header">
        Комментарии
      </h3>

      {!readOnly ? (
        <div className="comments-block__form">
          <Textarea
            rows={3}
            placeholder="Напишите комментарий"
            value={draft}
            maxLength={500}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="comments-block__form-submit">
            <Button
              isLoading={createState.isLoading}
              onClick={() => void create()}
            >
              Отправить
            </Button>
          </div>
        </div>
      ) : (
        <p className="comments-block__readonly-notice">
          Для отмененных ивентов новые комментарии недоступны.
        </p>
      )}
      {hint ? <p className="comments-block__hint">{hint}</p> : null}

      <div className="comments-block__list">
        {comments.isLoading ? (
          <div className="comments-block__loading">
            <div className="comments-block__spinner" />
          </div>
        ) : null}
        {comments.isError ? (
          <ErrorState
            title="Не удалось загрузить комментарии"
            onRetry={() => void comments.refetch()}
          />
        ) : null}
        {!comments.isLoading &&
        !comments.isError &&
        (comments.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="Комментариев пока нет"
            description="Оставьте первый комментарий."
          />
        ) : null}
        {(comments.data ?? []).map((item) => {
          const mine = item.authorTelegramUserId === me;
          const editing = editingId === item.id;
          return (
            <div
              key={item.id}
              className="comments-block__item"
            >
              <div className="comments-block__item-meta">
                <span className="comments-block__item-author">
                  {item.authorName}
                </span>
                <span className="comments-block__item-date">
                  {formatLocalDateTime(item.createdAt)}
                </span>
              </div>

              {!editing ? (
                <p className="comments-block__item-text">{item.text}</p>
              ) : null}
              {editing ? (
                <Textarea
                  rows={3}
                  value={editingText}
                  maxLength={500}
                  onChange={(e) => setEditingText(e.target.value)}
                />
              ) : null}

              {mine && !editing && !readOnly ? (
                <div className="comments-block__item-actions">
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    size={ButtonSize.SM}
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingText(item.text);
                    }}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    size={ButtonSize.SM}
                    onClick={() => setDeleteTargetId(item.id)}
                  >
                    Удалить
                  </Button>
                </div>
              ) : null}

              {mine && editing && !readOnly ? (
                <div className="comments-block__item-actions">
                  <Button
                    size={ButtonSize.SM}
                    isLoading={editState.isLoading}
                    onClick={() => void saveEdit()}
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    size={ButtonSize.SM}
                    onClick={() => {
                      setEditingId(null);
                      setEditingText('');
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Удалить комментарий?"
        description="Это действие нельзя отменить."
        confirmText="Удалить"
        loading={deleteState.isLoading}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (!deleteTargetId) return;
          void deleteComment({ commentId: deleteTargetId })
            .unwrap()
            .then(() => setDeleteTargetId(null))
            .catch((error) =>
              setHint(appErrorText(error, 'Не удалось удалить комментарий')),
            );
        }}
      />
    </Card>
  );
}
