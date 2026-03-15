# Спека 002: Easter Egg Button

## Цель

Заменить мгновенный переход на колесо фортуны на промежуточный шаг:
после срабатывания триггера в правом нижнем углу появляется кнопка-яйцо.
Только нажатие на неё открывает `LuckyWheelScreen`.

---

## Поведение

### Появление

- Условие: `isLuckyTriggered === true` И текущий таб Home === `'events'`
- Кнопка появляется с анимацией fade-in + scale-in (300 мс)

### Жизненный цикл

- Кнопка **исчезает навсегда** после клика (триггер сбрасывается через `resetLucky()`)
- Если пользователь уходит на другой таб и возвращается — `resetLucky()` вызывается при смене таба (уже реализовано в `HomeScreen`), яйцо исчезает
- Кнопки dismiss/закрытия нет — исчезает только по клику

### Слой отображения

- Только на экране Home (`HomeScreen`)
- Не отображается поверх detail-view, колеса, других табов

### Позиционирование

- `position: fixed`, правый нижний угол
- `right: 16px`
- `bottom`: над BottomNav, не перекрывая его — `calc(env(safe-area-inset-bottom, 0px) + 72px)`
- z-index: выше контента ленты, но не обязан быть выше модалок/detail (их нет одновременно с Home)

---

## Анимация

### Появление (`egg-enter`)

```
opacity: 0, scale: 0.5  →  opacity: 1, scale: 1
duration: 300ms, ease-out
```

### Покачивание (`egg-wobble`)

Паттерн привлечения внимания: покачивание → пауза → покачивание → пауза → ...

```
Keyframes (rotate по оси Z):
0%    →  0deg
8%    → +10deg
16%   → -10deg
24%   → +8deg
32%   → -6deg
40%   →  0deg    ← первое покачивание закончилось
40%–60% →  0deg  ← пауза
60%   →  0deg
68%   → +10deg
76%   → -10deg
84%   → +8deg
92%   → -6deg
100%  →  0deg    ← второе покачивание, затем пауза до следующего цикла

duration: 2.8s, ease-in-out, infinite
transform-origin: center bottom
```

### Нажатие

`active`: scale 0.88, duration 100ms

---

## Компонент

**Файл:** `src/views/home/ui/easter-egg-button.tsx`
**Стили:** `src/views/home/ui/styles/easter-egg-button.css`

```ts
type Props = {
  visible: boolean;
  onClick: () => void;
};
```

- `visible={false}` → `opacity-0 pointer-events-none` (компонент рендерится, нет layout shift)
- `visible={true}` → анимация появления + покачивание
- Размер кнопки: `56×56px`
- Изображение: `<Image src="/easter-egg.png" alt="Мне повезёт" width={56} height={56} />`
- Кнопка без фона, рамок, скруглений — только изображение

---

## Изменения в существующих файлах

### `src/views/home/index.tsx`

- Удалить блок «Секретная кнопка `Мне повезёт`» (строки 379–394)
- Добавить в конце JSX:
  ```tsx
  <EasterEggButton
    visible={isLuckyTriggered && homeTab === 'events'}
    onClick={() => {
      resetLucky();
      onOpenLuckyWheel();
    }}
  />
  ```
- Добавить импорт `EasterEggButton`

---

## Файлы к созданию / изменению

| Файл                                             | Действие |
| ------------------------------------------------ | -------- |
| `src/views/home/ui/easter-egg-button.tsx`        | создать  |
| `src/views/home/ui/styles/easter-egg-button.css` | создать  |
| `src/views/home/index.tsx`                       | изменить |

---

## Что не меняется

- Логика триггера (`useLuckyTrigger`) — без изменений
- `MiniAppShell` — без изменений
- `LuckyWheelScreen` — без изменений
- Телеметрия `trackLuckyReveal` — остаётся на месте в `HomeScreen`
