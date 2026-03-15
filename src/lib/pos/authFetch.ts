import { getPosToken, clearPosToken } from "./auth-client";

export type ApiOk<T> = { ok: true } & T;
export type ApiErr = { error: string };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

function isApiErr(x: unknown): x is ApiErr {
  return typeof x === "object" && x !== null && "error" in x && typeof (x as any).error === "string";
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function authFetch<T>(
  input: string,
  init?: RequestInit
): Promise<ApiOk<T>> {
  const token = getPosToken();
  const headers = new Headers(init?.headers);

  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  let data: unknown = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    data = text ? { error: text } : null;
  }

  if (!res.ok) {
    const message = isApiErr(data) ? data.error : `Request failed (${res.status})`;
    if (res.status === 401) clearPosToken();
    throw new ApiError(message, res.status);
  }

  if (isApiErr(data)) {
    throw new ApiError(data.error, res.status);
  }

  // expect { ok:true, ... }
  return data as ApiOk<T>;
}
