# Research: Required Field Markers on Create Screens

## Decision 1: Use explicit `*` marker near required field labels

- Decision: Помечать обязательность через `*` рядом с названием поля/секции.
- Rationale: Это ожидаемый и понятный пользователю паттерн, не требующий дополнительного обучения.
- Alternatives considered:
  - Показывать только общий текст без маркеров: хуже локализует, что именно обязательно.
  - Подсвечивать ошибки только после submit: не решает проблему "почему кнопка disabled до submit".

## Decision 2: Add a shared hint text in both forms

- Decision: Добавить краткую подсказку `* Обязательные поля` в обе формы.
- Rationale: Пользователь сразу понимает семантику символа `*`.
- Alternatives considered:
  - Без подсказки: риск неоднозначной интерпретации маркера.
  - Длинное пояснение: избыточно для компактного мобильного UI.

## Decision 3: Keep validation logic unchanged

- Decision: Не изменять `canPublish`, zod schema и submit-условия.
- Rationale: Запрос касается только прозрачности UX, а не изменения бизнес-правил.
- Alternatives considered:
  - Менять логику disabled/validation: увеличивает риск регрессий и не нужен для цели фичи.
