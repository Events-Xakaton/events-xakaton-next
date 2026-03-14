'use client';

import type { FC, RefObject } from 'react';

const INPUT_BASE_CLASS =
  'w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-neutral-300 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  maxLength?: number;
};

export const DescriptionSection: FC<Props> = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  textareaRef,
  maxLength = 1000,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-neutral-900">Описание</h3>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={rows}
        className={INPUT_BASE_CLASS}
        required
      />
    </div>
  );
};
