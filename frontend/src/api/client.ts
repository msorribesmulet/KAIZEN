const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const CSRF_COOKIE = import.meta.env.VITE_CSRF_COOKIE ?? 'kaizen_csrf';
const CSRF_HEADER = 'X-CSRF-Token';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function readCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]*)`));
  const value = match?.[1];

  return value === undefined ? null : decodeURIComponent(value);
}

function readDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const first: unknown = detail[0];
    if (first !== null && typeof first === 'object' && 'msg' in first) {
      return String((first as { msg: unknown }).msg);
    }
  }

  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const csrf = readCsrfToken();
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(csrf !== null && { [CSRF_HEADER]: csrf }),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = ((await response.json()) as { detail?: unknown }).detail;
    } catch {
      detail = undefined;
    }

    if (response.status === 401) onUnauthorized?.();

    throw new ApiError(response.status, readDetail(detail, `Error ${response.status}`));
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
