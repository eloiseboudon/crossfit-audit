import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useGymOffers } from '../../hooks/useGymOffers';
import type { GymOffer } from '../../lib/types';

vi.mock('../../lib/api', () => ({
  listGymOffers: vi.fn(),
  createGymOffer: vi.fn(),
  updateGymOffer: vi.fn(),
  deleteGymOffer: vi.fn()
}));

const api = await import('../../lib/api');

const listGymOffers = api.listGymOffers as unknown as ReturnType<typeof vi.fn>;
const createGymOffer = api.createGymOffer as unknown as ReturnType<typeof vi.fn>;
const updateGymOffer = api.updateGymOffer as unknown as ReturnType<typeof vi.fn>;
const deleteGymOffer = api.deleteGymOffer as unknown as ReturnType<typeof vi.fn>;

describe('useGymOffers', () => {
  beforeEach(() => {
    listGymOffers.mockReset();
    createGymOffer.mockReset();
    updateGymOffer.mockReset();
    deleteGymOffer.mockReset();
  });

  it('charge les offres et met à jour le state', async () => {
    const offers = [{ id: '1', gym_id: 'g1', offer_name: 'Offre A' } as GymOffer];
    listGymOffers.mockResolvedValue(offers);

    const { result } = renderHook(() => useGymOffers());

    await act(async () => {
      await result.current.loadGymOffers('g1');
    });

    expect(result.current.offers).toEqual(offers);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('gère une erreur de chargement', async () => {
    listGymOffers.mockRejectedValue(new Error('Boom'));

    const { result } = renderHook(() => useGymOffers());

    await act(async () => {
      await result.current.loadGymOffers('g1');
    });

    expect(result.current.error).toBe('Boom');
    expect(result.current.loading).toBe(false);
  });

  it('ajoute une offre lors de la création', async () => {
    const created = { id: '2', gym_id: 'g1', offer_name: 'Offre B' } as GymOffer;
    createGymOffer.mockResolvedValue(created);

    const { result } = renderHook(() => useGymOffers());

    await act(async () => {
      await result.current.createGymOffer({ gym_id: 'g1', offer_name: 'Offre B' });
    });

    expect(result.current.offers).toEqual([created]);
  });

  it('met à jour une offre existante', async () => {
    const initial = { id: '1', gym_id: 'g1', offer_name: 'Offre A' } as GymOffer;
    const updated = { id: '1', gym_id: 'g1', offer_name: 'Offre A v2' } as GymOffer;
    createGymOffer.mockResolvedValue(initial);
    updateGymOffer.mockResolvedValue(updated);

    const { result } = renderHook(() => useGymOffers());

    await act(async () => {
      await result.current.createGymOffer({ gym_id: 'g1', offer_name: 'Offre A' });
    });

    await act(async () => {
      await result.current.updateGymOffer('1', { offer_name: 'Offre A v2' });
    });

    expect(result.current.offers).toEqual([updated]);
  });

  it('supprime une offre du state', async () => {
    const initial = { id: '1', gym_id: 'g1', offer_name: 'Offre A' } as GymOffer;
    createGymOffer.mockResolvedValue(initial);
    deleteGymOffer.mockResolvedValue(undefined);

    const { result } = renderHook(() => useGymOffers());

    await act(async () => {
      await result.current.createGymOffer({ gym_id: 'g1', offer_name: 'Offre A' });
    });

    await act(async () => {
      await result.current.deleteGymOffer('1');
    });

    expect(result.current.offers).toEqual([]);
  });
});
