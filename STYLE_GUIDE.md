# Style Guide — Spinera Front

Руководство по стилю кода для проекта Spinera Front (Telegram Mini App). Основано на анализе реального кода проекта.

---

## Содержание

1. [Архитектура (FSD)](#1-архитектура-fsd)
2. [TypeScript](#2-typescript)
3. [Компоненты React](#3-компоненты-react)
4. [Стилизация](#4-стилизация)
5. [RTK Query и API](#5-rtk-query-и-api)
6. [Redux (слайсы)](#6-redux-слайсы)
7. [Формы](#7-формы)
8. [Именование](#8-именование)
9. [Импорты](#9-импорты)
10. [Barrel-файлы](#10-barrel-файлы)

---

## 1. Архитектура (FSD)

### Структура слоёв

```
src/
├── app/          # Next.js App Router: страницы, лейауты, провайдеры
├── views/        # Вью-компоненты страниц
├── widgets/      # Составные компоненты
├── features/     # Фичи (бизнес-логика)
├── entities/     # Доменные сущности
└── shared/       # Переиспользуемый код
    ├── components/
    ├── redux/
    ├── lib/
    └── public/
```

### Правила импорта

**Запрещено** импортировать из вышестоящего слоя:

```typescript
// shared не может импортировать из entities/features/widgets/views/app
// entities не может импортировать из features/widgets/views/app
// features не может импортировать из widgets/views/app
// и т.д.
```

### Структура слайса (entities/features/widgets)

Каждый слайс содержит подпапки по назначению:

```
feature-name/
├── api/          # RTK Query endpoints
├── lib/
│   ├── hooks/    # Кастомные хуки
│   ├── functions/ # Вспомогательные функции
│   ├── types/    # Типы и интерфейсы
│   └── enums/    # Перечисления
├── ui/           # React-компоненты
└── index.ts      # Публичный API (barrel)
```

---

## 2. TypeScript

### Строгий режим

`"strict": true` — обязательно. Запрещено:

```typescript
// Нельзя
const x: any = something;
// @ts-ignore
// @ts-nocheck
const el = document.getElementById('id')!; // non-null assertion
var counter = 0;
```

Правильно:

```typescript
const x: unknown = something;
if (typeof x === 'string') { /* ... */ }
const el = document.getElementById('id');
if (!el) return;
let counter = 0;
```

### type vs interface

- `type` — для union, intersection, utility-типов, ответов API, доменных моделей
- `interface` — для объектных контрактов (используется редко)

```typescript
// Доменная модель
type Spin = {
  id: string;
  value: string;
  code: string;
  createdAt: string;
  prizeCategory: PrizeCategory;
};

// Union
type ButtonVariant = 'primary' | 'secondary' | 'outline';

// Ответ API
type BaseResponse<T = undefined> = {
  statusCode: number;
  message: string;
  data: T;
};
```

### Enum

Предпочтительный способ для именованных констант:

```typescript
// Правильно: enum с явными значениями
export enum ButtonSize {
  EXTRA_SMALL = 0,
  SMALL = 1,
  MEDIUM = 2,
  LARGE = 3,
}

export enum ApiTag {
  PROFILE = 'PROFILE',
  SPINS = 'SPINS',
  VOUCHERS = 'VOUCHERS',
}
```

### Явные типы возвращаемых значений

```typescript
// Правильно
export const getInitData = (): string => { ... };
export const useAuth = (): boolean => { ... };

// Неправильно
export const getInitData = () => { ... };
```

### Props-типы компонентов

Именуются как `Props`, объявляются через `type`:

```typescript
type Props = {
  children?: ReactNode;
  onClick?: (e?: SyntheticEvent) => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
};
```

---

## 3. Компоненты React

### Функциональные компоненты

Только `FC<Props>`, без `React.FC`:

```typescript
'use client';

import { FC } from 'react';

type Props = {
  title: string;
  onClick: () => void;
};

export const MyComponent: FC<Props> = ({ title, onClick }) => {
  return <div onClick={onClick}>{title}</div>;
};
```

### Server vs Client компоненты

- По умолчанию — серверные компоненты (без директивы)
- `'use client'` — только при необходимости (обработчики событий, хуки, анимации)
- Директива `'use client'` — первая строка файла

### Условный рендеринг

Вместо тернарных операторов используется `Activity`:

```typescript
// Правильно
<Activity isActive={isLoading}>
  <Spinner />
</Activity>

// Допустимо для простых случаев
{error && <ErrorMessage text={error} />}
```

### Динамические стили через Map

```typescript
const sizeClassMap: Record<ButtonSize, string> = {
  [ButtonSize.EXTRA_SMALL]: styles['button--extra-small'],
  [ButtonSize.SMALL]: styles['button--small'],
  [ButtonSize.MEDIUM]: styles['button--medium'],
  [ButtonSize.LARGE]: styles['button--large'],
};

// Использование
className={cn(styles.button, sizeClassMap[size])}
```

### Провайдеры

Каждый провайдер — отдельный компонент с `'use client'`. Порядок вложенности строго соблюдается:

```tsx
// app/_providers/index.tsx
export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <TelegramInitProvider>
    <StoreProvider>
      <SocketIoConnectionProvider>
        <TopUpSubscriptionProvider>
          <FreeSpinsSubscriptionProvider>
            <JackpotFridaySubscriptionProvider>
              {children}
            </JackpotFridaySubscriptionProvider>
          </FreeSpinsSubscriptionProvider>
        </TopUpSubscriptionProvider>
      </SocketIoConnectionProvider>
    </StoreProvider>
  </TelegramInitProvider>
);
```

---

## 4. Стилизация

### CSS Modules + Tailwind

Стили компонента — в файле `styles.css` рядом с `ui/`:

```
button/
├── ui/
│   └── button.tsx
├── styles/
│   └── styles.css
└── index.ts
```

### Структура CSS-файла

```css
@import '../../../lib/styles/themes.css';

/* BEM: блок */
.button {
  @apply flex w-full shrink-0 items-center justify-center gap-[10px];
  @apply rounded-[30px] border-[1px] transition-all;

  /* BEM: модификатор блока */
  &--extra-small { @apply h-[30px] text-[12px]; }
  &--small       { @apply h-[40px] text-[14px]; }
  &--medium      { @apply h-[50px] text-[16px]; }
  &--large       { @apply h-[60px] text-[18px]; }

  /* BEM: элемент */
  &__icon { @apply shrink-0; }

  /* BEM: элемент с модификатором */
  &__text--golden { @apply text-golden; }
}
```

### CSS-переменные (themes.css)

Темы и кастомные переменные объявляются в `shared/lib/styles/themes.css`:

```css
@theme {
  --font-widock: WidockTrial;
  --font-sf-pro-display: SFProDisplay;
  --color-golden: #fcf7b7;
  --text-shadow-golden: 0 0 20px #c8943f;
}
```

### Переиспользуемые утилити-классы

```css
/* themes.css */
.clickable {
  @apply cursor-pointer transition hover:opacity-90 active:opacity-80;
}

.page-title {
  @apply font-widock text-[18px] font-bold text-white;
}
```

### Порядок Tailwind-классов

Сортируется автоматически через `prettier-plugin-tailwindcss`. Не переставляй вручную.

---

## 5. RTK Query и API

### Единая точка входа

Все эндпоинты расширяют `backendApi` через `injectEndpoints`:

```typescript
// entities/user/api/user.api.ts
import { backendApi } from '@/shared';

export const userApi = backendApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<BaseResponse<ProfileRes>, null>({
      query: () => 'users/profile',
      providesTags: [ApiTag.PROFILE],
    }),

    updateProfile: build.mutation<BaseResponse, UpdateProfileReq>({
      query: (body) => ({
        method: 'PUT',
        url: 'users/profile',
        body,
      }),
      invalidatesTags: [ApiTag.PROFILE],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = userApi;
```

### transformResponse

Вся нормализация и маппинг — только в `transformResponse`, не в компонентах:

```typescript
getSpins: build.query<BaseResponse<SpinsRes>, null>({
  query: () => 'spins',
  providesTags: [ApiTag.SPINS],
  transformResponse: (response: BaseResponse<RawSpinsRes>) => {
    const spins = response.data.spins.map(({ value, code, createdAt, cost, ...rest }) => ({
      ...rest,
      value: transformSpinAmount({ value, prizeCategory: rest.prizeCategory, cost }),
      code: transformCode({ code }),
      createdAt: moment(createdAt).format('DD.MM.YY HH:mm'),
    }));
    return { ...response, data: { spins } };
  },
}),
```

### Теги кэша

Все теги объявлены в `shared/redux/enums/api-tag.ts`:

```typescript
export enum ApiTag {
  PROFILE = 'PROFILE',
  PRIZE_CATEGORIES = 'PRIZE_CATEGORIES',
  SPINS = 'SPINS',
  AUTH_JWT_TOKEN = 'AUTH_JWT_TOKEN',
  VOUCHERS = 'VOUCHERS',
  COMMISSION = 'COMMISSION',
  ESTIMATED_PRICE = 'ESTIMATED_PRICE',
}
```

### Обработка ошибок

Ошибки API обрабатываются через `isError` / `error` из хука RTK Query, не через `try/catch` в компонентах.

---

## 6. Redux (слайсы)

### Структура слайса

```typescript
// shared/redux/model/auth/auth.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateNameType } from '../../enums';

type AuthState = {
  jwt: string | null;
};

const initialState: AuthState = {
  jwt: null,
};

const authSlice = createSlice({
  name: StateNameType.AUTH,
  initialState,
  reducers: {
    setJwt: (state, action: PayloadAction<string | null>) => {
      state.jwt = action.payload;
    },
  },
});

export const { setJwt } = authSlice.actions;
export const authReducer = authSlice.reducer;
```

### Типизированные хуки

Используй только типизированные хуки, не голый `useDispatch`/`useSelector`:

```typescript
// Правильно
const dispatch = useAppDispatch();
const jwt = useAppSelector((state) => state.auth.jwt);

// Неправильно
const dispatch = useDispatch();
const jwt = useSelector((state: any) => state.auth.jwt);
```

### Имена состояний

Все имена ключей стора объявлены в `StateNameType`:

```typescript
export enum StateNameType {
  AUTH = 'auth',
  // ...
}
```

---

## 7. Формы

### react-hook-form + zod

Схема валидации определяется через фабричную функцию (для параметризации):

```typescript
// lib/functions/get-withdrawal-form-schema.ts
export const getWithdrawalFormSchema = (
  balance: number,
  validationRegex: RegExp,
  method: TransactionMethod,
) =>
  z.object({
    amount: z.preprocess(
      Number,
      z
        .number({ message: 'Сумма должна быть числом' })
        .int({ message: 'Используйте целочисленные значения' })
        .nonnegative({ message: 'Сумма должна быть положительной' })
        .max(balance, { message: 'Сумма превышает баланс' }),
    ),
    walletAddress: z
      .string()
      .regex(validationRegex, { message: 'Некорректный адрес кошелька' }),
    method: z.nativeEnum(TransactionMethod),
  });
```

### Хук формы

Форм-хук инкапсулирует схему и настройки:

```typescript
// lib/hooks/use-withdrawal-form.ts
export const useWithdrawalForm = (
  balance: number,
  validationRegex: RegExp,
  method: TransactionMethod,
) => {
  const schema = getWithdrawalFormSchema(balance, validationRegex, method);

  return useForm<WithdrawalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      walletAddress: '',
      method,
    },
  });
};
```

### Передача пропсов в компоненты форм

```tsx
<Input
  title="Сумма"
  placeholder="100"
  ticker="USD"
  hookFormProps={register('amount')}
  error={errors.amount?.message}
/>
```

---

## 8. Именование

### Файлы

| Тип файла | Конвенция | Пример |
|-----------|-----------|--------|
| Компоненты | `kebab-case.tsx` | `bottom-menu.tsx` |
| Хуки | `use-*.ts` | `use-auth.ts` |
| API | `*.api.ts` | `user.api.ts` |
| Слайсы | `*.slice.ts` | `auth.slice.ts` |
| Типы | `*.ts` | `spin.ts`, `profile.ts` |
| Enum-файлы | `kebab-case.ts` | `button-size.ts`, `api-tag.ts` |
| Функции | `get-*.ts` / `*.ts` | `get-init-data.ts` |
| Стили | `styles.css` | всегда `styles.css` |
| Barrel | `index.ts` | всегда `index.ts` |

### Код

| Сущность | Конвенция | Пример |
|----------|-----------|--------|
| Переменные | `camelCase` | `isLoading`, `spinList` |
| Функции | `camelCase` | `getInitData`, `transformCode` |
| Компоненты | `PascalCase` | `Button`, `BottomMenu` |
| Типы / Interfaces | `PascalCase` | `SpinType`, `BaseResponse` |
| Enum | `PascalCase` | `ButtonSize`, `ApiTag` |
| Enum-значения | `UPPER_SNAKE_CASE` | `EXTRA_SMALL`, `AUTH_JWT_TOKEN` |
| CSS-классы | `kebab-case` (BEM) | `button__text--golden` |
| Props-тип | `Props` | всегда `Props` |

---

## 9. Импорты

### Порядок (строго, Prettier)

```typescript
// 1. Сторонние библиотеки
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';

// 2. @/app
import { SomePage } from '@/app/some-page';

// 3. @/views
import { GameView } from '@/views/game';

// 4. @/widgets
import { ModalWindow } from '@/widgets/modal-window';

// 5. @/features
import { useAuth } from '@/features/auth';

// 6. @/entities
import { useGetProfileQuery } from '@/entities/user';

// 7. @/shared
import { Button, useAppSelector } from '@/shared';

// 8. @/public (ресурсы)
import SpinIcon from '@/public/icons/spin.svg';

// 9. Относительные импорты
import { styles } from './styles.css';
```

### Алиасы

Используй только объявленные алиасы, не относительные пути к другим слоям:

```typescript
// Правильно
import { Button } from '@/shared/components/button';

// Неправильно
import { Button } from '../../shared/components/button';
```

---

## 10. Barrel-файлы

Каждая директория с публичным API экспортирует через `index.ts`:

```typescript
// entities/user/index.ts
export * from './api';          // useGetProfileQuery, useUpdateProfileMutation
export * from './lib';          // типы, хуки, функции
```

```typescript
// shared/components/button/index.ts
export * from './lib';          // ButtonSize, ButtonVariant (enums и типы)
export { Button } from './ui';  // компонент
```

```typescript
// features/auth/lib/index.ts
export * from './hooks';
export * from './functions';
export * from './types';
export * from './enums';
```

**Правило:** Не реэкспортируй то, что является деталью реализации. Barrel — это публичный API слайса.

---

## Быстрая справка

```
Можно                          Нельзя
─────────────────────────────────────────────────────
type Props = { ... }           interface Props { ... }
enum ApiTag { X = 'X' }        const API_TAG = { X: 'X' }
useAppSelector(sel)            useSelector(sel)
transformResponse в API        маппинг в компоненте
@apply в CSS                   inline-стили для Tailwind
Activity вместо тернарника     { condition ? <A/> : <B/> }
'use client' только по нужде   'use client' везде
Явный тип возврата функции     Неявный тип возврата
const/let                      var
```