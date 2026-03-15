# Tasks: Required Field Markers on Create Screens

**Input**: Design documents from `/specs/012-mark-required-fields/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story mapping (`US1`, `US2`)

## Phase 1: Setup

- [x] T001 Подготовить `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md` в `specs/012-mark-required-fields/`.
- [x] T002 Создать чеклист качества спецификации `specs/012-mark-required-fields/checklists/requirements.md`.

## Phase 2: User Story 1 - Event required markers (Priority: P1)

- [x] T003 [US1] Добавить поддержку required-маркера в заголовок `Описание` в `src/shared/components/description-section.tsx`.
- [x] T004 [US1] Добавить маркировку обязательности для `Название`, `Локация`, `Начало`, `Окончание` на вкладке создания мероприятия в `src/views/create/index.tsx`.
- [x] T005 [US1] Добавить явную подсказку `* Обязательные поля` на форме создания мероприятия в `src/views/create/index.tsx`.

## Phase 3: User Story 2 - Club required markers (Priority: P1)

- [x] T006 [US2] Добавить маркировку обязательности для `Название` и `Описание` на вкладке создания клуба в `src/views/create/index.tsx`.
- [x] T007 [US2] Добавить явную подсказку `* Обязательные поля` на форме создания клуба в `src/views/create/index.tsx`.

## Phase 4: Validation

- [x] T008 Проверить, что необязательные поля остались без required-маркеров в `src/views/create/index.tsx`.
- [x] T009 Запустить `npm run build` в `events-xakaton-next`.
- [x] T010 Обновить `spec.md` статусом реализации и acceptance notes.
