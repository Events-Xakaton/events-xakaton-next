# Data Model: Kids Audience Marker for Events

## Entity: EventAudienceFields

Represents audience-related attributes attached to event payloads.

```ts
export type EventAudienceFields = {
  isForKids: boolean;
  kidsMinAge: number | null;
};
```

### Invariants

- `isForKids === false` => `kidsMinAge` must be treated as `null` in UI.
- `isForKids === true` and `kidsMinAge === null` => show generic badge `Для детей`.
- `isForKids === true` and `kidsMinAge !== null` => show badge `Для детей {N}+`.

## Entity: EventCard (extended)

`EventCard` adds audience fields for feed/profile cards.

```ts
export type EventCard = {
  // existing fields...
  isForKids: boolean;
  kidsMinAge: number | null;
};
```

## Entity: EventDetails (extended)

`EventDetails` adds audience fields for detail screen and edit draft initialization.

```ts
export type EventDetails = {
  // existing fields...
  isForKids: boolean;
  kidsMinAge: number | null;
};
```

## Entity: EventDraftAudience

Audience fields in edit/create form state.

```ts
export type EventDraftAudience = {
  isForKids: boolean;
  kidsMinAge: number | null;
};
```

## View Model: EventAudienceBadge

Unified computed label for UI rendering.

```ts
export type EventAudienceBadge =
  | { visible: false; text: null }
  | { visible: true; text: 'Для детей' }
  | { visible: true; text: `Для детей ${number}+` };
```

### Mapping rules

- Adult event -> `{ visible:false, text:null }`
- Kids without age -> `{ visible:true, text:'Для детей' }`
- Kids with age -> `{ visible:true, text:'Для детей {N}+' }`

## State touch points

- Source: `/events`, `/events/:eventId`, `/clubs/:clubId/events` payloads.
- Form state: `useEventForm`, `useEventDraft`.
- Derived state: badge label in card and detail UI.
- Persistent storage: backend API only.
