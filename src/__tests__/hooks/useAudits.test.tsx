import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAudits } from '../../hooks/useAudits';
import type { Audit } from '../../lib/types';

vi.mock('../../lib/api', () => ({
  listAudits: vi.fn(),
  createAudit: vi.fn(),
  updateAudit: vi.fn(),
  deleteAudit: vi.fn()
}));

const api = await import('../../lib/api');

const listAudits = api.listAudits as unknown as ReturnType<typeof vi.fn>;
const createAudit = api.createAudit as unknown as ReturnType<typeof vi.fn>;
const updateAudit = api.updateAudit as unknown as ReturnType<typeof vi.fn>;
const deleteAudit = api.deleteAudit as unknown as ReturnType<typeof vi.fn>;

describe('useAudits', () => {
  beforeEach(() => {
    listAudits.mockReset();
    createAudit.mockReset();
    updateAudit.mockReset();
    deleteAudit.mockReset();
  });

  it('charge les audits et met à jour le state', async () => {
    const audits = [{ id: '1', gym_id: 'g1', status: 'draft' } as unknown as Audit];
    listAudits.mockResolvedValue(audits);

    const { result } = renderHook(() => useAudits());

    await act(async () => {
      await result.current.loadAudits();
    });

    expect(result.current.audits).toEqual(audits);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('gère une erreur de chargement', async () => {
    listAudits.mockRejectedValue(new Error('Erreur réseau'));

    const { result } = renderHook(() => useAudits());

    await act(async () => {
      await result.current.loadAudits();
    });

    expect(result.current.error).toBe('Erreur réseau');
    expect(result.current.loading).toBe(false);
  });

  it('ajoute un audit lors de la création', async () => {
    const created = { id: '2', gym_id: 'g1', status: 'draft' } as unknown as Audit;
    createAudit.mockResolvedValue(created);

    const { result } = renderHook(() => useAudits());

    await act(async () => {
      await result.current.createAudit({ gym_id: 'g1' });
    });

    expect(result.current.audits).toEqual([created]);
  });

  it('met à jour un audit existant', async () => {
    const initial = { id: '1', gym_id: 'g1', status: 'draft' } as unknown as Audit;
    const updated = { id: '1', gym_id: 'g1', status: 'completed' } as unknown as Audit;
    createAudit.mockResolvedValue(initial);
    updateAudit.mockResolvedValue(updated);

    const { result } = renderHook(() => useAudits());

    await act(async () => {
      await result.current.createAudit({ gym_id: 'g1' });
    });

    await act(async () => {
      await result.current.updateAudit('1', { status: 'completed' as any });
    });

    expect(result.current.audits).toEqual([updated]);
  });

  it('supprime un audit du state', async () => {
    const initial = { id: '1', gym_id: 'g1', status: 'draft' } as unknown as Audit;
    createAudit.mockResolvedValue(initial);
    deleteAudit.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAudits());

    await act(async () => {
      await result.current.createAudit({ gym_id: 'g1' });
    });

    await act(async () => {
      await result.current.deleteAudit('1');
    });

    expect(result.current.audits).toEqual([]);
  });

  it('propage l\'erreur lors de la création', async () => {
    createAudit.mockRejectedValue(new Error('Création échouée'));

    const { result } = renderHook(() => useAudits());

    await act(async () => {
      await expect(result.current.createAudit({ gym_id: 'g1' })).rejects.toThrow('Création échouée');
    });

    expect(result.current.error).toBe('Création échouée');
  });
});
