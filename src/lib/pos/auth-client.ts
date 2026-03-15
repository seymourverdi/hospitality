export const POS_TOKEN_STORAGE_KEY = "pos_token";

export function getPosToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POS_TOKEN_STORAGE_KEY);
    const token = raw?.trim();
    return token && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

export function setPosToken(token: string): void {
  if (typeof window === "undefined") return;
  const t = token.trim();
  if (!t) return;
  window.localStorage.setItem(POS_TOKEN_STORAGE_KEY, t);
}

export function clearPosToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(POS_TOKEN_STORAGE_KEY);
}

export type ApiErrorShape = {
  error?: unknown;
  message?: unknown;
};

function isApiErrorShape(x: unknown): x is ApiErrorShape {
  return typeof x === "object" && x !== null && ("error" in x || "message" in x);
}

export async function authFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = getPosToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function readJson<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) throw new Error(`Empty response (${res.status})`);

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON (${res.status}): ${text.slice(0, 200)}`);
  }
}

function pickErrorMessage(payload: unknown): string | null {
  if (!isApiErrorShape(payload)) return null;

  const err =
    (typeof payload.error === "string" && payload.error.trim()) ||
    (typeof payload.message === "string" && payload.message.trim());

  return err || null;
}

export async function assertOk<T>(res: Response): Promise<T> {
  if (res.ok) return readJson<T>(res);

  const payload = await readJson<unknown>(res).catch(() => null);
  const msg = pickErrorMessage(payload);

  throw new Error(msg || `Request failed (${res.status} ${res.statusText})`);
}