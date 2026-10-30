import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@/lib/api/client';
import { createAuthApi } from './auth-api';

const user = { id: 1, name: 'Ana', email: 'a@b.co', email_verified_at: null, avatar_url: null };
const respond = (body: unknown) => vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));

describe('auth api', () => {
  it('sends the active language and parses the session', async () => {
    const fetchImpl = respond({ user, token: 't0k' });
    const api = createAuthApi(createApiClient('http://api.test/api/', fetchImpl));
    await expect(api.login('de', { email: 'a@b.co', password: 'x' })).resolves.toMatchObject({
      token: 't0k',
    });
    expect(fetchImpl.mock.calls[0][1].headers).toMatchObject({ 'Accept-Language': 'de' });
  });

  it('authenticates with the bearer token and unwraps the user', async () => {
    const fetchImpl = respond({ user });
    const api = createAuthApi(createApiClient('http://api.test/api/', fetchImpl));
    await expect(api.me('t0k')).resolves.toEqual(user);
    expect(fetchImpl.mock.calls[0][1].headers).toMatchObject({ Authorization: 'Bearer t0k' });
  });
});
