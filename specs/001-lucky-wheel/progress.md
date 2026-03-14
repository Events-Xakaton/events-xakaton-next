# Progress: Lucky Wheel

Сверка с `/specs/001-lucky-wheel/spec.md` и `tasks.md`.

---

## Бэкенд — Этап 1: Schema + миграция ✅

**Задачи по спеке:** T004, T005

- Добавлена модель `LuckyWheelUsage` в `schema.prisma`
- `@@unique([userId, dayKey])` — один запуск в день на пользователя
- Создана миграция `20260314160000_add_lucky_wheel_and_connection_index`

---

## Бэкенд — Этап 2: GetRandomEventHandler ⏳

**Задачи по спеке:** T006, T007, T008, T023

Не начат. Нужно:
- [ ] Фильтр мест: исключать события где `_count.participations >= maxParticipants`
- [ ] Выбор K=5: сортировка по `startsAtUtc` → срез 5 → random
- [ ] Дневной лимит: проверка + запись `LuckyWheelUsage`
- [ ] Коды ошибок: `NO_ELIGIBLE_EVENTS`, `DAILY_LIMIT_REACHED`

---

## Бэкенд — Этап 3: Swagger ⏳

**Задачи по спеке:** T003

Не начат.

---

## Фронт — Phase 1: Setup ✅

**Задачи по спеке:** T001, T002

### T001 ✅ — Константы
- `LUCKY_MIN_VIEWED_EVENTS = 9`, `LUCKY_TRIGGER_WINDOW_MS = 3000`, `LUCKY_K_NEAREST = 5`
- Файл: `src/views/home/model/use-lucky-trigger.ts`

### T002 ✅ — Типы ошибок
- `enum LuckyWheelErrorCode { NO_ELIGIBLE_EVENTS, DAILY_LIMIT_REACHED }`
- `type LuckyWheelErrorResponse`
- Файл: `src/entities/event/api.ts`

---

## Фронт — Phase 3: User Story 1 — Секретный триггер ✅

**Задачи по спеке:** T009, T010, T011, T012, T013

### T009 ✅ — Хук `useLuckyTrigger`
- `IntersectionObserver` (threshold 0.5) на карточках с `data-event-id`
- `MutationObserver` следит за новыми карточками
- Временное окно + уникальные ID → `isTriggered`
- Возвращает: `isTriggered`, `setScrollContainer`, `scrollContainerRef`, `reset`

### T010 ✅ — Подключение к ленте
- `feedScrollRef` заменён на `scrollContainerRef` из хука
- Все ref на scroll-контейнер изменены на `setScrollContainer`
- Сброс при уходе со вкладки Events

### T011 ✅ — `data-event-id` в карточке
- `data-event-id={event.id}` на `<article>` в `event-feed-card.tsx`

### T012 ✅ — Кнопка «Мне повезёт»
- Появляется поверх ленты при `isTriggered && homeTab === 'events'`
- Фиолетовый стиль, иконка Sparkles
- При клике: `resetLucky()` + `onOpenLuckyWheel()`

### T013 ✅ — Телеметрия `lucky.reveal`
- `trackLuckyReveal()` в `shared/observability/telemetry.ts`
- Вызывается при `isTriggered === true`

---

## Фронт — Phase 4: User Story 2 — Колесо ✅

**Задачи по спеке:** T014, T015, T016, T017, T018, T019

### T014 ✅ — `LuckyWheelScreen`
- SVG-колесо 8 секторов с emoji и указателем сверху
- Тёмный фон, центральный gem с glow
- Файл: `src/views/lucky-wheel/index.tsx`
- CSS: `src/views/lucky-wheel/styles/lucky-wheel.css`

### T015 ✅ — Интеграция в shell
- `luckyWheelOpen: boolean` в `views/shell/index.tsx`
- BottomNav скрыт при `luckyWheelOpen`

### T016 ✅ — Lazy-вызов + lock
- `useLazyRandomEventQuery` — только по нажатию
- `disabled={isSpinning}` блокирует повторный запуск
- Enum `SpinPhase` управляет состоянием

### T017 ✅ — Анимация
- Fast-spin через rAF (6 deg/frame)
- Минимум 1.8s до торможения
- Торможение: CSS transition `2.2s cubic-bezier` до целевого сектора
- Сектор вычислен детерминировано из `eventId`

### T018 ✅ — Переход в детали
- `ResultCard`: показывает название и дату события
- Кнопка «Открыть ивент» → `onOpenEvent(eventId)`

### T019 ✅ — Телеметрия
- `trackLuckySpin('start')`, `('result', { eventId })`, `('open_event', { eventId })`

---

## Фронт — Phase 5: User Story 3 — Устойчивость ✅

**Задачи по спеке:** T020, T021, T022, T024

### T020 ✅ — `NO_ELIGIBLE_EVENTS`
- `SpinPhase.NO_EVENTS` → fallback 🌵 + CTA «Вернуться в ленту»

### T021 ✅ — `DAILY_LIMIT_REACHED`
- `SpinPhase.DAILY_LIMIT` → fallback ⏳ + объяснение 00:00 UTC

### T022 ✅ — Защита от double-tap + cleanup
- `disabled={isSpinning}` на кнопке «Запустить»
- `cancelAnimationFrame` при unmount

### T024 ✅ — Ошибка открытия деталей
- `SpinPhase.ERROR` → текст ошибки + кнопка «Запустить» снова доступна

---

## Фронт — Phase 6: Polish ⏳

### T026 ✅ — Lint
- `0 errors`, 17 pre-existing warnings
- TypeScript: 0 errors

### T025, T028 ⏳ — Документация и smoke-тест после деплоя

---

## Итоговая таблица

| Задача | Статус | Файл |
|--------|--------|------|
| T001 | ✅ | `views/home/model/use-lucky-trigger.ts` |
| T002 | ✅ | `entities/event/api.ts` |
| T003 | ⏳ | backend |
| T004–T008 | ⏳ | backend |
| T009 | ✅ | `views/home/model/use-lucky-trigger.ts` |
| T010 | ✅ | `views/home/index.tsx` |
| T011 | ✅ | `entities/event/ui/event-feed-card.tsx` |
| T012 | ✅ | `views/home/index.tsx` |
| T013 | ✅ | `shared/observability/telemetry.ts` |
| T014 | ✅ | `views/lucky-wheel/index.tsx` |
| T015 | ✅ | `views/shell/index.tsx` |
| T016 | ✅ | `views/lucky-wheel/index.tsx` |
| T017 | ✅ | `views/lucky-wheel/index.tsx` |
| T018 | ✅ | `views/lucky-wheel/index.tsx` + `shell/index.tsx` |
| T019 | ✅ | `views/lucky-wheel/index.tsx` |
| T020 | ✅ | `views/lucky-wheel/index.tsx` |
| T021 | ✅ | `views/lucky-wheel/index.tsx` |
| T022 | ✅ | `views/lucky-wheel/index.tsx` |
| T023 | ⏳ | backend |
| T024 | ✅ | `views/lucky-wheel/index.tsx` |
| T025 | ⏳ | docs |
| T026 | ✅ | — |
| T027 | ⏳ | backend lint |
| T028 | ⏳ | manual smoke |
