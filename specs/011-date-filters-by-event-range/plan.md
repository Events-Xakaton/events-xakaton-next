# Implementation Plan: Date Filters by Event Time Range

**Branch**: `011-date-filters-by-event-range` | **Date**: 2026-03-15 | **Spec**: [/Users/frolov.f/hack2026/events-xakaton-next/specs/011-date-filters-by-event-range/spec.md](/Users/frolov.f/hack2026/events-xakaton-next/specs/011-date-filters-by-event-range/spec.md)
**Input**: Feature specification from `/specs/011-date-filters-by-event-range/spec.md`

## Summary

Переводим day-фильтрацию ленты с проверки только `startsAtUtc` на пересечение диапазонов `start/end`, чтобы многодневные ивенты отображались корректно. Одновременно приводим вкладки профиля `Предстоящие/Прошедшие` к классификации по `endsAtUtc`, чтобы ongoing-события не попадали в `Прошедшие`.

## Technical Context

**Language/Version**: TypeScript (Next.js 16, React 19), TypeScript (NestJS 11)  
**Primary Dependencies**: RTK Query, Next.js app router, NestJS CQRS, Prisma  
**Storage**: N/A (API contract + client filtering logic)  
**Testing**: `npm run build` (frontend), `npm run build` (backend), ручной smoke  
**Target Platform**: Telegram Mini App + NestJS API  
**Project Type**: Fullstack monorepo (frontend + backend dirs)  
**Performance Goals**: O(1) вычисления на ивент, без заметной деградации списка  
**Constraints**:
- Нельзя ломать legacy-пейлоады без `endsAtUtc`.
- Семантика окон фильтров остается прежней, меняется только правило попадания.
- `/events` response должен включать `endsAtUtc` для точной клиентской классификации.
**Scale/Scope**: `use-event-filter`, `EventCard` type, `profile-events-section`, NestJS `EventListItemResDto` + `list-events.handler`

## Constitution Check

`/.specify/memory/constitution.md` (в корне workspace) не содержит блокирующих ограничений для данного изменения. Изменение локально и обратносуместимо для legacy payload.

## Project Structure

### Documentation (this feature)

```text
specs/011-date-filters-by-event-range/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (target files)

```text
events-xakaton-next/src/
├── entities/event/types.ts
├── views/home/model/use-event-filter.ts
└── views/account/profile-events-section.tsx

events-xakaton-nestjs/src/
├── modules/events/dto/response/event-list-item.res.dto.ts
└── modules/events/handlers/list-events.handler.ts
```

**Structure Decision**: минимально расширяем API list DTO одним полем `endsAtUtc`; остальную логику реализуем на фронте через нормализацию интервалов и predicate пересечения.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Изменение backend DTO | Без `endsAtUtc` невозможно точно фильтровать многодневные диапазоны | Использование только `status` не покрывает попадание в конкретные окна (`Завтра`, `Выходные`) |
