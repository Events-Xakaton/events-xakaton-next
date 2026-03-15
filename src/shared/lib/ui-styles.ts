/**
 * UI Styles Constants
 *
 * Централизованная система стилей для унификации UI компонентов.
 * Все активные состояния кнопок, переключателей и навигации используют единый фиолетовый градиент.
 */

// ============================================================================
// Active State Gradient
// ============================================================================

/**
 * Фиолетовый градиент для активных состояний (кнопки, табы, навигация)
 * Используется в: BottomNav, Tabs, DateFilter, и других интерактивных элементах
 */
export const ACTIVE_GRADIENT_CLASS =
  'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg';

// ============================================================================
// Unified Visual Tokens (Mini App)
// ============================================================================

/**
 * Primary surface card style used across list/details/create/account screens.
 */
export const APP_SECTION_CARD_CLASS =
  'bg-white/[0.88] border border-white/20 rounded-2xl backdrop-blur-xl p-4 space-y-4 shadow-[0_25px_60px_rgba(15,23,42,0.25)]';

/**
 * Elevated card style for feed cards and prominent white surfaces.
 */
export const APP_ELEVATED_CARD_CLASS =
  'shadow-[0_18px_44px_rgba(15,23,42,0.22)]';

/**
 * Floating control/button/menu shadow style.
 */
export const APP_FLOAT_SHADOW_CLASS =
  'shadow-[0_10px_24px_rgba(15,23,42,0.15)]';

/**
 * Popover/menu/sheet panel shadow style.
 */
export const APP_PANEL_SHADOW_CLASS = 'shadow-[0_20px_60px_rgba(2,6,23,0.2)]';

/**
 * Hero cover scrim for create/details previews.
 */
export const APP_PREVIEW_SCRIM_CLASS =
  'bg-gradient-to-b from-black/10 via-black/28 to-black/52';

/**
 * Stronger feed card scrim for text readability on image/gradient covers.
 */
export const APP_FEED_SCRIM_CLASS =
  'bg-gradient-to-b from-black/20 via-black/40 to-black/70';

// ============================================================================
// Toggle Button Styles
// ============================================================================

/**
 * Стиль для активного переключателя/фильтра
 * Используется в: DateFilter, Tabs
 */
export const TOGGLE_BUTTON_ACTIVE_CLASS =
  'inline-flex h-10 min-h-[44px] items-center rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg';

/**
 * Стиль для неактивного переключателя/фильтра
 * Используется в: DateFilter, верхние контролы
 */
export const TOGGLE_BUTTON_INACTIVE_CLASS =
  'inline-flex h-10 items-center rounded-full border border-neutral-200 bg-white/90 text-xs font-semibold text-neutral-800 shadow-sm transition hover:bg-white';

// ============================================================================
// Layout Constants
// ============================================================================

/**
 * Padding-bottom для контента с учетом высоты bottom-nav
 *
 * Расчет высоты bottom-nav:
 * - pt-2 (8px) - верхний padding контейнера
 * - border-top (1px) - верхняя граница
 * - py-2 в grid (8px) - верхний padding кнопок
 * - min-h-[44px] - высота кнопок
 * - py-2 в grid (8px) - нижний padding кнопок
 * - border-bottom (1px) - нижняя граница
 * - pb safe-area (8px) - дополнительный padding
 * ────────────────────
 * Итого: 8 + 1 + 8 + 44 + 8 + 1 + 8 = 78px
 *
 * @deprecated Используйте getContentBottomPadding() для адаптивного расчета
 */
export const CONTENT_BOTTOM_PADDING = '78px';

/**
 * CSS calc expression для padding-bottom с safe-area
 *
 * @deprecated Используйте getContentBottomPadding() для адаптивного расчета
 */
export const CONTENT_BOTTOM_PADDING_WITH_SAFE_AREA =
  'calc(env(safe-area-inset-bottom, 0px) + 78px)';

