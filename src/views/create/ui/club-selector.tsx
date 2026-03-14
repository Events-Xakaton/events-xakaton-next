'use client';

import { Check } from 'lucide-react';
import type { FC } from 'react';

import { type ClubEventAuthoring } from '@/entities/club/api';

import { cn, getInitials } from '@/shared/lib/utils';

import { stableColor } from '../lib/create-utils';

type Props = {
  createFromClub: boolean;
  onToggle: () => void;
  selectedClubId: string;
  onSelectClub: (clubId: string) => void;
  clubs: ClubEventAuthoring[];
  isLoading: boolean;
  isError: boolean;
  showAll: boolean;
  onToggleShowAll: () => void;
};

export const ClubSelector: FC<Props> = ({
  createFromClub,
  onToggle,
  selectedClubId,
  onSelectClub,
  clubs,
  isLoading,
  isError,
  showAll,
  onToggleShowAll,
}) => {
  const visibleClubs = showAll ? clubs : clubs.slice(0, 4);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-neutral-900">
            Ивент от клуба
          </p>
          {createFromClub && (
            <p className="text-xs text-neutral-500 leading-relaxed mt-1.5 mb-1">
              Ивент будет опубликован в выбранном клубе
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={createFromClub}
          onClick={onToggle}
          className={cn(
            'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors mt-0.5',
            createFromClub ? 'bg-primary-500' : 'bg-neutral-300',
          )}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
              createFromClub ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {createFromClub ? (
        <>
          {isLoading ? (
            <div className="rounded-2xl bg-neutral-200 p-4 mt-4">
              <p className="text-sm text-neutral-600">
                Загружаем ваши клубы...
              </p>
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl bg-red-100 border border-red-200 p-4 mt-4">
              <p className="text-sm text-red-600">
                Не удалось загрузить список клубов.
              </p>
            </div>
          ) : null}

          {!isLoading && !isError ? (
            clubs.length > 0 ? (
              <>
                <div className="mt-3 space-y-1.5">
                  {visibleClubs.map((club) => {
                    const isSelected = selectedClubId === club.id;
                    const color = stableColor(club.id);
                    return (
                      <button
                        key={club.id}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={
                          isSelected
                            ? `Отменить выбор клуба ${club.title}`
                            : `Выбрать клуб ${club.title}`
                        }
                        className={cn(
                          'group relative w-full rounded-lg p-2.5 text-left transition-all duration-200',
                          'flex items-center gap-3 min-h-[56px]',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
                          isSelected
                            ? 'shadow-md scale-[1.005]'
                            : 'ring-1 ring-neutral-200 hover:ring-neutral-300 shadow-sm hover:shadow active:scale-[0.995]',
                        )}
                        style={{
                          background: isSelected
                            ? color
                            : `linear-gradient(135deg, ${color}12 0%, ${color}06 100%)`,
                        }}
                        onClick={() => onSelectClub(isSelected ? '' : club.id)}
                      >
                        <div
                          className={cn(
                            'h-11 w-11 shrink-0 overflow-hidden rounded-md transition-all duration-200',
                            'grid place-items-center text-sm font-bold text-white shadow-sm',
                            isSelected ? 'scale-95' : 'group-hover:scale-105',
                          )}
                          style={{ background: color }}
                        >
                          {getInitials(club.title) || 'К'}
                        </div>

                        <p
                          className={cn(
                            'flex-1 min-w-0 text-sm font-medium leading-snug transition-colors',
                            isSelected ? 'text-white' : 'text-neutral-900',
                          )}
                        >
                          {club.title}
                        </p>

                        <div
                          className={cn(
                            'h-5 w-5 shrink-0 grid place-items-center rounded-full transition-all duration-200',
                            isSelected
                              ? 'bg-white text-primary-600 scale-100'
                              : 'bg-white/40 text-transparent scale-90 group-hover:bg-white/60',
                          )}
                        >
                          <Check
                            className="h-3.5 w-3.5 stroke-[3px]"
                            aria-hidden="true"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {clubs.length > 4 && (
                  <button
                    type="button"
                    onClick={onToggleShowAll}
                    className="mt-2 w-full text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors"
                  >
                    {showAll ? (
                      <>Свернуть ▲</>
                    ) : (
                      <>
                        Показать еще {clubs.length - 4}{' '}
                        {clubs.length - 4 === 1
                          ? 'клуб'
                          : clubs.length - 4 < 5
                            ? 'клуба'
                            : 'клубов'}{' '}
                        ▼
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="mt-4 rounded-2xl bg-neutral-100 border border-neutral-200 p-4">
                <p className="text-sm text-neutral-700">
                  У вас пока нет созданных клубов.
                </p>
              </div>
            )
          ) : null}
        </>
      ) : null}
    </div>
  );
};
