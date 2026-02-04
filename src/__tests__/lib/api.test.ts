import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudit, listGyms } from '../../lib/api';

const AUTH_STORAGE_KEY = 'crossfit_audit_auth';

const mockFetchResponse = (payload: unknown) => {
  const text = JSON.stringify(payload);
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    text: vi.fn().mockResolvedValue(text),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('api token handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('does not attach an auth header when the user is not connected', async () => {
    const fetchMock = mockFetchResponse({ data: [] });

    await listGyms();

    const [, options] = fetchMock.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.has('Authorization')).toBe(false);
  });

  it('attaches an auth header when the user is connected', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: 'token-123', user: { id: 'user-1', email: 'test@example.com' } }),
    );
    const fetchMock = mockFetchResponse({ data: [] });

    await listGyms();

    const [, options] = fetchMock.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('blocks auth-required requests when no token is available', async () => {
    vi.stubGlobal('fetch', vi.fn());

    await expect(createAudit({ gym_id: 'gym-1' })).rejects.toThrow('Authentification requise');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends auth header for auth-required requests when token exists', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: 'token-456', user: { id: 'user-2', email: 'user@example.com' } }),
    );
    const fetchMock = mockFetchResponse({ data: { id: 'audit-1' } });

    await createAudit({ gym_id: 'gym-1', status: 'brouillon' });

    const [, options] = fetchMock.mock.calls[0];
    const headers = new Headers(options.headers);
    expect(headers.get('Authorization')).toBe('Bearer token-456');
  });
});
