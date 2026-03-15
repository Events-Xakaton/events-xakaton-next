# Data Model: Event Location Link Rendering and Google Maps Handling

## Entity: ParsedLocationLink

Represents normalized + classified value of `event.locationOrLink` for UI rendering and tap handling.

```ts
export type LocationLinkKind = 'plain_text' | 'url' | 'google_maps_url';

export type ParsedLocationLink = {
  raw: string;            // original value from API
  trimmed: string;        // trimmed value
  displayText: string;    // text shown in row (before CSS clamp)
  url: string | null;     // normalized http/https URL for opening
  kind: LocationLinkKind;
  isClickable: boolean;
};
```

### Invariants

- `kind === 'plain_text'` => `url === null`, `isClickable === false`
- `kind === 'url' | 'google_maps_url'` => `url !== null`, `isClickable === true`
- `url` always starts with `http://` or `https://`

## Entity: LocationOpenStrategy

Represents how UI should attempt opening an URL after tap.

```ts
export type LocationOpenStrategy =
  | 'google_priority'   // google maps URL
  | 'default_external'  // any other URL
  | 'not_openable';     // plain text / invalid
```

### Mapping rules

- `google_maps_url` -> `google_priority`
- `url` -> `default_external`
- `plain_text` -> `not_openable`

## State touch points

- Source: `event.locationOrLink` from `EventDetailsRes`.
- Derived state (ephemeral): `parsedLocationLink` computed in render flow.
- Persistent storage: none.

## Validation and sanitization

- Input is user-generated string from backend.
- Parser must trim whitespace and reject unsafe schemes.
- Parser should attempt protocol prefix for bare host values where applicable.
