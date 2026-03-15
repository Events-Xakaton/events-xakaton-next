# Quickstart: Kids Audience Marker for Events

## Preconditions

1. Frontend branch: `010-event-kids-age`.
2. Backend already returns audience fields in event payloads.
3. Есть доступ к create/edit/details и карточкам в ленте.

## Build check

```bash
cd /Users/frolov.f/hack2026/events-xakaton-next
npm run build
```

## Smoke scenarios

### Scenario A: Create adult event (default)

1. Open `Create -> Event`.
2. Leave `Для детей` switched off.
3. Publish event.
4. Verify:
   - create request does not set kids marker as true,
   - card has no kids badge,
   - details show no kids label.

### Scenario B: Create kids event with age

1. Open `Create -> Event`.
2. Enable `Для детей`.
3. Select age `6+`.
4. Publish event.
5. Verify:
   - event details show `Для детей 6+`,
   - feed/profile/club cards show `Для детей 6+` под чипом времени.

### Scenario C: Create kids event without age

1. Enable `Для детей`.
2. Leave age unset.
3. Publish event.
4. Verify cards/details show `Для детей`.

### Scenario D: Edit event audience fields

1. Open existing event and enter edit mode.
2. Toggle `Для детей` on, set `12+`, save.
3. Verify details/cards show `Для детей 12+`.
4. Reopen edit, toggle off, save.
5. Verify kids label disappears everywhere.

### Scenario E: Legacy event compatibility

1. Open event created before feature rollout.
2. Verify no runtime errors and event is shown as adult.

## Regression checklist

- Create and edit flows still save required fields (title, description, location, dates).
- Min level rendering stays unchanged.
- Card layouts are not broken by kids badge text.
- Kids badge position is consistent: under time chip on feed/profile/club cards.
