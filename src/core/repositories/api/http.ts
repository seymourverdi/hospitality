// src/core/repositories/api/http.ts
export type ApiClientOptions = {
  baseUrl?: string; // default: ""
  getToken?: () => string | null; // Bearer token
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export class ApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;

  constructor(opts?: ApiClientOptions) {
    this.baseUrl = opts?.baseUrl ?? "";
    this.getToken = opts?.getToken;
  }

  private buildHeaders(extra?: Record<string, string>) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...extra,
    };

    const token = this.getToken?.();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: "GET",
      headers: this.buildHeaders(),
    });

    return this.parse<T>(res);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: "POST",
      headers: this.buildHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return this.parse<T>(res);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return this.parse<T>(res);
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(this.baseUrl + path, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });

    return this.parse<T>(res);
  }

  private async parse<T>(res: Response): Promise<T> {
    const text = await res.text();
    const payload = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      const message =
        (payload && typeof payload === "object" && "error" in payload && typeof (payload as any).error === "string"
          ? (payload as any).error
          : `HTTP ${res.status}`);

      throw new ApiError(message, res.status, payload);
    }

    return payload as T;
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}