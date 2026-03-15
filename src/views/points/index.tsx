'use client';

import {
  Award,
  ChevronDown,
  ChevronUp,
  Medal,
  Star,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';

import { AchievementCard } from '@/entities/achievement';

import { AppHeader, UserRankHeader } from '@/widgets/app-header';

import {
  useGetUserAchievementsQuery,
  useSetActiveAchievementMutation,
} from '@/shared/api/achievements-api';
import {
  useBalanceQuery,
  useLeaderboardQuery,
  usePointsHistoryQuery,
  usePointsRulesQuery,
} from '@/shared/api/gamification-api';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { RankBadge } from '@/shared/components/rank-badge';
import { RANK_EMOJIS } from '@/shared/constants/ranks';
import { getTelegramProfileFallback } from '@/shared/lib/telegram';
import { formatLocalDateTime } from '@/shared/lib/time';
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  APP_SECTION_CARD_CLASS,
  SAFE_AREA_TOP,
  getBottomPadding,
} from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/utils';

const SECTION_CARD = APP_SECTION_CARD_CLASS;
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-neutral-900';
const SECONDARY_TOGGLE_CLASS =
  'w-full rounded-2xl border border-neutral-200 bg-white px-4! py-3! text-left text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 active:bg-neutral-100';

const POINTS_RULE_LABELS: Record<string, string> = {
  club_create: 'Создание клуба',
  event_create: 'Создание ивента',
  club_join: 'Вступление в клуб',
  event_join: 'Участие в ивенте',
  attendance_feedback: 'Отзыв после ивента',
  club_new_member_bonus: 'Бонус за нового участника клуба',
  club_join_rollback: 'Отмена вступления в клуб',
  event_join_rollback: 'Отмена участия в ивенте',
  event_create_rollback: 'Отмена созданного ивента',
  club_create_rollback: 'Отмена созданного клуба',
  attendance_rollback: 'Отмена начисления за отзыв',
  admin_adjustment: 'Ручная корректировка',
};

function rankBadge(rank: number | null): string {
  if (rank === null) return '—';
  if (rank === 1) return '1';
  if (rank === 2) return '2';
  if (rank === 3) return '3';
  return String(rank);
}

function pointsRuleLabel(code: string): string {
  const normalized = code.trim().toLowerCase();
  if (POINTS_RULE_LABELS[normalized]) {
    return POINTS_RULE_LABELS[normalized];
  }
  return code.replaceAll('_', ' ');
}

function rankRowClass(rank: number | null, isCurrentUser: boolean): string {
  if (rank === 1) {
    return 'border-amber-300 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50';
  }
  if (rank === 2) {
    return 'border-slate-300 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50';
  }
  if (rank === 3) {
    return 'border-orange-300 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50';
  }
  if (isCurrentUser) {
    return 'border-blue-300 bg-blue-50';
  }
  return 'border-zinc-200 bg-white';
}

function rankBadgeClass(rank: number | null, isCurrentUser: boolean): string {
  if (rank === 1) {
    return 'border-amber-300 bg-amber-100 text-amber-800';
  }
  if (rank === 2) {
    return 'border-slate-300 bg-slate-100 text-slate-700';
  }
  if (rank === 3) {
    return 'border-orange-300 bg-orange-100 text-orange-800';
  }
  if (isCurrentUser) {
    return 'border-blue-300 bg-blue-100 text-blue-700';
  }
  return 'border-zinc-200 bg-zinc-100 text-zinc-700';
}

