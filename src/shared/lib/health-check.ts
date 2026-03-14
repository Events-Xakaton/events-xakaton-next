/**
 * Health check utilities for detecting backend availability
 */

const HEALTH_CHECK_TIMEOUT_MS = 3_000;

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getBackendErrorMessage(): string {
  return 'Backend не запущен. Выполните: ./scripts/dev-up.sh';
}
