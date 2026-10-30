import type { z } from 'zod';

/** Port the features depend on; the fetch-based adapter below is one implementation. */
export interface ApiClient {
  get<S extends z.ZodType>(path: string, schema: S, init?: RequestInit): Promise<z.infer<S>>;
  /** A FormData body is sent as multipart; anything else as JSON. */
  post<S extends z.ZodType>(path: string, schema: S, body?: unknown, init?: RequestInit): Promise<z.infer<S>>;
  delete<S extends z.ZodType>(path: string, schema: S, init?: RequestInit): Promise<z.infer<S>>;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Laravel validation errors (422), keyed by field. */
    readonly fields: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export function createApiClient(baseUrl: string, fetchImpl: typeof fetch = fetch): ApiClient {
  async function request<S extends z.ZodType>(
    method: string,
    path: string,
    schema: S,
    init: RequestInit = {},
  ) {
    const response = await fetchImpl(new URL(path, baseUrl), {
      ...init,
      method,
      headers: { Accept: 'application/json', ...init.headers },
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
        errors?: Record<string, string[]>;
      } | null;
      throw new ApiError(
        response.status,
        body?.message ?? `${method} ${path} failed with ${response.status}`,
        body?.errors,
      );
    }
    return schema.parse(await response.json());
  }

  return {
    get: (path, schema, init) => request('GET', path, schema, init),
    post: (path, schema, body, init) =>
      request('POST', path, schema, {
        ...init,
        body:
          body === undefined || body instanceof FormData
            ? (body as FormData | undefined)
            : JSON.stringify(body),
        // fetch sets the multipart boundary itself, so FormData must not get a Content-Type.
        headers: {
          ...(body === undefined || body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...init?.headers,
        },
      }),
    delete: (path, schema, init) => request('DELETE', path, schema, init),
  };
}