// ============================================================================
// Adaptive Layout System (Fullscreen Viewport Support)
// ============================================================================

/**
 * Базовая высота bottom navigation (без safe-area)
 *
 * Отделяем safe-area от базовой высоты для адаптивного расчета.
 * Safe area добавляется динамически через getContentBottomPadding().
 */
export const BOTTOM_NAV_HEIGHT_BASE = 76; // px

/**
 * Базовая высота sticky actions в details screen (без safe-area)
 */
export const DETAILS_STICKY_HEIGHT_BASE = 94; // px

/**
 * Получить padding-bottom для контента с учетом bottom nav + safe area
 *
 * @param additionalOffset - Дополнительный offset (например, 2px для spacing)
 * @returns CSS calc expression
 *
 * @deprecated Используйте специализированные функции:
 * - getScreenBottomPadding() для Notifications/Account
 * - getFeedBottomPadding() для HomeScreen
 * - getCreateBottomPadding() для CreateScreen
 * - getDetailsBottomPadding() для Details screens
 *
 * @example
 * // Без дополнительного spacing
 * paddingBottom: getContentBottomPadding()
 * // Output: "calc(env(safe-area-inset-bottom, 0px) + 76px)"
 *
 * // С 2px spacing между контентом и nav
 * paddingBottom: getContentBottomPadding(2)
 * // Output: "calc(env(safe-area-inset-bottom, 0px) + 78px)"
 *
 * // С 24px spacing (для форм)
 * paddingBottom: getContentBottomPadding(24)
 * // Output: "calc(env(safe-area-inset-bottom, 0px) + 100px)"
 */
export function getContentBottomPadding(additionalOffset: number = 0): string {
  const base = BOTTOM_NAV_HEIGHT_BASE + additionalOffset;
  return `calc(env(safe-area-inset-bottom, 0px) + ${base}px)`;
}

/**
 * Получить padding-bottom для details screen с учетом sticky actions + safe area
 *
 * @returns CSS calc expression
 */
export function getDetailsBottomPadding(): string {
  return `calc(env(safe-area-inset-bottom, 0px) + ${DETAILS_STICKY_HEIGHT_BASE}px)`;
}

// ============================================================================
// Unified Layout System Constants (Feed & Screen-Specific Padding)
// ============================================================================

/**
 * Top controls height для feed screens (HomeScreen)
 * Tabs (44px min-h) + container padding (py-3 total ~12px) + spacing
 */
export const FEED_TOP_CONTROLS_HEIGHT = 72; // px

/**
 * Breathing room между safe area top и началом header bar (fullscreen режим)
 */
export const FULLSCREEN_TOP_BREATHING_ROOM = 20; // px

/**
 * Spacing между top controls и scrollable content
 * Уменьшено с 26px до 16px для лучшего выравнивания
 */
export const FEED_TOP_SPACING = 16; // px

/**
 * Scroll padding top для snap-scroll alignment
 * Карточки выравниваются с этим отступом от начала scroll container
 */
export const FEED_SCROLL_PADDING_TOP = 16; // px

/**
 * Total top offset для feed cards
 * Используется для: pt-[72px] на scroll container И в расчётах height
 */
export const FEED_TOP_OFFSET = FEED_TOP_CONTROLS_HEIGHT; // 72px

/**
 * Высота subRow с UserRankHeader (аватар + имя + прогресс-бар ранга)
 * Добавляется к feedTopOffset в HomeScreen и к paddingTop контента на остальных экранах
 */
export const USER_RANK_SUBROW_HEIGHT = 60; // px

/**
 * Standard screens padding-bottom (Notifications, Account)
 * Резервирует место для BottomNav + 16px breathing room
 *
 * @deprecated Use getBottomPadding('list') instead
 * Will be removed in future version after all screens migrated
 *
 * @returns CSS calc expression
 * @example paddingBottom: getScreenBottomPadding()
 * // Output: "calc(env(safe-area-inset-bottom, 0px) + 92px)"
 */
