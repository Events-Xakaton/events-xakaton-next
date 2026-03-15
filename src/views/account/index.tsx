'use client';

import { AppHeader, UserRankHeader } from '@/widgets/app-header';

import { getTelegramProfileFallback } from '@/shared/lib/telegram';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  APP_SECTION_CARD_CLASS,
  SAFE_AREA_TOP,
  getBottomPadding,
} from '@/shared/lib/ui-styles';
import { useCurrentUserAvatar } from '@/shared/lib/use-current-user-avatar';

import { ProfileClubsSection } from './profile-clubs-section';
import { ProfileConnectionsSection } from './profile-connections-section';
import { ProfileEventsSection } from './profile-events-section';

const SECTION_CARD = APP_SECTION_CARD_CLASS;

function initials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  );
}

export function AccountScreen({
  onOpenEvent,
  onOpenClub,
  onNavigateToCreate,
}: {
  onOpenEvent: (eventId: string) => void;
  onOpenClub: (clubId: string) => void;
  onNavigateToCreate: (type: 'event' | 'club') => void;
}) {
  const profile = getTelegramProfileFallback();
  const avatarUrl = useCurrentUserAvatar();

  return (
    <div
      className="relative bg-[#f2f2f5]"
      style={{
        minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
        paddingTop: `calc(${SAFE_AREA_TOP} + 148px)`,
        paddingBottom: getBottomPadding('list'),
      }}
    >
      <AppHeader
        mode="fixed"
        topClassName="z-fixed"
        useSafeArea={false}
        showTopGap={false}
        rootStyle={{ paddingTop: `calc(${SAFE_AREA_TOP} + 16px)` }}
        subRow={<UserRankHeader />}
        title="Профиль"
      />

      <div className="space-y-4 px-4!">
        <section className={SECTION_CARD}>
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.fullName}
                className="h-12 w-12 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
                {initials(profile.fullName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-tight text-zinc-900">
                {profile.fullName}
              </p>
              <p className="truncate text-xs text-zinc-500">Это вы</p>
            </div>
          </div>
        </section>

        <ProfileEventsSection
          onOpenEvent={onOpenEvent}
          onNavigateToCreate={() => onNavigateToCreate('event')}
        />

        <ProfileClubsSection
          onOpenClub={onOpenClub}
          onNavigateToCreate={() => onNavigateToCreate('club')}
        />

        <ProfileConnectionsSection />

        <div className="h-2" aria-hidden />
      </div>
    </div>
  );
}
