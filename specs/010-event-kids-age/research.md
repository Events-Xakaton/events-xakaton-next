# Research: Kids Audience Marker for Events

## Decision 1: Use combined model (`isForKids` + optional `kidsMinAge`)

- **Decision**: В UI и API используем 2 поля: boolean-флаг + nullable возраст.
- **Rationale**: Покрывает оба сценария: "детский ивент без точного порога" и "детский ивент с возрастом N+".
- **Alternatives considered**:
  - Только флаг: теряется важная детализация возраста.
  - Только возраст: сложно выразить "детский, возраст не уточнен".

## Decision 2: Adult-by-default for new and legacy events

- **Decision**: По умолчанию `isForKids=false`, `kidsMinAge=null`; legacy-записи интерпретируются так же.
- **Rationale**: Соответствует продуктовой гипотезе "90% ивентов для взрослых" и снижает шум в UI.
- **Alternatives considered**:
  - Unknown/tri-state: повышает сложность логики и рендера без явной пользы.

## Decision 3: Show age selector only when `isForKids=true`

- **Decision**: Поле `N+` скрыто при `isForKids=false`; при выключении флага возраст очищается.
- **Rationale**: Избегаем неконсистентных комбинаций и визуального перегруза формы.
- **Alternatives considered**:
  - Всегда показывать возраст: больше ошибок ввода и непонятный UX для взрослых ивентов.

## Decision 4: Unified badge text across all cards and detail screen

- **Decision**: Единый формат рендера: `Для детей` или `Для детей {N}+`.
- **Rationale**: Снижает когнитивную нагрузку и исключает разные формулировки в разных лентах.
- **Alternatives considered**:
  - Разные подписи по экрану: повышает риск несогласованности UX.

## Decision 5: Defensive UI for inconsistent payloads

- **Decision**: Если приходит `isForKids=false` и `kidsMinAge!=null`, UI рендерит ивент как взрослый.
- **Rationale**: Визуальное поведение остается предсказуемым даже при редких неконсистентных данных.
- **Alternatives considered**:
  - Авто-повышать до детского на фронте: скрывает проблемы данных и усложняет отладку.
