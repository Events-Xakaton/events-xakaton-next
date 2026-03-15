# Tasks: Event Location Link Rendering and Google Maps Handling

**Input**: Design documents from `/specs/009-event-location-maps-link/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Спецификация не требует обязательных автотестов; фокус на реализацию + manual smoke.

**Organization**: Tasks are grouped by user story to preserve independent delivery slices.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story mapping (`US1`, `US2`, `US3`)

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Создать helper парсинга локации в `src/shared/lib/location-link.ts` с типами `ParsedLocationLink`, `LocationLinkKind`.
- [ ] T002 [P] Добавить unit-like guard функции в `src/shared/lib/location-link.ts`: `normalizeLocationUrl`, `detectGoogleMapsUrl`, `isSafeHttpUrl`.
- [ ] T003 [P] Подготовить helper открытия внешних ссылок (SDK + fallback) в `src/shared/lib/location-link.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Расширить `DetailRow` API для кастомного рендера value и multiline режима в `src/shared/components/detail-shared.tsx`.
- [ ] T005 Обновить стили `DetailRow` для корректного переноса длинного текста (`min-w-0`, wrap anywhere, line clamp modifier) в `src/shared/components/styles/detail-shared.css`.
- [ ] T006 Проверить отсутствие визуальной регрессии остальных `DetailRow` usages в `EventDetails` и других экранах.

**Checkpoint**: foundation готова для user-story implementation.

---

## Phase 3: User Story 1 - Корректный рендер длинной ссылки (Priority: P1) 🎯 MVP

**Goal**: Исправить визуальное поведение длинной локации.

**Independent Test**: длинный URL больше 120 символов в `locationOrLink` не ломает карточку.

- [ ] T007 [US1] Подключить parser в `src/views/event-details/index.tsx` для поля `event.locationOrLink`.
- [ ] T008 [US1] Рендерить location value через multiline link-safe node в `src/views/event-details/index.tsx`.
- [ ] T009 [US1] Зафиксировать 2-line clamp для location value через class modifier в `src/shared/components/styles/detail-shared.css`.

**Checkpoint**: US1 завершена и тестируется изолированно.

---

## Phase 4: User Story 2 - Тап и Google Maps open flow (Priority: P1)

**Goal**: Сделать location URL интерактивной и различать Google Maps links.

**Independent Test**: Google URL открывается по Google-priority path, обычный URL — по default path.

- [ ] T010 [US2] Добавить action `openLocationLink(parsed)` в `src/shared/lib/location-link.ts`.
- [ ] T011 [US2] Реализовать обработчик `onLocationTap` в `src/views/event-details/index.tsx`.
- [ ] T012 [US2] Сделать location row clickable только при `parsed.isClickable === true` в `src/views/event-details/index.tsx`.
- [ ] T013 [US2] Добавить визуальный affordance кликабельности (цвет/underline/cursor-like feedback) для URL value в `src/shared/components/styles/detail-shared.css`.

**Checkpoint**: US1 + US2 функциональны независимо.

---

## Phase 5: User Story 3 - Устойчивость и edge-cases (Priority: P2)

**Goal**: Не ломаться на невалидных и небезопасных вводах.

**Independent Test**: `javascript:`/invalid URL/plain-text не приводят к падению, а поведение предсказуемо.

- [ ] T014 [US3] Добавить обработку unsafe/invalid схем в parser `src/shared/lib/location-link.ts`.
- [ ] T015 [US3] Добавить безопасный fallback открытия при ошибке SDK в `src/shared/lib/location-link.ts`.
- [ ] T016 [US3] Добавить lightweight telemetry hook для tap outcome (`google_maps_url` / `url` / `plain_text`) в `src/views/event-details/index.tsx` и `src/shared/observability/telemetry.ts`.
- [ ] T017 [US3] Проверить сценарии из `quickstart.md` и обновить заметки smoke в `specs/009-event-location-maps-link/quickstart.md`.

**Checkpoint**: все user stories покрыты.

---

## Phase 6: Polish & Validation

- [ ] T018 Запустить `npm run build` в `/Users/frolov.f/hack2026/events-xakaton-next`.
- [ ] T019 Выполнить ручной smoke по `specs/009-event-location-maps-link/quickstart.md`.
- [ ] T020 Уточнить финальные acceptance notes в `specs/009-event-location-maps-link/spec.md` (status update + decision notes).

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup -> Foundational -> User Stories -> Polish.

### User Story Dependencies

- US1 зависит от foundational styling/API.
- US2 зависит от parser/open helper (setup) и wiring US1.
- US3 зависит от US2 open flow.

### Parallel Opportunities

- T002 и T003 можно делать параллельно.
- T004 и T005 можно делать параллельно после согласования API `DetailRow`.
- T014 и T016 можно делать параллельно.

## Notes

- Не требуется backend migration или API контрактные изменения.
- Главный риск — различия поведения iOS/Android Telegram WebView при внешнем открытии ссылок; это покрывается fallback и manual smoke.
