'use client';

import { FC, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';

import './styles/overflow-menu.css';

type MenuItem = {
  id: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
};

type Props = {
  items: MenuItem[];
};

export const OverflowMenu: FC<Props> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onDocClick(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="overflow-menu">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Меню действий"
        aria-expanded={open}
        aria-haspopup="true"
        className="overflow-menu__trigger"
      >
        •••
      </button>
      {open && (
        <div role="menu" className="overflow-menu__dropdown">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={cn(
                'overflow-menu__item',
                item.danger
                  ? 'overflow-menu__item--danger'
                  : 'overflow-menu__item--default',
              )}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
