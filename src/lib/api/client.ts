import type { z } from 'zod';

/** Port the features depend on; the fetch-based adapter below is one implementation. */
export interface ApiClient {
  get<S extends z.ZodType>(path: string, schema: S, init?: RequestInit): Promise<z.infer<S>>;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function createApiClient(baseUrl: string, fetchImpl: typeof fetch = fetch): ApiClient {
  return {
    async get(path, schema, init) {
      const response = await fetchImpl(new URL(path, baseUrl), {
        ...init,
        headers: { Accept: 'application/json', ...init?.headers },
      });
      if (!response.ok) throw new ApiError(response.status, `GET ${path} failed with ${response.status}`);
      return schema.parse(await response.json());
    },
  };
}
