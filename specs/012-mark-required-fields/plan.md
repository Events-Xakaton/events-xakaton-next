# Implementation Plan: Required Field Markers on Create Screens

**Branch**: `012-mark-required-fields` | **Date**: 2026-03-15 | **Spec**: [/Users/frolov.f/hack2026/events-xakaton-next/specs/012-mark-required-fields/spec.md](/Users/frolov.f/hack2026/events-xakaton-next/specs/012-mark-required-fields/spec.md)
**Input**: Feature specification from `/specs/012-mark-required-fields/spec.md`

## Summary

Добавляем явную маркировку обязательных полей на вкладках создания мероприятия и клуба, чтобы пользователь понимал, почему кнопка создания может быть неактивной. Изменение чисто UI-уровня: бизнес-валидация и правила активации кнопки не меняются.

## Technical Context

**Language/Version**: TypeScript (Next.js 16, React 19)  
**Primary Dependencies**: React, react-hook-form, zod, existing shared UI components  
**Storage**: N/A  
**Testing**: `npm run build` + ручной smoke UI  
**Target Platform**: Telegram Mini App web frontend  
**Project Type**: Single frontend app (Next.js)  
**Performance Goals**: Без влияния на производительность (только статические UI-лейблы)  
**Constraints**:
- Не менять существующую логику `canPublish` и zod-валидации.
- Пометить только обязательные поля.
- Сохранить текущую визуальную структуру экрана.
**Scale/Scope**: `src/views/create/index.tsx`, `src/shared/components/description-section.tsx`

## Constitution Check

`/.specify/memory/constitution.md` в workspace содержит шаблон-заглушку без блокирующих требований. Для этой фичи дополнительных ограничений нет.

## Project Structure

### Documentation (this feature)

```text
specs/012-mark-required-fields/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
└── checklists/
    └── requirements.md
```

### Source Code (target files)

```text
src/shared/components/description-section.tsx
src/views/create/index.tsx
```

**Structure Decision**: Локальное UI-изменение только в компонентах формы создания; backend и API не затрагиваются.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
