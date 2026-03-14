'use client';

import { ChevronRight, Users } from 'lucide-react';
import { FC, useMemo } from 'react';

import { type ClubCard } from '@/entities/club/api';
import { Button, ButtonSize, ButtonVariant, pluralize } from '@/shared/components';
import { buildGradient } from '@/shared/lib/gradient';
import { APP_FEED_SCRIM_CLASS, getClubGradient } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

type Props = {
  club: ClubCard;
  onOpenClub: (clubId: string) => void;
};

export const ProfileClubCard: FC<Props> = ({ club, onOpenClub }) => {
  const cardBackgroundStyle = useMemo(() => {
    if (club.coverSeed) {
      return { background: buildGradient(club.coverSeed, 'club') };
    }
    return { background: getClubGradient(club.id) };
  }, [club.coverSeed, club.id]);

  return (
    <article
      className="relative h-[240px] overflow-hidden rounded-[30px] border border-neutral-200"
      style={cardBackgroundStyle}
      role="article"
      aria-label={`Клуб: ${club.title}`}
      data-feed-card="club"
    >
      <div className={cn('absolute inset-0', APP_FEED_SCRIM_CLASS)} />

      <div className="relative flex h-full flex-col p-5 pb-6">
        <div className="mt-auto">
          <h2 className="font-display text-4xl leading-[0.98] tracking-tight text-white drop-shadow-lg line-clamp-2">
            {club.title}
          </h2>

          <p className="mt-2 flex items-center gap-2 text-sm text-white/90 drop-shadow">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span aria-label={`${club.membersCount} участников`}>
              {club.membersCount}{' '}
              {pluralize(
                club.membersCount,
                'участник',
                'участника',
                'участников',
              )}
            </span>
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.MD}
            onClick={() => onOpenClub(club.id)}
            className="ml-auto rounded-full border-white/25 bg-white/90 p-3 text-zinc-900 shadow-md hover:bg-white"
            aria-label={`Посмотреть детали клуба ${club.title}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </article>
  );
};
