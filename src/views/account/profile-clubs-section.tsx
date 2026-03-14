'use client';

import { ChevronRight, Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  type ClubCard,
  useClubDetailsQuery,
  useClubsQuery,
} from '@/entities/club/api';

import { Button, ButtonSize, ButtonVariant, IconButton, pluralize } from '@/shared/components';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { PillTabs } from '@/shared/components/pill-tabs';
import { buildGradient } from '@/shared/lib/gradient';
import { APP_FEED_SCRIM_CLASS, getClubGradient } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

// ============================================================================
// Constants
// ============================================================================

const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

type ClubCategory = 'all' | 'created';

const EMPTY_MESSAGES: Record<
  ClubCategory,
  { title: string; description: string }
> = {
  all: {
    title: 'Нет клубов',
    description: 'Вы не вступили ни в один клуб',
  },
  created: {
    title: 'Нет созданных клубов',
    description: 'Вы ещё не создали ни одного клуба',
  },
};

// ============================================================================
// CreatedClubsPlaceholderCard Component
// ============================================================================

function CreatedClubsPlaceholderCard() {
  return (
    <div
      className={cn(
        'snap-start snap-always w-[min(85vw,320px)] h-[240px] shrink-0',
        'rounded-2xl border-2 border-dashed border-neutral-300',
        'bg-transparent',
        'flex flex-col items-center justify-center gap-3',
      )}
      aria-label="Нет созданных клубов"
    >
      <div className="rounded-full bg-neutral-100 p-4">
        <Users className="h-8 w-8 text-neutral-500" />
      </div>
      <p className="text-lg font-semibold text-neutral-900">
        Нет созданных клубов
      </p>
      <p className="text-sm text-neutral-600">
        Создайте клуб для единомышленников
      </p>
    </div>
  );
}

// ============================================================================
// ProfileClubCard Component
// ============================================================================

function ProfileClubCard({
  club,
  onOpenClub,
}: {
  club: ClubCard;
  onOpenClub: (clubId: string) => void;
}) {
  const details = useClubDetailsQuery({ clubId: club.id });

  const cardBackgroundStyle = useMemo(() => {
    if (details.data?.coverUrl) {
      return {
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(2,6,23,0.65) 100%), url('${details.data.coverUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    if (club.coverSeed) {
      return { background: buildGradient(club.coverSeed, 'club') };
    }

    return { background: getClubGradient(club.id) };
  }, [details.data?.coverUrl, club.coverSeed, club.id]);

  return (
    <article
      className="relative h-[240px] overflow-hidden rounded-[30px] border border-neutral-200"
      style={cardBackgroundStyle}
      role="article"
      aria-label={`Клуб: ${club.title}`}
      data-feed-card="club"
    >
      {/* Scrim overlay */}
      <div className={cn('absolute inset-0', APP_FEED_SCRIM_CLASS)} />

      <div className="relative flex h-full flex-col p-5 pb-6">
        {/* Контент внизу */}
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

        {/* Кнопка Детали */}
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
}

// ============================================================================
// ProfileClubsSection Component
// ============================================================================

export function ProfileClubsSection({
  onOpenClub,
  onNavigateToCreate,
}: {
  onOpenClub: (clubId: string) => void;
  onNavigateToCreate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ClubCategory>('all');

  // Data fetching
  const clubsQuery = useClubsQuery();

  // Calculate counts for each tab
  const clubCounts = useMemo(() => {
    if (!clubsQuery.data) return { all: 0, created: 0 };

    const allCount = clubsQuery.data.filter((c) => c.joinedByMe).length;
    const createdCount = clubsQuery.data.filter((c) => c.isCreator).length;

    return { all: allCount, created: createdCount };
  }, [clubsQuery.data]);

  // Filter and sort logic
  const filteredClubs = useMemo(() => {
    if (!clubsQuery.data) return [];

    let filtered: ClubCard[] = [];

    switch (activeTab) {
      case 'all':
        // Все клубы, куда вступил пользователь
        filtered = clubsQuery.data.filter((c) => c.joinedByMe);
        // Сортировка: по названию (алфавит)
        return filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));

      case 'created':
        // Клубы, созданные пользователем
        filtered = clubsQuery.data.filter((c) => c.isCreator);
        // Сортировка: по названию (алфавит)
        return filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));

      default:
        return clubsQuery.data;
    }
  }, [clubsQuery.data, activeTab]);

  return (
    <section className="space-y-2">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <h3 className={SECTION_TITLE_CLASS}>Клубы</h3>
        <IconButton
          icon={<Plus className="h-5 w-5" />}
          onClick={onNavigateToCreate}
          label="Создать клуб"
        />
      </div>

      {/* Tabs */}
      <PillTabs<ClubCategory>
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: 'all', label: 'Все', count: clubCounts.all },
          { value: 'created', label: 'Созданные', count: clubCounts.created },
        ]}
      />

      {/* Content */}
      {clubsQuery.isLoading ? (
        // Loading state
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="snap-start w-[min(85vw,320px)] h-[240px] shrink-0 rounded-2xl bg-neutral-200 animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      ) : clubsQuery.isError ? (
        // Error state
        <ErrorState
          title="Не удалось загрузить клубы"
          onRetry={() => clubsQuery.refetch()}
        />
      ) : filteredClubs.length === 0 ? (
        // Empty state
        activeTab === 'created' ? (
          // Placeholder card для созданных клубов
          <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
            <div className="flex gap-3 px-4">
              <CreatedClubsPlaceholderCard />
            </div>
          </div>
        ) : (
          <EmptyState
            title={EMPTY_MESSAGES[activeTab].title}
            description={EMPTY_MESSAGES[activeTab].description}
            action={
              <button
                onClick={onNavigateToCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Создать клуб
              </button>
            }
          />
        )
      ) : (
        // Horizontal scroll with clubs
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4">
            {/* Club cards */}
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="snap-start snap-always w-[min(85vw,320px)] shrink-0"
              >
                <ProfileClubCard club={club} onOpenClub={onOpenClub} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
