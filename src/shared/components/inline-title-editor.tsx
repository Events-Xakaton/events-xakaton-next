'use client';

import { FC, useEffect, useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Вызывается при blur или Enter — родитель закрывает редактор */
  onCommit: (value: string) => void;
  maxLength?: number;
};

function moveCaretToEnd(node: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export const InlineTitleEditor: FC<Props> = ({
  value,
  onChange,
  onCommit,
  maxLength = 60,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.textContent = value;
    editorRef.current.focus();
    moveCaretToEnd(editorRef.current);
    // Инициализируем DOM только при монтировании — дальнейшие обновления value
    // управляются через contentEditable напрямую
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className="w-full min-h-[1.2em] bg-transparent text-4xl font-bold leading-tight tracking-tight text-white outline-none"
      dir="ltr"
      style={{
        outline: 'none',
        boxShadow: 'none',
        border: 'none',
        WebkitTapHighlightColor: 'transparent',
        caretColor: '#fff',
        direction: 'ltr',
        textAlign: 'left',
        unicodeBidi: 'plaintext',
      }}
      onInput={(e) => {
        const raw = e.currentTarget.textContent ?? '';
        const next = raw.slice(0, maxLength);
        if (next !== raw) {
          e.currentTarget.textContent = next;
          moveCaretToEnd(e.currentTarget);
        }
        onChange(next);
      }}
      onBlur={(e) => {
        onCommit(e.currentTarget.textContent?.trim() ?? '');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onCommit(e.currentTarget.textContent?.trim() ?? '');
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.border = 'none';
      }}
    />
  );
};
