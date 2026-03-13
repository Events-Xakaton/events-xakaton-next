"use client";

import { useState } from "react";
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useEditCommentMutation,
} from "@/shared/api/comments-api";
import { formatLocalDateTime } from "@/shared/lib/time";
import { getTelegramUserIdFallback } from "@/shared/lib/telegram";
import { appErrorText } from "@/shared/lib/utils";
import { Button } from "@/shared/components/button";
import { Card } from "@/shared/components/card";
import { Textarea } from "@/shared/components/input";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";

function validateComment(text: string): string {
  const value = text.trim();
  if (!value) return "Комментарий не может быть пустым";
  if (value.length > 500) return "Максимум 500 символов";
  return "";
}

export function CommentsBlock({
  entityType,
  entityId,
  readOnly,
}: {
  entityType: "club" | "event";
  entityId: string;
  readOnly?: boolean;
}) {
  const me = getTelegramUserIdFallback();
  const [draft, setDraft] = useState("");
  const [hint, setHint] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
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
      await createComment({ entityType, entityId, text: draft.trim() }).unwrap();
      setDraft("");
      setHint("");
    } catch (error) {
      setHint(appErrorText(error, "Не удалось сохранить комментарий"));
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
      await editComment({ commentId: editingId, text: editingText.trim() }).unwrap();
      setEditingId(null);
      setEditingText("");
      setHint("");
    } catch (error) {
      setHint(appErrorText(error, "Не удалось обновить комментарий"));
    }
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Комментарии</h3>

      {!readOnly ? (
        <>
          <Textarea rows={3} placeholder="Напишите комментарий" value={draft} maxLength={500} onChange={(e) => setDraft(e.target.value)} />
          <Button className="mt-2" isLoading={createState.isLoading} onClick={() => void create()}>
            Отправить
          </Button>
        </>
      ) : (
        <p className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-500">Для отмененных ивентов новые комментарии недоступны.</p>
      )}
      {hint ? <p className="mt-2 text-sm text-red-500">{hint}</p> : null}

      <div className="mt-4 space-y-3">
        {comments.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
          </div>
        ) : null}
        {comments.isError ? (
          <ErrorState title="Не удалось загрузить комментарии" onRetry={() => void comments.refetch()} />
        ) : null}
        {!comments.isLoading && !comments.isError && (comments.data?.length ?? 0) === 0 ? (
          <EmptyState title="Комментариев пока нет" description="Оставьте первый комментарий." />
        ) : null}
        {(comments.data ?? []).map((item) => {
          const mine = item.authorTelegramUserId === me;
          const editing = editingId === item.id;
          return (
            <div key={item.id} className="rounded-xl border border-zinc-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-900">{item.authorName}</span>
                <span className="text-xs text-zinc-500">{formatLocalDateTime(item.createdAt)}</span>
              </div>

              {!editing ? <p className="break-all text-sm text-zinc-700">{item.text}</p> : null}
              {editing ? <Textarea rows={3} value={editingText} maxLength={500} onChange={(e) => setEditingText(e.target.value)} /> : null}

              {mine && !editing && !readOnly ? (
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingText(item.text);
                    }}
                  >
                    Изменить
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setDeleteTargetId(item.id)}>
                    Удалить
                  </Button>
                </div>
              ) : null}

              {mine && editing && !readOnly ? (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" isLoading={editState.isLoading} onClick={() => void saveEdit()}>
                    Сохранить
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setEditingText("");
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
            .catch((error) => setHint(appErrorText(error, "Не удалось удалить комментарий")));
        }}
      />
    </Card>
  );
}
