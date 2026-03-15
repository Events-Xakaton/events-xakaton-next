# Research: Date Filters by Event Time Range

## Decision 1: Filter by interval intersection, not by start-only

- **Decision**: Попадание ивента определяется условием `eventEnd > filterStart && eventStart < filterEnd`.
- **Rationale**: Это стандартная проверка пересечения двух полуинтервалов и корректно обрабатывает многодневные события.
- **Alternatives considered**:
  - Только `startsAtUtc` в окне: теряются события, начавшиеся раньше.
  - Только `status` (`ongoing/upcoming`): не позволяет корректно фильтровать окна типа `Завтра`.

## Decision 2: Keep filter window boundaries unchanged

- **Decision**: Окна (`Сегодня`, `Завтра`, `Неделя`, `Выходные`, `След. нед.`) вычисляются как раньше.
- **Rationale**: Изменяем только критерий попадания, не меняя ожидаемую пользователем семантику кнопок.
- **Alternatives considered**:
  - Пересчитать бизнес-логику окон (например, календарная неделя): это отдельная продуктовая задача.

## Decision 3: Add `endsAtUtc` to `/events` list payload

- **Decision**: Расширить `EventListItemResDto` и mapping в list handler.
- **Rationale**: Без end-времени нельзя определить пересечение с окном при старте до окна.
- **Alternatives considered**:
  - Оценивать на фронте только по `status`: недостаточно для day-фильтров.

## Decision 4: Profile `upcoming/past` based on event end

- **Decision**: `upcoming` если `end > now`, `past` если `end <= now` (с fallback для legacy).
- **Rationale**: ongoing-событие не должно считаться прошедшим.
- **Alternatives considered**:
  - Основание на `startsAtUtc`: ongoing ошибочно попадает в past.
