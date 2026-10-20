"use client";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function postJson<T>(url: string, body: unknown, timeoutMs = 70_000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError((data as { error?: string }).error || `Request failed (${res.status})`, res.status);
    return data as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new ApiError("Mademoiselle took too long to answer.", 504);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
