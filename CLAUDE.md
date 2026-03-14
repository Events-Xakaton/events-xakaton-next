# CLAUDE.md — events-xakaton-next

Telegram Mini App для корпоративных клубов и мероприятий.
Хакатон-проект: код должен быть чистым, читаемым, следовать лучшим практикам.

> Этот файл дополняет глобальный `~/.claude/CLAUDE.md`. Правила глобального файла в силе.
> По стилю кода ориентируйся на `STYLE_GUIDE.md` в корне проекта.

---

## 1. Команды

```bash
npm run dev        # dev-сервер
npm run build      # продакшн-сборка
npm run lint       # ESLint
npm run format     # Prettier (write)
```

Перед коммитом: `lint` и `format` должны проходить без ошибок.

---

## 2. Структура проекта (FSD)

```
src/
├── app/            # Next.js App Router: layout, page, providers
├── views/          # Экраны приложения (home, create, notifications, points, account, event-details, club-details, shell)
├── widgets/        # Составные UI-блоки (app-header, bottom-nav, comments-block, details-layout, people-list)
├── features/       # Фичи с бизнес-логикой (auth)
├── entities/       # Доменные сущности (event, club, user)
└── shared/
    ├── api/        # RTK Query: base-api + domain APIs (comments, connections, gamification, notifications)
    ├── components/ # Design system: Button, Card, Badge, Avatar, Input, Tabs, PillTabs, и др.
    ├── lib/        # Утилиты: utils, gradient, telegram, time, auth-session, ui-styles
    ├── observability/ # Телеметрия: telemetry.ts, web-vitals
    ├── redux/      # Enum'ы для RTK Query и Redux (ApiTag, StateNameType)
    ├── store/      # Redux store, hooks, slices (ui-slice)
    └── types/      # Общие типы (navigation.ts)
```

**Правило импортов**: `shared` → `entities` → `features` → `widgets` → `views` → `app`.
Импорт из вышестоящего слоя — запрещён.

---

## 3. TypeScript

- `"strict": true` — обязательно.
- `type Props` для props компонентов, `type` для доменных моделей и union'ов, `interface` — не используется.
- `enum` для именованных наборов значений (варианты, статусы, теги кэша, имена состояния).
- Явные типы возвращаемых значений экспортируемых функций.
- Запрещено: `any`, `@ts-ignore`, non-null assertion (`!`), `var`.

```typescript
// Правильно
export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

type Props = {
  variant?: ButtonVariant;
  onClick: () => void;
};

export const MyComponent: FC<Props> = ({ variant, onClick }) => { ... };
```

---

## 4. Компоненты React

- Только `FC<Props>`, без `React.FC`, без `forwardRef`.
- `'use client'` — первой строкой, только когда необходимо (хуки, обработчики событий).
- Props-тип называется `Props` (локальный, не экспортируется), экспортируются только enum'ы.

```typescript
'use client';

import { FC } from 'react';

type Props = {
  title: string;
};

export const MyWidget: FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};
```

---

## 5. Стилизация (BEM + Tailwind v4)

- CSS-файл для каждого компонента рядом с ним (`./styles/button.css`).
- Структура файла: `@import '../lib/styles/theme.css';` → BEM-блок с `@apply`.
- BEM-нейминг: `.block`, `.block--modifier`, `.block__element`.
- `@apply` в CSS, не inline-стили для Tailwind-классов.
- В компоненте: `cn('block', `block--${variant}`, className)`.
- Порядок Tailwind-классов — сортируется автоматически через Prettier, не трогать вручную.

```css
@import '../lib/styles/theme.css';

.button {
  @apply inline-flex items-center justify-center rounded-xl font-medium;
  @apply transition-all duration-200;

  &--primary {
    @apply bg-primary-500 text-white shadow-lg;
    @apply hover:bg-primary-600;
  }

  &--sm {
    @apply min-h-[40px] px-4 py-2 text-sm;
  }
}
```

---

## 6. RTK Query и API

