'use client';

import { ImagePlus, X } from 'lucide-react';
import { type ChangeEvent, type FC, useRef } from 'react';

import { useUploadBannerMutation } from '@/shared/api/upload-api';
import { cn } from '@/shared/lib/utils';

type Props = {
  coverUrl: string | null;
  onChange: (url: string | null) => void;
  className?: string;
};

export const BannerUpload: FC<Props> = ({ coverUrl, onChange, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadBanner, { isLoading }] = useUploadBannerMutation();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Сбрасываем input, чтобы повторный выбор того же файла сработал
    e.target.value = '';
    const result = await uploadBanner(file);
    if ('data' in result && result.data) {
      onChange(result.data.url);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/45 bg-white/20 px-3.5 text-[11px] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-sm transition hover:bg-white/30 disabled:opacity-50"
      >
        <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
        {isLoading ? '...' : coverUrl ? 'Сменить обложку' : 'Загрузить обложку'}
      </button>

      {coverUrl && !isLoading ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/45 bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
          aria-label="Удалить фото"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
