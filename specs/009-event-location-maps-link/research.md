# Research: Event Location Link Rendering and Google Maps Handling

## Decision 1: Parse location string as typed value (`plain_text` / `url` / `google_maps_url`)

- **Decision**: Ввести централизованный parser, который:
  - trim-ит вход,
  - нормализует домены без схемы к `https://...`,
  - валидирует через `URL` только `http/https`,
  - классифицирует ссылку как `google_maps_url` по hostname/path.
- **Rationale**: Снижает количество UI edge-cases и исключает дублирование regex в компонентах.
- **Alternatives considered**:
  - Парсить только в компоненте `EventDetails` (хуже поддерживаемость).
  - Всегда считать строку ссылкой (ломает plain-text адреса, повышает риск unsafe URL).

## Decision 2: Google Maps detection by host/path heuristics

- **Decision**:
  - `maps.app.goo.gl` -> `google_maps_url`
  - `maps.google.*` -> `google_maps_url`
  - `google.*` + `pathname` starts with `/maps` -> `google_maps_url`
- **Rationale**: Покрывает реальные форматы share-ссылок Google Maps без external resolution.
- **Alternatives considered**:
  - Разрешать только один host (`maps.app.goo.gl`) — недостаточное покрытие.
  - Делать network-expand short URL — лишняя латентность и усложнение.

## Decision 3: Open strategy for links in Telegram Mini App

- **Decision**:
  1. Для `google_maps_url`: `openLink(url, { tryBrowser: 'chrome' })` при доступности SDK.
  2. Для остальных URL: `openLink(url)` при доступности SDK.
  3. Fallback: `window.open(url, '_blank', 'noopener,noreferrer')`, если SDK недоступен/ошибка.
- **Rationale**:
  - В Telegram Mini App `openLink` — стандартный способ безопасного внешнего открытия.
  - Для Google Maps `tryBrowser: 'chrome'` повышает шанс корректного app/universal-link маршрута.
- **Alternatives considered**:
  - Кастомные схемы (`comgooglemaps://`, `geo:`) как primary — нестабильны в Telegram webview и ОС-специфичны.

## Decision 4: Layout strategy for long location URLs

- **Decision**:
  - Для location value включить `overflow-wrap:anywhere` + `min-w-0` в value container.
  - Ограничить видимый текст 2 строками (`line-clamp-2`) с ellipsis.
  - Сделать значение интерактивным только для распознанных URL.
- **Rationale**: Устраняет выезд за границы карточки и сохраняет компактный вертикальный ритм блока `Детали`.
- **Alternatives considered**:
  - Показывать URL целиком без clamp (может «растягивать» карточку на 5-8 строк).
  - Уводить URL в отдельную кнопку "Открыть" (хуже discoverability).

## Decision 5: Security boundary for clickable links

- **Decision**: Кликабельными считаются только `http/https` URL; остальные схемы рендерятся как текст.
- **Rationale**: Предотвращает открытие небезопасных/неподдерживаемых схем.
- **Alternatives considered**:
  - Разрешать любые схемы — риск неожиданного поведения и security issues.
