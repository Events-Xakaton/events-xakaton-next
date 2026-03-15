'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useCreateClubMutation } from '@/entities/club/api';

import { buildGradient, newSeed } from '@/shared/lib/gradient';
import { appErrorText } from '@/shared/lib/utils';

export function useClubForm({
  onCreated,
}: {
  onCreated?: (clubId: string) => void;
} = {}) {
  const [createClub, { isLoading: isSubmitting }] = useCreateClubMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverSeed, setCoverSeed] = useState(() => newSeed('club'));
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [hint, setHint] = useState('');

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!descriptionRef.current) return;
    descriptionRef.current.style.height = 'auto';
    descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
  }, [description]);

  const coverBackground = useMemo(() => {
    if (coverUrl) return `url('${coverUrl}') center / cover no-repeat`;
    return buildGradient(coverSeed, 'club');
  }, [coverUrl, coverSeed]);

  const canPublish = title.trim().length > 0 && description.trim().length > 0;

  async function submit(): Promise<void> {
    setHint('');
    try {
      const result = await createClub({
        title: title.trim(),
        description: description.trim(),
        categoryCode: 'general',
        coverUrl: coverUrl ?? undefined,
        coverSeed,
      }).unwrap();
      const createdClubId = result.id;
      setTitle('');
      setDescription('');
      setCoverUrl(null);
      setShowTitleEditor(false);
      onCreated?.(createdClubId);
    } catch (error) {
      setHint(appErrorText(error, 'Не удалось создать клуб.'));
    }
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    coverSeed,
    changeCoverSeed: () => setCoverSeed(newSeed('club')),
    coverUrl,
    setCoverUrl,
    showTitleEditor,
    setShowTitleEditor,
    hint,
    canPublish,
    isSubmitting,
    coverBackground,
    descriptionRef,
    submit,
  };
}
