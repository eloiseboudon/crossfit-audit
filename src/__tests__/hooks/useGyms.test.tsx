import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useGyms } from '../../hooks/useGyms';
import type { Gym } from '../../lib/types';

vi.mock('../../lib/api', () => ({
  listGyms: vi.fn(),
  createGym: vi.fn(),
  updateGym: vi.fn(),
  deleteGym: vi.fn()
}));

const api = await import('../../lib/api');

const listGyms = api.listGyms as unknown as ReturnType<typeof vi.fn>;
const createGym = api.createGym as unknown as ReturnType<typeof vi.fn>;
const updateGym = api.updateGym as unknown as ReturnType<typeof vi.fn>;
const deleteGym = api.deleteGym as unknown as ReturnType<typeof vi.fn>;

describe('useGyms', () => {
  beforeEach(() => {
    listGyms.mockReset();
    createGym.mockReset();
    updateGym.mockReset();
    deleteGym.mockReset();
  });

  it('charge les salles et met à jour le state', async () => {
    const gyms = [{ id: '1', name: 'Gym 1' } as Gym];
    listGyms.mockResolvedValue(gyms);

    const { result } = renderHook(() => useGyms());

    await act(async () => {
      await result.current.loadGyms();
    });

    expect(result.current.gyms).toEqual(gyms);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('gère une erreur de chargement', async () => {
    listGyms.mockRejectedValue(new Error('Boom'));

    const { result } = renderHook(() => useGyms());

    await act(async () => {
      await result.current.loadGyms();
    });

    expect(result.current.error).toBe('Boom');
    expect(result.current.loading).toBe(false);
  });

  it('ajoute une salle lors de la création', async () => {
    const created = { id: '2', name: 'Gym 2' } as Gym;
    createGym.mockResolvedValue(created);

    const { result } = renderHook(() => useGyms());

    await act(async () => {
      await result.current.createGym({ name: 'Gym 2' });
    });

    expect(result.current.gyms).toEqual([created]);
  });

  it('met à jour une salle existante', async () => {
    const initial = { id: '1', name: 'Gym 1' } as Gym;
    const updated = { id: '1', name: 'Gym 1 Updated' } as Gym;
    createGym.mockResolvedValue(initial);
    updateGym.mockResolvedValue(updated);

    const { result } = renderHook(() => useGyms());

    await act(async () => {
      await result.current.createGym({ name: 'Gym 1' });
    });

    await act(async () => {
      await result.current.updateGym('1', { name: 'Gym 1 Updated' });
    });

    expect(result.current.gyms).toEqual([updated]);
  });

  it('supprime une salle du state', async () => {
    const initial = { id: '1', name: 'Gym 1' } as Gym;
    createGym.mockResolvedValue(initial);
    deleteGym.mockResolvedValue(undefined);

    const { result } = renderHook(() => useGyms());

    await act(async () => {
      await result.current.createGym({ name: 'Gym 1' });
    });

    await act(async () => {
      await result.current.deleteGym('1');
    });

    expect(result.current.gyms).toEqual([]);
  });
});
