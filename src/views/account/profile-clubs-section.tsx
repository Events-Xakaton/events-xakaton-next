'use client';

import { Plus } from 'lucide-react';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import { type ClubCard, useClubsQuery } from '@/entities/club/api';

import { IconButton } from '@/shared/components';
import { ErrorState } from '@/shared/components/error-state';
import { PillTabs } from '@/shared/components/pill-tabs';

import {
  AllClubsPlaceholderCard,
  CreatedClubsPlaceholderCard,
  ProfileClubCard,
} from './ui';

// ============================================================================
// Constants
// ============================================================================

const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';

type ClubCategory = 'all' | 'created';

// ============================================================================
// ProfileClubsSection Component
// ============================================================================

export function ProfileClubsSection({
  onOpenClub,
  onNavigateToCreate,
}: {
  onOpenClub: (clubId: string) => void;
  onNavigateToCreate: () => void;
}): ReactElement {
  const [activeTab, setActiveTab] = useState<ClubCategory>('all');

  const clubsQuery = useClubsQuery();

  const clubCounts = useMemo(() => {
    if (!clubsQuery.data) return { all: 0, created: 0 };

    const allCount = clubsQuery.data.filter((c) => c.joinedByMe).length;
    const createdCount = clubsQuery.data.filter((c) => c.isCreator).length;

    return { all: allCount, created: createdCount };
  }, [clubsQuery.data]);

  const filteredClubs = useMemo(() => {
    if (!clubsQuery.data) return [];

    let filtered: ClubCard[] = [];

    switch (activeTab) {
      case 'all':
        filtered = clubsQuery.data.filter((c) => c.joinedByMe);
        return filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));

      case 'created':
        filtered = clubsQuery.data.filter((c) => c.isCreator);
        return filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));

      default:
        return clubsQuery.data;
    }
  }, [clubsQuery.data, activeTab]);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className={SECTION_TITLE_CLASS}>Клубы</h3>
        <IconButton
          icon={<Plus className="h-5 w-5" />}
          onClick={onNavigateToCreate}
          label="Создать клуб"
        />
      </div>

      <PillTabs<ClubCategory>
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: 'all', label: 'Все', count: clubCounts.all },
          { value: 'created', label: 'Созданные', count: clubCounts.created },
        ]}
      />

      {clubsQuery.isLoading ? (
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4!">
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
        <ErrorState
          title="Не удалось загрузить клубы"
          onRetry={() => clubsQuery.refetch()}
        />
      ) : filteredClubs.length === 0 ? (
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4!">
            {activeTab === 'created' ? (
              <CreatedClubsPlaceholderCard />
            ) : (
              <AllClubsPlaceholderCard />
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 snap-x snap-mandatory scroll-pl-4">
          <div className="flex gap-3 px-4!">
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
