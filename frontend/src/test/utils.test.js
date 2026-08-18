import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatIDR, formatDateID, getMarginBadge } from '../utils/formatters';
import { getToken, setToken, getUser, setUser, logout, apiFetch } from '../utils/api';

describe('formatters.js utilities', () => {
  it('formatIDR correctly formats currencies', () => {
    expect(formatIDR(15000000)).toContain('15.000.000');
    expect(formatIDR(0, false)).toContain('0');
    expect(formatIDR(null)).toContain('0');
    expect(formatIDR(undefined)).toContain('0');
    expect(formatIDR('invalid')).toContain('0');
  });

  it('formatDateID correctly formats date strings', () => {
    expect(formatDateID('2025-01-15')).toContain('15');
    expect(formatDateID('2025-01-15T00:00:00Z')).toContain('15');
    expect(formatDateID(null)).toBe('-');
    expect(formatDateID('')).toBe('-');
  });

  it('getMarginBadge returns correct styling and text for Low, Mid, High tiers', () => {
    expect(getMarginBadge('Low').text).toBe('Low');
    expect(getMarginBadge('Mid').text).toBe('Mid');
    expect(getMarginBadge('High').text).toBe('High');
  });
});

describe('api.js authentication & fetch utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('setToken & getToken works with localStorage', () => {
    expect(getToken()).toBeNull();
    setToken('dummy_jwt_token');
    expect(getToken()).toBe('dummy_jwt_token');
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it('setUser & getUser works with JSON parsing', () => {
    expect(getUser()).toBeNull();
    const userObj = { id: 1, username: 'admin', role: 'Manager' };
    setUser(userObj);
    expect(getUser()).toEqual(userObj);

    localStorage.setItem('user', 'invalid_json');
    expect(getUser()).toBeNull();

    setUser(null);
    expect(getUser()).toBeNull();
  });

  it('apiFetch injects Authorization header when token present', async () => {
    setToken('test_token_123');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    const res = await apiFetch('/employees');
    expect(global.fetch).toHaveBeenCalledWith('/api/employees', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer test_token_123',
        'Content-Type': 'application/json',
      }),
    }));
    expect(res.success).toBe(true);
  });

  it('apiFetch throws error on non-ok HTTP response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request' }),
    });

    await expect(apiFetch('/employees')).rejects.toThrow('Bad Request');
  });
});
