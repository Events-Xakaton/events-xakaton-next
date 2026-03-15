# Quickstart: Date Filters by Event Time Range

## Preconditions

1. Frontend and backend changes from feature `011-date-filters-by-event-range` are applied.
2. `/events` list payload contains `endsAtUtc`.

## Build checks

```bash
cd /Users/frolov.f/hack2026/events-xakaton-next
npm run build

cd /Users/frolov.f/hack2026/events-xakaton-nestjs
npm run build
```

## Smoke scenarios

### Scenario A: Today filter with multi-day event

1. Create/prepare event: `startsAtUtc = yesterday 20:00`, `endsAtUtc = tomorrow 10:00`.
2. Open Home and select `Сегодня`.
3. Verify event is visible.

### Scenario B: Tomorrow filter overlap

1. Create/prepare event: `startsAtUtc = today 22:00`, `endsAtUtc = tomorrow 03:00`.
2. Select `Завтра`.
3. Verify event is visible.

### Scenario C: Weekend / week / next-week overlap

1. Use event that starts before the filter window and ends inside it.
2. Verify it appears in the corresponding filter.
3. Use event fully outside window and verify it does not appear.

### Scenario D: Profile upcoming/past classification

1. Open profile events tabs.
2. Verify event with `end > now` is in `Предстоящие`.
3. Verify event with `end <= now` is in `Прошедшие`.
4. Verify ongoing event is not shown in `Прошедшие`.

### Scenario E: Legacy payload without endsAtUtc

1. Return event item without `endsAtUtc` from API.
2. Verify app does not crash and filters keep deterministic behavior.
