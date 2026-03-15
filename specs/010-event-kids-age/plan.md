# Implementation Plan: Kids Audience Marker for Events

**Branch**: `010-event-kids-age` | **Date**: 2026-03-15 | **Spec**: [/Users/frolov.f/hack2026/events-xakaton-next/specs/010-event-kids-age/spec.md](/Users/frolov.f/hack2026/events-xakaton-next/specs/010-event-kids-age/spec.md)
**Input**: Feature specification from `/specs/010-event-kids-age/spec.md`

**Note**: План адаптирован под frontend-репозиторий и предполагает синхронные контрактные изменения на backend.

## Summary

Добавляем в UI поддержку детской аудитории ивента: флаг `Для детей` и опциональный возраст `N+`. Поля должны работать в create-flow, edit-flow и detail-view, а также отображаться на карточках событий (`Для детей` / `Для детей 6+`). По умолчанию ивенты считаются взрослыми.

## Technical Context

**Language/Version**: TypeScript (Next.js 16, React 19)  
**Primary Dependencies**: RTK Query, `react-hook-form`, `zod`, Tailwind CSS  
**Storage**: N/A (frontend-only state + API payloads)  
**Testing**: `npm run build`, ручной smoke из `quickstart.md`  
**Target Platform**: Telegram Mini App (mobile-focused webview)  
**Project Type**: Frontend web app  
**Performance Goals**: Без заметной деградации рендера карточек и формы; дополнительные вычисления O(1) на карточку  
**Constraints**:
- Дефолтное состояние всех ивентов в UI: взрослые (`isForKids=false`).
- Возраст `N+` показывается и редактируется только при включенном флаге `Для детей`.
- Бейдж на карточке должен быть единообразным на всех лентах.
- Нужна backward compatibility с legacy-ответами API.
**Scale/Scope**: `CreateScreen`, `EventDetails`, `EventEditSheet`, event-card компоненты, типы/RTK payloads

## Constitution Check

_Gate: must pass before detailed design and before implementation start._

`/.specify/memory/constitution.md` в проекте не содержит блокирующих правил для этой фичи. Риски фичи (консистентность форматов и backward compatibility) покрываются отдельными требованиями и smoke-сценариями.

Post-design re-check: нарушений не обнаружено.

## Project Structure

### Documentation (this feature)

```text
specs/010-event-kids-age/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── entities/event/
│   ├── api.ts
│   ├── types.ts
│   └── lib/
│       └── audience-label.ts         # new: единый текст бейджа
├── views/create/
│   ├── index.tsx
│   ├── lib/event-schema.ts
│   └── model/use-event-form.ts
├── views/event-details/
│   ├── index.tsx
│   ├── types.ts
│   ├── model/
│   │   ├── use-event-draft.ts
│   │   └── use-event-actions.ts
│   └── ui/event-edit-sheet.tsx
├── entities/event/ui/
│   └── event-feed-card.tsx
├── views/account/ui/
│   └── profile-event-card.tsx
└── views/club-details/ui/
    └── club-profile-event-card.tsx
```

**Structure Decision**: Выносим формирование лейбла в `entities/event/lib/audience-label.ts`, чтобы одинаково рендерить `Для детей` / `Для детей {N}+` в карточках и деталях без дублирования условий.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Новый shared helper для лейбла аудитории | Нужен единый формат текста во всех местах | Inline-условия в каждом компоненте приведут к расхождению текста |
