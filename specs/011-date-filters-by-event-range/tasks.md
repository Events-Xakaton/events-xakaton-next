# Tasks: Date Filters by Event Time Range

**Input**: Design documents from `/specs/011-date-filters-by-event-range/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story mapping (`US1`, `US2`)

## Phase 1: Setup

- [x] T001 Обновить `EventCard` в `events-xakaton-next/src/entities/event/types.ts`, добавив `endsAtUtc`.
- [x] T002 [P] Расширить backend DTO `EventListItemResDto` полем `endsAtUtc`.
- [x] T003 [P] Пробросить `endsAtUtc` в mapping `list-events.handler.ts`.

## Phase 2: User Story 1 - Day filters by overlap (Priority: P1)

- [x] T004 [US1] Реализовать в `use-event-filter.ts` нормализацию диапазона и predicate пересечения.
- [x] T005 [US1] Применить пересечение ко всем day-фильтрам (`today/tomorrow/week/weekend/next-week`).
- [x] T006 [US1] Добавить legacy-safe fallback для отсутствующего/невалидного `endsAtUtc`.

## Phase 3: User Story 2 - Profile upcoming/past (Priority: P1)

- [x] T007 [US2] Перевести `eventCounts` в `profile-events-section.tsx` на классификацию по end-времени.
- [x] T008 [US2] Перевести `filteredEvents` для вкладок `upcoming/past` на классификацию по end-времени.
- [x] T009 [US2] Проверить, что ongoing не попадает в `Прошедшие`.

## Phase 4: Validation

- [x] T010 Обновить quickstart при необходимости по факту реализации.
- [x] T011 Запустить `npm run build` в `events-xakaton-next`.
- [ ] T012 Запустить `npm run build` в `events-xakaton-nestjs` (blocked: existing unrelated TS errors in `src/modules/upload/*`).
- [x] T013 Обновить статус/acceptance notes в `spec.md`.
