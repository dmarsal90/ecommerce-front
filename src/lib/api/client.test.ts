import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, createApiClient } from './client';

const schema = z.object({ id: z.number() });
const respond = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('createApiClient', () => {
  it('returns data validated by the schema', async () => {
    const client = createApiClient('http://api.test', respond({ id: 1 }));
    await expect(client.get('/products/1', schema)).resolves.toEqual({ id: 1 });
  });

  it('throws ApiError on a non-2xx response', async () => {
    const client = createApiClient('http://api.test', respond({}, 404));
    await expect(client.get('/missing', schema)).rejects.toMatchObject({ status: 404 });
    await expect(client.get('/missing', schema)).rejects.toBeInstanceOf(ApiError);
  });

  it('rejects a response that does not match the schema', async () => {
    const client = createApiClient('http://api.test', respond({ id: 'x' }));
    await expect(client.get('/products/1', schema)).rejects.toThrow();
  });

  it('keeps the validation errors of a 422 so forms can show them per field', async () => {
    const body = { message: 'invalid', errors: { email: ['Taken'] } };
    const client = createApiClient('http://api.test', respond(body, 422));
    await expect(client.post('/register', schema, { email: 'a' })).rejects.toMatchObject({
      status: 422,
      fields: { email: ['Taken'] },
    });
  });

  it('sends the body as JSON', async () => {
    const fetchImpl = respond({ id: 1 });
    await createApiClient('http://api.test', fetchImpl).post('/login', schema, { email: 'a' });
    const init = fetchImpl.mock.calls[0][1];
    expect(init).toMatchObject({ method: 'POST', body: '{"email":"a"}' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });
});