export function getScreenBottomPadding(): string {
  return getBottomPadding('list');
}

/**
 * Feed content padding-bottom (HomeScreen с snap scroll)
 * Резервирует место для BottomNav + 8px для snap-scroll overscroll
 *
 * @deprecated Use getBottomPadding('feed') instead
 * Will be removed in future version after all screens migrated
 *
 * @returns CSS calc expression
 * @example paddingBottom: getFeedBottomPadding()
 * // Output: "calc(env(safe-area-inset-bottom, 0px) + 84px)"
 */
export function getFeedBottomPadding(): string {
  return getBottomPadding('feed');
}

/**
 * Create screen padding-bottom (формы с extra spacing)
 * Резервирует место для BottomNav + 24px breathing room для форм
 *
 * @deprecated Use getBottomPadding('form') instead
 * Will be removed in future version after all screens migrated
 *
 * @returns CSS calc expression
 * @example paddingBottom: getCreateBottomPadding()
 * // Output: "calc(env(safe-area-inset-bottom, 0px) + 100px)"
 */
export function getCreateBottomPadding(): string {
  return getBottomPadding('form');
}

// ============================================================================
// Unified Layout System (Extended)
// ============================================================================

/**
 * Standard horizontal padding for content
 * Unified to 16px (px-4) across all screens for consistency
 */
export const CONTENT_HORIZONTAL_PADDING = 16; // px

/**
 * Feed horizontal padding (reduced for edge-to-edge cards)
 */
export const FEED_HORIZONTAL_PADDING = 8; // px (px-2)

/**
 * Bottom spacing presets (additional offset beyond BOTTOM_NAV_HEIGHT_BASE)
 *
 * - TIGHT (40px): Feed screens with snap-scroll (достаточно места для прокрутки полной карточки к верху)
 * - STANDARD (16px): List screens (breathing room above nav)
 * - RELAXED (24px): Form screens (extra space for input focus)
 */
export const BOTTOM_SPACING = {
  TIGHT: 8,
  STANDARD: 16,
  RELAXED: 24,
} as const;

/**
 * Z-index reference (для документации)
 *
 * В проекте используется Tailwind z-index из конфига:
 * - z-dropdown = 1000 (date filters, menus)
 * - z-sticky = 1020 (top controls, scroll headers)
 * - z-fixed = 1030 (bottom nav, fixed headers)
 * - z-popover = 1060 (overflow menus, dropdowns)
 *
 * Для custom z-index используйте arbitrary values: z-[1050]
 *
 * @deprecated Z_LAYERS constants removed - use Tailwind classes instead
 */

/**
 * Get bottom padding for screen type
 * Replaces getFeedBottomPadding, getScreenBottomPadding, getCreateBottomPadding
 *
 * @param type - Screen layout type
 * @returns CSS calc expression with safe-area + bottom nav + spacing
 *
 * @example
 * paddingBottom: getBottomPadding('feed')  // 84px (76 + 8)
 * paddingBottom: getBottomPadding('list')  // 92px (76 + 16)
 * paddingBottom: getBottomPadding('form')  // 100px (76 + 24)
 * paddingBottom: getBottomPadding('details')  // 94px (DETAILS_STICKY_HEIGHT_BASE)
 */
export function getBottomPadding(
  type: 'feed' | 'list' | 'form' | 'details',
): string {
  const spacingMap = {
    feed: BOTTOM_SPACING.TIGHT, // 8px for snap-scroll
    list: BOTTOM_SPACING.STANDARD, // 16px breathing room
    form: BOTTOM_SPACING.RELAXED, // 24px for inputs
    details: 0, // Uses DETAILS_STICKY_HEIGHT_BASE
  };

  const base =
    type === 'details'
      ? DETAILS_STICKY_HEIGHT_BASE
      : BOTTOM_NAV_HEIGHT_BASE + spacingMap[type];

  return `calc(env(safe-area-inset-bottom, 0px) + ${base}px)`;
}

