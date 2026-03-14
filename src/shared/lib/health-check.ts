/**
 * Health check utilities for detecting backend availability
 */

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getBackendErrorMessage(): string {
  return 'Backend не запущен. Выполните: ./scripts/dev-up.sh';
}