- Все эндпоинты расширяют `apiBase` через `injectEndpoints` (`@/shared/api/base-api`).
- Теги кэша — только через `ApiTag` enum из `@/shared/redux`.
- Нормализация и маппинг данных — только в `transformResponse`, не в компонентах.
- Хуки (useXxxQuery / useXxxMutation) экспортируются из файла API.

```typescript
import { apiBase } from '@/shared/api/base-api';
import { ApiTag } from '@/shared/redux';

export const eventApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    events: builder.query<EventCard[], void>({
      query: () => '/events',
      providesTags: [ApiTag.FEED],
    }),
  }),
});

export const { useEventsQuery } = eventApi;
```

**ApiTag**: `AUTH`, `FEED`, `NOTIFICATIONS`, `PROFILE`

**Аутентификация**: В заголовке `x-telegram-init-data` передаётся initData из Telegram WebApp.
Fallback — `x-telegram-user-id`. Логика в `shared/api/base-api.ts`.

---

## 7. Redux

- Типизированные хуки: `useAppDispatch`, `useAppSelector` из `@/shared/store/hooks`.
- Имена слайсов — через `StateNameType` enum (`@/shared/redux`).
- Слайс `ui` (в `shared/store/slices/ui-slice.ts`) управляет текущим табом и открытым detail.
- Слайс `auth` (в `features/auth/model/auth-slice.ts`) хранит состояние верификации.

```typescript
// StateNameType.AUTH = 'auth', StateNameType.UI = 'ui'
const authSlice = createSlice({
  name: StateNameType.AUTH,
  ...
});
```

---

## 8. Telegram WebApp

- SDK подключается в `app/layout.tsx` через `<script src="https://telegram.org/js/telegram-web-app.js">`.
- Инициализация — `initTelegramWebApp()` из `@/shared/lib/telegram`, вызывается в `MiniAppShell`.
- CSS-переменные для safe area: `--safe-area-top`, `--safe-area-bottom`, `--app-vh`.
- Используй `env(safe-area-inset-top, 0px)` в стилях для работы с notch/Dynamic Island.
- Хуки: `useTelegramButtons` — для MainButton/BackButton, `useViewportMode` — для отслеживания viewport.

---

## 9. Навигация

Приложение — SPA внутри Telegram Mini App, роутинг без URL.

- `MiniAppShell` (`views/shell/`) — корневой компонент, управляет tab и detail-состоянием.
- Экраны ленивые (`React.lazy`), каждый в своём `views/*/index.tsx`.
- `MainTab`: `home | create | notifications | points | account`.
- Detail-навигация: `{ kind: 'event' | 'club', id: string }` — открывается поверх текущего таба.

---

## 10. Компоненты design system (`shared/components`)

Все enum'ы вариантов экспортируются из файла компонента и из `shared/components/index.ts`.

| Компонент    | Enum вариантов                             |
| ------------ | ------------------------------------------ |
| `Button`     | `ButtonVariant`, `ButtonSize`              |
| `IconButton` | `IconButtonVariant`, `ButtonSize`          |
| `Card`       | `CardVariant`, `CardPadding`               |
| `Badge`      | `BadgeVariant`, `BadgeSize`, `EventStatus` |
| `Avatar`     | `AvatarSize`                               |

Пример использования:

```tsx
import { Button, ButtonSize, ButtonVariant } from '@/shared/components';

<Button variant={ButtonVariant.PRIMARY} size={ButtonSize.MD}>
  Присоединиться
</Button>;
```

---

## 11. Barrel-файлы

Каждый публичный слайс экспортирует через `index.ts`. Детали реализации не реэкспортируются.

```typescript
// entities/event/index.ts
export * from './types';
export * from './api';
export { EventFeedCard } from './ui/event-feed-card';
```

---

## 12. Чего не делать

- Не добавлять зависимости без согласования.
- Не использовать `useSelector`/`useDispatch` напрямую — только `useAppSelector`/`useAppDispatch`.
- Не маппить данные API в компонентах — только в `transformResponse`.
- Не передавать строки в `variant`/`size` пропсы компонентов — только enum значения.
- Не писать inline-стили для layout (отступы, цвета) — только `@apply` в CSS-файлах.
- Не создавать серверные компоненты с `useState`/`useEffect` — ставить `'use client'`.