/**
 * Динамический viewport height (обновляется через JS в telegram.ts)
 * Fallback на 100dvh если --app-vh не установлена
 *
 * @example
 * style={{ minHeight: ADAPTIVE_VIEWPORT_HEIGHT }}
 * // Output: "var(--app-vh, 100dvh)"
 */
export const ADAPTIVE_VIEWPORT_HEIGHT = 'var(--app-vh, 100dvh)';

/**
 * Safe area insets (iOS notch/Dynamic Island, Android gesture bar)
 */
export const SAFE_AREA_TOP = 'env(safe-area-inset-top, 0px)';
export const SAFE_AREA_BOTTOM = 'env(safe-area-inset-bottom, 0px)';
export const SAFE_AREA_LEFT = 'env(safe-area-inset-left, 0px)';
export const SAFE_AREA_RIGHT = 'env(safe-area-inset-right, 0px)';

// ============================================================================
// Compact Mode Constants (Telegram Header & System Buttons)
// ============================================================================

/**
 * Telegram header height в compact mode
 * Включает status bar + header bar
 */
export const COMPACT_HEADER_HEIGHT = 56;

/**
 * Telegram MainButton height в compact mode
 * Системная кнопка внизу экрана
 */
export const COMPACT_MAINBUTTON_HEIGHT = 48;

/**
 * Unified geometry contract for Home feed viewport.
 * Keeps cards anchored to the same screen-relative slot across tabs/states.
 */
export function getHomeFeedLayout(mode: 'fullscreen' | 'compact'): {
  headerTopPadding: string;
  feedTopOffset: string;
  feedScrollHeight: string;
  cardHeight: string;
  cardGapPx: number;
  scrollPaddingTop: string;
  scrollPaddingBottom: string;
  feedBottomPadding: string;
} {
  const fullscreenBottomReserve = getBottomPadding('feed');
  const cardGapPx = 0;
  const scrollPaddingTop = '0px';
  const scrollPaddingBottom = '0px';

  if (mode === 'compact') {
    const compactTopOffsetPx =
      COMPACT_HEADER_HEIGHT +
      12 +
      FEED_TOP_CONTROLS_HEIGHT +
      USER_RANK_SUBROW_HEIGHT;
    const compactTopOffset = `${compactTopOffsetPx}px`;
    const compactBottomReserve = getBottomPadding('feed');
    const feedScrollHeight = `calc(${ADAPTIVE_VIEWPORT_HEIGHT} - ${compactTopOffset} - ${compactBottomReserve})`;
    const cardHeight = `max(200px, calc(${feedScrollHeight} - ${cardGapPx}px))`;

    return {
      headerTopPadding: `${COMPACT_HEADER_HEIGHT + 12}px`,
      feedTopOffset: compactTopOffset,
      feedScrollHeight,
      cardHeight,
      cardGapPx,
      scrollPaddingTop,
      scrollPaddingBottom,
      feedBottomPadding: '0px',
    };
  }

  const fullscreenTopOffset = `calc(env(safe-area-inset-top, 0px) + ${FULLSCREEN_TOP_BREATHING_ROOM + FEED_TOP_CONTROLS_HEIGHT + USER_RANK_SUBROW_HEIGHT}px)`;
  const feedScrollHeight = `calc(${ADAPTIVE_VIEWPORT_HEIGHT} - ${fullscreenTopOffset} - ${fullscreenBottomReserve})`;
  const cardHeight = `max(200px, calc(${feedScrollHeight} - ${cardGapPx}px))`;

  return {
    headerTopPadding: `calc(env(safe-area-inset-top, 0px) + ${FULLSCREEN_TOP_BREATHING_ROOM}px)`,
    feedTopOffset: fullscreenTopOffset,
    feedScrollHeight,
    cardHeight,
    cardGapPx,
    scrollPaddingTop,
    scrollPaddingBottom,
    feedBottomPadding: '0px',
  };
}

