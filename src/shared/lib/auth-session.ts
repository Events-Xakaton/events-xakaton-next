const AUTH_SESSION_KEY = 'tribe_auth_session_v1';
const AUTH_TTL_MS = 6 * 60 * 60 * 1000;

type StoredAuthSession = {
  reddyUserKey: string;
  verifiedAtMs: number;
};

export function saveAuthSession(reddyUserKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const payload: StoredAuthSession = {
    reddyUserKey,
    verifiedAtMs: Date.now(),
  };
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
}

export function loadAuthSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    const verifiedAtMs = Number(parsed.verifiedAtMs);
    const reddyUserKey =
      typeof parsed.reddyUserKey === 'string' ? parsed.reddyUserKey : '';

    if (!Number.isFinite(verifiedAtMs) || !reddyUserKey) {
      clearAuthSession();
      return null;
    }

    if (Date.now() - verifiedAtMs > AUTH_TTL_MS) {
      clearAuthSession();
      return null;
    }

    return {
      reddyUserKey,
      verifiedAtMs,
    };
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}
