# Data Model: Required Field Markers on Create Screens

## Entity: Required Field Descriptor

- Purpose: Описывает, какие поля формы должны считаться обязательными и быть визуально помечены.
- Fields:
  - `formType`: `event | club`
  - `fieldKey`: строковый идентификатор поля (например, `title`, `description`, `location`, `startsAt`, `endsAt`)
  - `isRequired`: boolean
- Validation Rules:
  - `isRequired = true` только для полей, влияющих на текущую валидацию формы.
  - Необязательные поля всегда рендерятся без маркера.

## Entity: Required Marker Hint

- Purpose: Единая текстовая подсказка в рамках формы.
- Fields:
  - `text`: строка (например, `* Обязательные поля`)
  - `visible`: boolean
- Validation Rules:
  - Подсказка отображается на форме `event` и `club`.
