# Data Model: Date Filters by Event Time Range

## Entity: EventCard (extended)

```ts
export type EventCard = {
  id: string;
  startsAtUtc: string;
  endsAtUtc?: string | null;
  status: string;
  joinedByMe: boolean;
  isOrganizer: boolean;
  // ...other existing fields
};
```

## Entity: NormalizedEventRange

```ts
export type NormalizedEventRange = {
  start: Date;
  end: Date;
};
```

### Normalization rules

- `start = parse(startsAtUtc)`; при невалидном start ивент обрабатывается legacy-safe (не падаем runtime).
- `end = parse(endsAtUtc)`; если end невалиден/отсутствует -> `end = start`.
- Если `end < start`, трактуем как `end = start`.

## Entity: FilterWindow

```ts
export type FilterWindow = {
  start: Date;
  end: Date;
};
```

### Membership predicate

```ts
belongs(event, window) := event.end > window.start && event.start < window.end
```

## Entity: ProfileBuckets

```ts
export type ProfileBuckets = {
  upcoming: EventCard[]; // end > now
  past: EventCard[]; // end <= now
};
```

### Invariants

- Ongoing event always belongs to `upcoming` bucket.
- Event can never be in both `upcoming` and `past` for one `now`.
- Missing `endsAtUtc` uses start-based fallback for compatibility.
