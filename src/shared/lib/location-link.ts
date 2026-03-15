'use client';

import { openLink } from '@telegram-apps/sdk';

export type LocationLinkKind = 'plain_text' | 'url' | 'google_maps_url';

export type ParsedLocationLink = {
  raw: string;
  trimmed: string;
  displayText: string;
  url: string | null;
  kind: LocationLinkKind;
  isClickable: boolean;
};

const HTTP_PROTOCOL_RE = /^https?:\/\//i;
const ANY_PROTOCOL_RE = /^[a-z][a-z0-9+.-]*:/i;
const BARE_HOST_RE =
  /^(?:www\.|maps\.|google\.|[a-z0-9-]+\.[a-z]{2,})(?:[/:?#]|$)/i;

function getDisplayHost(rawUrl: string): string {
  const parsed = toUrl(rawUrl);
  if (!parsed) return rawUrl;

  return parsed.hostname.replace(/^www\./i, '') || rawUrl;
}

function toUrl(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

function extractUrlCandidate(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (!trimmed.includes(' ')) {
    return trimmed;
  }

  const explicit = trimmed.match(/https?:\/\/\S+/i);
  if (explicit?.[0]) return explicit[0];

  const bare = trimmed.match(/\b(?:www\.|maps\.|google\.)\S+/i);
  return bare?.[0] ?? null;
}

function ensureHttpProtocol(candidate: string): string {
  if (HTTP_PROTOCOL_RE.test(candidate)) {
    return candidate;
  }

  if (ANY_PROTOCOL_RE.test(candidate)) {
    return candidate;
  }

  if (BARE_HOST_RE.test(candidate)) {
    return `https://${candidate}`;
  }

  return candidate;
}

export function isSafeHttpUrl(rawUrl: string): boolean {
  const parsed = toUrl(rawUrl);
  if (!parsed) return false;

  const protocol = parsed.protocol.toLowerCase();
  return protocol === 'http:' || protocol === 'https:';
}

export function normalizeLocationUrl(input: string): string | null {
  const candidate = extractUrlCandidate(input);
  if (!candidate) return null;

  const normalized = ensureHttpProtocol(candidate);
  if (!isSafeHttpUrl(normalized)) return null;

  const parsed = toUrl(normalized);
  return parsed ? parsed.toString() : null;
}

export function detectGoogleMapsUrl(rawUrl: string): boolean {
  const parsed = toUrl(rawUrl);
  if (!parsed) return false;

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  if (hostname === 'maps.app.goo.gl') {
    return true;
  }

  if (
    hostname === 'maps.google.com' ||
    hostname.startsWith('maps.google.') ||
    hostname.includes('.maps.google.')
  ) {
    return true;
  }

  const isGoogleDomain =
    hostname === 'google.com' ||
    hostname.startsWith('google.') ||
    hostname.startsWith('www.google.') ||
    hostname.includes('.google.');

  return isGoogleDomain && pathname.startsWith('/maps');
}

export function parseLocationLink(raw: string): ParsedLocationLink {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      raw,
      trimmed,
      displayText: raw,
      url: null,
      kind: 'plain_text',
      isClickable: false,
    };
  }

  const normalizedUrl = normalizeLocationUrl(trimmed);
  if (!normalizedUrl) {
    return {
      raw,
      trimmed,
      displayText: trimmed,
      url: null,
      kind: 'plain_text',
      isClickable: false,
    };
  }

  const kind: LocationLinkKind = detectGoogleMapsUrl(normalizedUrl)
    ? 'google_maps_url'
    : 'url';
  const displayText =
    kind === 'google_maps_url' ? 'Google Maps' : getDisplayHost(normalizedUrl);

  return {
    raw,
    trimmed,
    displayText,
    url: normalizedUrl,
    kind,
    isClickable: true,
  };
}

export function openLocationLink(parsedLink: ParsedLocationLink): boolean {
  if (!parsedLink.isClickable || !parsedLink.url) {
    return false;
  }

  try {
    if (openLink.isAvailable()) {
      if (parsedLink.kind === 'google_maps_url') {
        openLink(parsedLink.url, { tryBrowser: 'chrome' });
      } else {
        openLink(parsedLink.url);
      }
      return true;
    }
  } catch {
    // Fallback below for environments where SDK call can fail.
  }

  if (typeof window === 'undefined') {
    return false;
  }

  const opened = window.open(parsedLink.url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.href = parsedLink.url;
  }

  return true;
}
