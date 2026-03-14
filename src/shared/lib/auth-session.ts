import {
  deleteCloudStorageItem,
  getCloudStorageItem,
  setCloudStorageItem,
} from '@telegram-apps/sdk';

const AUTH_SESSION_KEY = 'tribe_auth_v1';
const AUTH_TTL_MS = 6 * 60 * 60 * 1000; // 6 часов

export type StoredAuthSession = {
  reddyUserKey: string;
  verifiedAtMs: number;
};

function serialize(session: StoredAuthSession): string {
  return JSON.stringify(session);
}

function deserialize(raw: string): StoredAuthSession | null {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    const verifiedAtMs = Number(parsed.verifiedAtMs);
    const reddyUserKey =
      typeof parsed.reddyUserKey === 'string' ? parsed.reddyUserKey : '';
    if (!Number.isFinite(verifiedAtMs) || !reddyUserKey) return null;
    if (Date.now() - verifiedAtMs > AUTH_TTL_MS) return null;
    return { reddyUserKey, verifiedAtMs };
  } catch {
    return null;
  }
}

/**
 * Загружает сессию асинхронно.
 * Основное хранилище — Telegram CloudStorage (работает в TMA, привязано к боту).
 * Fallback — localStorage для dev-режима вне Telegram.
 */
export async function loadAuthSession(): Promise<StoredAuthSession | null> {
  if (getCloudStorageItem.isAvailable()) {
    try {
      const raw = await getCloudStorageItem(AUTH_SESSION_KEY);
      if (raw) {
        const session = deserialize(raw);
        if (session) return session;
        // Истёкшая сессия — чистим фоново
        void clearAuthSession();
        return null;
      }
    } catch {
      // CloudStorage недоступен — fallback на localStorage
    }
  }

  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  const session = deserialize(raw);
  if (!session) {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
  return session;
}

/**
 * Сохраняет сессию.
 * Пишет в CloudStorage (не блокируя UI) и в localStorage (dev fallback).
 */
export function saveAuthSession(reddyUserKey: string): void {
  const payload: StoredAuthSession = {
    reddyUserKey,
    verifiedAtMs: Date.now(),
  };
  const serialized = serialize(payload);

  if (setCloudStorageItem.isAvailable()) {
    void setCloudStorageItem(AUTH_SESSION_KEY, serialized);
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_SESSION_KEY, serialized);
  }
}

export function clearAuthSession(): void {
  if (deleteCloudStorageItem.isAvailable()) {
    void deleteCloudStorageItem(AUTH_SESSION_KEY);
  }
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }
}
