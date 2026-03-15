# Tasks: Kids Audience Marker for Events

**Input**: Design documents from `/specs/010-event-kids-age/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Автотесты в спецификации не обязательны; фокус на реализации + ручной smoke.

**Organization**: Tasks are grouped by user story to keep delivery slices independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story mapping (`US1`, `US2`, `US3`)

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Создать helper лейбла аудитории в `src/entities/event/lib/audience-label.ts`.
- [ ] T002 [P] Обновить экспорт `entities/event` для нового helper в `src/entities/event/index.ts` (если требуется в импортах).
- [ ] T003 [P] Расширить фронтовые типы API payload в `src/entities/event/types.ts` полями `isForKids`, `kidsMinAge`.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Обновить RTK create/update mutation payloads в `src/entities/event/api.ts` под `isForKids`, `kidsMinAge`.
- [ ] T005 Расширить create-form schema/values в `src/views/create/lib/event-schema.ts`.
- [ ] T006 Добавить состояние аудитории и отправку полей в create-flow в `src/views/create/model/use-event-form.ts`.
- [ ] T007 Расширить типы черновика редактирования в `src/views/event-details/types.ts`.
- [ ] T008 Обновить инициализацию/дифф черновика в `src/views/event-details/model/use-event-draft.ts`.
- [ ] T009 Обновить payload сохранения edit-flow в `src/views/event-details/model/use-event-actions.ts`.

**Checkpoint**: foundation готова для всех user stories.

---

## Phase 3: User Story 1 - Create-flow kids fields (Priority: P1) 🎯 MVP

**Goal**: Организатор может задать `Для детей` и опциональный `N+` при создании.

**Independent Test**: создать взрослый и детский `6+` ивенты и проверить сохранение.

- [ ] T010 [US1] Добавить UI-поле `Для детей` и возраст `N+` в `src/views/create/index.tsx`.
- [ ] T011 [US1] Реализовать очистку `kidsMinAge` при выключении флага в `src/views/create/model/use-event-form.ts`.
- [ ] T012 [US1] Проверить корректный reset формы после успешного create в `src/views/create/model/use-event-form.ts`.

**Checkpoint**: US1 завершена и тестируется изолированно.

---

## Phase 4: User Story 2 - Edit + detail view audience info (Priority: P1)

**Goal**: Редактирование и просмотр детских параметров в деталях ивента.

**Independent Test**: `взрослый -> детский 6+ -> детский без возраста -> взрослый`.

- [ ] T013 [US2] Добавить UI-поля аудитории в `src/views/event-details/ui/event-edit-sheet.tsx`.
- [ ] T014 [US2] Добавить рендер аудитории в блок `Детали` на `src/views/event-details/index.tsx`.
- [ ] T015 [US2] Переиспользовать единый helper лейбла в `src/views/event-details/index.tsx` и `src/views/event-details/ui/event-edit-sheet.tsx`.
- [ ] T016 [US2] Защитить отображение от неконсистентных данных (`isForKids=false` + age) в `src/entities/event/lib/audience-label.ts`.

**Checkpoint**: US1 + US2 функциональны независимо.

---

## Phase 5: User Story 3 - Cards badge rendering (Priority: P1)

**Goal**: Показать `Для детей`/`Для детей N+` на карточках событий под чипом времени.

**Independent Test**: проверить ленту, профиль и клубные карточки на 3 типах ивента.

- [ ] T017 [US3] Добавить kids badge под чипом времени в `src/entities/event/ui/event-feed-card.tsx`.
- [ ] T018 [US3] Добавить kids badge под чипом времени в `src/views/account/ui/profile-event-card.tsx`.
- [ ] T019 [US3] Добавить kids badge под чипом времени в `src/views/club-details/ui/club-profile-event-card.tsx`.
- [ ] T020 [US3] Убедиться, что стиль бейджа не ломает верстку карточек, при необходимости правка в `src/entities/event/ui/styles/event-feed-card.css`.

**Checkpoint**: все user stories покрыты.

---

## Phase 6: Polish & Validation

- [ ] T021 Обновить smoke-заметки в `specs/010-event-kids-age/quickstart.md` по факту реализации.
- [ ] T022 Запустить `npm run build` в `/Users/frolov.f/hack2026/events-xakaton-next`.
- [ ] T023 Провести ручной smoke по `specs/010-event-kids-age/quickstart.md`.
- [ ] T024 Уточнить acceptance notes в `specs/010-event-kids-age/spec.md` (status + decisions).

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup -> Foundational -> User Stories -> Polish.

### User Story Dependencies

- US1 зависит от Foundation (`api/types/form state`).
- US2 зависит от Foundation и частично от US1 state-model.
- US3 зависит от Foundation (типов payload и helper лейбла), но не блокируется UI edit-flow.

### Parallel Opportunities

- T002 и T003 выполняются параллельно.
- T007 и T005 можно делать параллельно.
- T017, T018, T019 можно делать параллельно.

## Notes

- Фича не вводит фильтрацию по детям, только метаданные и отображение.
- Ключевой риск: рассинхрон форматов лейбла между карточками и деталями; покрывается единым helper.