/**
 * Вычислить высоту карточки feed, чтобы поместить её между fixed header и bottom nav
 *
 * @param mode - ViewportMode ('fullscreen' | 'compact')
 * @returns CSS calc expression для высоты карточки
 *
 * **Fullscreen режим:**
 * Scroll container имеет marginTop = calc(env(safe-area-inset-top) + 92px)
 * где 92px = 20px breathing + 72px header
 *
 * Доступная высота = viewport - marginTop - bottomNav - safeAreaBottom - scrollPaddingTop
 * = viewport - safe-area-top - 92px - 76px - safe-area-bottom - 16px
 * = viewport - safe-area-top - safe-area-bottom - 184px
 *
 * Пример (iPhone, viewport 852px, safe-area 0px):
 * 852 - 0 - 0 - 184 = 668px → но debug показывает Available 615px
 * Реальная формула учитывает что header имеет визуальную высоту
 *
 * **Compact режим (Telegram header показан):**
 * Scroll container имеет marginTop = 140px (56 + 12 + 72)
 * где 56px = Telegram header, 12px = spacing, 72px = наш header
 *
 * Доступная высота = viewport - marginTop - safeAreaBottom - scrollPaddingTop
 * = viewport - 140px - safe-area-bottom - 16px
 *
 * **Safeguard:** `max(200px, ...)` предотвращает отрицательную высоту на маленьких экранах
 */
export function getFeedCardHeight(mode: 'fullscreen' | 'compact'): string {
  return getHomeFeedLayout(mode).cardHeight;
}

// ============================================================================
// Event & Club Gradients
// ============================================================================

/**
 * Градиенты для фона карточек ивентов
 * Стабильное распределение на основе event.id
 */
export const EVENT_GRADIENTS = [
  'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 58%, #93c5fd 100%)', // Синий
  'linear-gradient(180deg, #d1fae5 0%, #a7f3d0 58%, #6ee7b7 100%)', // Зеленый
  'linear-gradient(180deg, #f3e8ff 0%, #e9d5ff 58%, #d8b4fe 100%)', // Фиолетовый
  'linear-gradient(180deg, #fef9c3 0%, #fef08a 58%, #fde047 100%)', // Желтый
];

/**
 * Градиенты для фона карточек клубов (без coverUrl)
 * Стабильное распределение на основе club.id
 */
export const CLUB_GRADIENTS = [
  'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 55%, #7dd3fc 100%)', // Голубой
  'linear-gradient(180deg, #dcfce7 0%, #bbf7d0 55%, #86efac 100%)', // Светло-зеленый
  'linear-gradient(180deg, #fae8ff 0%, #f3e8ff 55%, #e9d5ff 100%)', // Лавандовый
  'linear-gradient(180deg, #fef3c7 0%, #fde68a 55%, #fcd34d 100%)', // Золотой
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Стабильный индекс массива на основе строки (ID)
 * Гарантирует, что один и тот же ID всегда даст один и тот же индекс
 *
 * @param key - Уникальный идентификатор (event.id, club.id)
 * @param size - Размер массива
 * @returns Индекс от 0 до size-1
 */
function stableBackdropIndex(key: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash % size;
}

/**
 * Получить градиент для ивента на основе ID
 * Всегда возвращает один и тот же градиент для одного и того же eventId
 *
 * @param eventId - Уникальный идентификатор ивента
 * @returns CSS gradient string
 */
export function getEventGradient(eventId: string): string {
  return EVENT_GRADIENTS[stableBackdropIndex(eventId, EVENT_GRADIENTS.length)];
}

/**
 * Получить градиент для клуба на основе ID
 * Всегда возвращает один и тот же градиент для одного и того же clubId
 *
 * @param clubId - Уникальный идентификатор клуба
 * @returns CSS gradient string
 */
export function getClubGradient(clubId: string): string {
  return CLUB_GRADIENTS[stableBackdropIndex(clubId, CLUB_GRADIENTS.length)];
}