export function PointsScreen() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const profile = getTelegramProfileFallback();
  const balance = useBalanceQuery();
  const leaderboard = useLeaderboardQuery({ period });
  const rules = usePointsRulesQuery();
  const history = usePointsHistoryQuery();
  const achievements = useGetUserAchievementsQuery();
  const [setActiveAchievement, { isLoading: isAchievementPending }] =
    useSetActiveAchievementMutation();

  const top = leaderboard.data?.top ?? [];
  const current = leaderboard.data?.currentUser ?? null;
  const topTen = top.slice(0, 10);
  const inTopTen = current
    ? topTen.some((row) => row.userId === current.userId)
    : false;

  const primaryLoading = balance.isLoading || leaderboard.isLoading;
  const primaryError = balance.isError || leaderboard.isError;

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
        title="Очки"
      />

      <div className="space-y-4 px-4!">
        {primaryLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
          </div>
        ) : null}

        {primaryError ? (
          <ErrorState
            title="Не удалось загрузить данные очков"
            onRetry={() => {
              void balance.refetch();
              void leaderboard.refetch();
            }}
          />
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3">
              <article
                className={cn(
                  SECTION_CARD,
                  'space-y-2 bg-gradient-to-br from-amber-50 to-amber-100',
                )}
              >
                <Star className="h-5 w-5 text-amber-600" aria-hidden="true" />
                <p className="text-xs text-amber-700">Очки за все время</p>
                <p className="text-2xl font-semibold text-amber-900">
                  {balance.data?.lifetime ?? '-'}
                </p>
              </article>
              <article
                className={cn(
                  SECTION_CARD,
                  'space-y-2 bg-gradient-to-br from-blue-50 to-blue-100',
                )}
              >
                <Medal className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <p className="text-xs text-blue-700">Очки за неделю</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {balance.data?.weekly ?? '-'}
                </p>
              </article>
            </section>

            <section className={SECTION_CARD}>
              <h3 className={SECTION_TITLE_CLASS}>Мои достижения</h3>
              {achievements.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
                </div>
              ) : null}
              {!achievements.isLoading &&
              (achievements.data?.length ?? 0) === 0 ? (
                <EmptyState
                  title="Достижений пока нет"
                  description="Получай достижения, создавая события и участвуя в жизни клубов"
                />
              ) : null}
              {!achievements.isLoading &&
              (achievements.data?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {(achievements.data ?? []).map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isPending={isAchievementPending}
                      onApply={(id) =>
                        void setActiveAchievement({ achievementId: id })
                      }
                      onRemove={() =>
                        void setActiveAchievement({ achievementId: null })
                      }
                    />
                  ))}
                </div>
              ) : null}
            </section>

            <section className={SECTION_CARD}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className={SECTION_TITLE_CLASS}>Лидерборд</h3>
                  <p className="text-xs text-neutral-500">топ-10</p>
                </div>
                <div className="inline-flex min-h-[44px] items-center rounded-full border border-neutral-300 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPeriod('weekly')}
                    className={cn(
                      'min-h-[34px] rounded-full px-3! text-xs font-semibold transition-colors',
                      period === 'weekly'
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-neutral-700 hover:bg-neutral-100',
                    )}
                    aria-pressed={period === 'weekly'}
                  >
                    Неделя
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('monthly')}
                    className={cn(
                      'min-h-[34px] rounded-full px-3! text-xs font-semibold transition-colors',
                      period === 'monthly'
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-neutral-700 hover:bg-neutral-100',
                    )}
                    aria-pressed={period === 'monthly'}
                  >
                    Месяц
                  </button>
                </div>
              </div>

              <div className="relative min-h-[220px] space-y-2">
                {leaderboard.isFetching ? (
                  <div className="pointer-events-none absolute right-1 top-1 z-10">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
                  </div>
                ) : null}

                {!leaderboard.isFetching && top.length === 0 ? (
                  <EmptyState
                    title="Лидерборд пуст"
                    description="За этот период очков пока нет."
                  />
                ) : null}

                {topTen.map((row) => {
                  const isCurrentUser = current?.userId === row.userId;
                  const displayName = isCurrentUser
                    ? profile.fullName
                    : row.fullName;
                  return (
                    <div
                      key={row.userId}
                      className={cn(
                        'flex items-center justify-between rounded-xl border px-3! py-2.5!',
                        rankRowClass(row.rank, isCurrentUser),
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={cn(
                            'inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-xs font-bold',
                            rankBadgeClass(row.rank, isCurrentUser),
                          )}
                        >
                          {rankBadge(row.rank)}
                        </span>
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                          <span className="text-base leading-none" aria-hidden>
                            {RANK_EMOJIS[row.rankInfo?.level ?? 1] ?? '🐣'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="truncate text-sm font-medium text-zinc-900">
                              {displayName}
                            </p>
                            {row.rank === 1 ? (
                              <Trophy
                                className="h-4 w-4 shrink-0 text-amber-600"
                                aria-hidden="true"
                              />
                            ) : null}
                            {row.rank === 2 ? (
                              <Award
                                className="h-4 w-4 shrink-0 text-slate-600"
                                aria-hidden="true"
                              />
                            ) : null}
                            {row.rank === 3 ? (
                              <Medal
                                className="h-4 w-4 shrink-0 text-orange-600"
                                aria-hidden="true"
                              />
                            ) : null}
                          </div>
                          {row.rankInfo ? (
                            <RankBadge
                              rankInfo={row.rankInfo}
                              className="mt-0.5"
                            />
                          ) : null}
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-zinc-900">
                        {row.points}
                      </p>
                    </div>
                  );
                })}

                {!inTopTen && current ? (
                  <>
                    <p className="px-2 text-sm text-zinc-400">...</p>
                    <div className="flex items-center justify-between rounded-xl border border-blue-300 bg-blue-50 px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={cn(
                            'inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-xs font-bold',
                            rankBadgeClass(current.rank, true),
                          )}
                        >
                          {rankBadge(current.rank)}
                        </span>
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                          <span className="text-base leading-none" aria-hidden>
                            {RANK_EMOJIS[current.rankInfo?.level ?? 1] ?? '🐣'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900">
                            {profile.fullName}
                          </p>
                          {current.rankInfo ? (
                            <RankBadge
                              rankInfo={current.rankInfo}
                              className="mt-0.5"
                            />
                          ) : null}
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-zinc-900">
                        {current.points}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            <section className="space-y-2">
              <button
                type="button"
                className={SECONDARY_TOGGLE_CLASS}
                onClick={() => setShowRules((v) => !v)}
                aria-expanded={showRules}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>Правила очков</span>
                  {showRules ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              </button>

              {showRules ? (
                <div className={SECTION_CARD}>
                  {rules.isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
                    </div>
                  ) : null}

                  {rules.isError ? (
                    <ErrorState
                      title="Не удалось загрузить правила"
                      onRetry={() => {
                        void rules.refetch();
                      }}
                    />
                  ) : null}

                  {!rules.isLoading &&
                  !rules.isError &&
                  (rules.data?.length ?? 0) === 0 ? (
                    <EmptyState title="Правила пока недоступны" />
                  ) : null}

                  {!rules.isLoading && !rules.isError ? (
                    <div className="space-y-2">
                      {(rules.data ?? []).map((row) => (
                        <div
                          key={row.rule}
                          className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2"
                        >
                          <span className="text-sm text-zinc-700">
                            {pointsRuleLabel(row.rule)}
                          </span>
                          <span className="text-sm font-semibold text-zinc-900">
                            +{row.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="space-y-2">
              <button
                type="button"
                className={SECONDARY_TOGGLE_CLASS}
                onClick={() => setShowHistory((v) => !v)}
                aria-expanded={showHistory}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>История очков</span>
                  {showHistory ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              </button>

              {showHistory ? (
                <div className={SECTION_CARD}>
                  {history.isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
                    </div>
                  ) : null}

                  {history.isError ? (
                    <ErrorState
                      title="Не удалось загрузить историю"
                      onRetry={() => {
                        void history.refetch();
                      }}
                    />
                  ) : null}

                  {!history.isLoading &&
                  !history.isError &&
                  (history.data?.length ?? 0) === 0 ? (
                    <EmptyState title="История очков пуста" />
                  ) : null}

                  {!history.isLoading && !history.isError ? (
                    <div className="space-y-2">
                      {(history.data ?? []).slice(0, 20).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2"
                        >
                          <div className="min-w-0 pr-3">
                            <p className="truncate text-sm text-zinc-800">
                              {pointsRuleLabel(item.ruleCode)}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {formatLocalDateTime(item.createdAt)}
                            </p>
                          </div>
                          <p
                            className={cn(
                              'shrink-0 text-sm font-semibold',
                              item.deltaPoints >= 0
                                ? 'text-emerald-700'
                                : 'text-red-600',
                            )}
                          >
                            {item.deltaPoints >= 0 ? '+' : ''}
                            {item.deltaPoints}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          </>
        )}

        <div className="h-2" aria-hidden />
      </div>
    </div>
  );
}
