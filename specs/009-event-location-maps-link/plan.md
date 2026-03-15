# Implementation Plan: Event Location Link Rendering and Google Maps Handling

**Branch**: `009-event-location-maps-link` | **Date**: 2026-03-15 | **Spec**: [/Users/frolov.f/hack2026/events-xakaton-next/specs/009-event-location-maps-link/spec.md](/Users/frolov.f/hack2026/events-xakaton-next/specs/009-event-location-maps-link/spec.md)
**Input**: Feature specification from `/specs/009-event-location-maps-link/spec.md`

**Note**: This plan follows the `spec-kit` template structure and is adapted for a frontend-only feature.

## Summary

Нужно исправить UX дефект в `EventDetails`: длинные ссылки в поле "Локация" сейчас ломают визуальное выравнивание строки. Дополнительно требуется сделать поле интерактивным при URL-значении и отдельно распознавать Google Maps ссылки для Google-priority открытия (app/universal link path + fallback на HTTPS URL).

## Technical Context

**Language/Version**: TypeScript (Next.js 16, React 19)  
**Primary Dependencies**: `@telegram-apps/sdk`, RTK Query, Tailwind CSS  
**Storage**: N/A (изменения только в UI-парсинге строки)  
**Testing**: `npm run build`, ручной smoke из `quickstart.md`  
**Target Platform**: Telegram Mini App (iOS/Android clients)  
**Project Type**: Frontend web app  
**Performance Goals**: Парсинг ссылки <1ms на рендер, без дополнительного network round-trip  
**Constraints**:
- Без изменения backend API.
- Только `http/https` как безопасные кликабельные схемы.
- UI не должен регрессировать для других detail-строк.
- Должен работать fallback при недоступном Telegram SDK open API.
**Scale/Scope**: 1 экран (`EventDetails`) + shared UI/helper utils

## Constitution Check

_Gate: must pass before detailed design and before implementation start._

`/.specify/memory/constitution.md` в проекте не задает дополнительных обязательных gate-правил, блокирующих реализацию. Риск-факторы этой фичи (безопасность URL, mobile deep-link behavior) покрываются отдельными требованиями и edge-case smoke сценариями.

Post-design re-check: дополнительных нарушений не обнаружено.

## Project Structure

### Documentation (this feature)

```text
specs/009-event-location-maps-link/
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
├── shared/
│   ├── components/
│   │   ├── detail-shared.tsx
│   │   └── styles/detail-shared.css
│   └── lib/
│       └── location-link.ts        # new: parse + detection + open strategy
└── views/
    └── event-details/
        └── index.tsx               # wiring for Location detail row
```

**Structure Decision**: Логику парсинга/детекта/open-flow выносим в `shared/lib/location-link.ts`, чтобы не дублировать правила в UI. `DetailRow` получает аккуратное расширение для multiline link value без изменения поведения остальных строк.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Дополнительный helper `location-link.ts` | Нужна единая и тестируемая логика распознавания + открытия | Inline-логика в `EventDetails` быстро разрастается и усложняет поддержку |
