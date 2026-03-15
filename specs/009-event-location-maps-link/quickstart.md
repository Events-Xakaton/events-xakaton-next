# Quickstart: Event Location Link Rendering and Google Maps Handling

## Preconditions

1. Frontend branch: `009-event-location-maps-link`.
2. App opens `EventDetails` screen with editable event data.
3. Test dataset includes events with different `locationOrLink` values.

## Build check

```bash
cd /Users/frolov.f/hack2026/events-xakaton-next
npm run build
```

## Smoke scenarios

### Scenario A: Very long Google Maps URL should fit UI and be tappable

1. Set event `locationOrLink` to:
   `https://maps.app.goo.gl/GvbZSLEkYZhR65fL8?g_st=ic&very_long_param=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
2. Open `EventDetails`.
3. Verify:
   - location value stays inside card boundaries,
   - max 2 text lines + ellipsis,
   - no horizontal scrolling,
   - tap opens Google-priority external flow (app/universal-link path) or fallback URL.

### Scenario B: Non-google URL should be tappable as generic link

1. Set `locationOrLink` to `https://example.com/events/meetup?id=123`.
2. Open `EventDetails`.
3. Verify tap opens external link.

### Scenario C: Bare domain URL without protocol

1. Set `locationOrLink` to `www.google.com/maps/place/55.7558,37.6173`.
2. Open `EventDetails`.
3. Verify link is normalized and tappable.

### Scenario D: Plain text address remains non-clickable

1. Set `locationOrLink` to `Москва, Парк Горького, центральный вход`.
2. Open `EventDetails`.
3. Verify row is not tappable and text layout remains correct.

### Scenario E: Unsafe schema is not opened

1. Set `locationOrLink` to `javascript:alert(1)`.
2. Open `EventDetails`.
3. Verify value is shown as plain text and tap action is disabled.

## Regression checklist

- `Начало`, `Окончание`, `Участники`, `Мин. уровень` rows keep previous alignment and spacing.
- CTA button block under details card remains unchanged.
- No TypeScript or build regressions.
