import { useCallback, useState } from 'react';
import {
  createMarketZone as createMarketZoneApi,
  deleteMarketZone as deleteMarketZoneApi,
  listMarketZones,
  updateMarketZone as updateMarketZoneApi,
} from '../lib/api';
import { MarketZone } from '../lib/types';

export type CreateMarketZoneInput = Partial<MarketZone>;
export type UpdateMarketZoneInput = Partial<MarketZone>;

/**
 * Hook personnalisé pour gérer les zones de marché.
 */
export function useMarketZones() {
  const [zones, setZones] = useState<MarketZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMarketZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMarketZones();
      setZones(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des zones de marché.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMarketZone = useCallback(async (data: CreateMarketZoneInput) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createMarketZoneApi(data);
      setZones((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la zone.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMarketZone = useCallback(async (zoneId: string, data: UpdateMarketZoneInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateMarketZoneApi(zoneId, data);
      setZones((prev) => prev.map((zone) => (zone.id === zoneId ? updated : zone)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la zone.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMarketZone = useCallback(async (zoneId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMarketZoneApi(zoneId);
      setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression de la zone.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { zones, loading, error, loadMarketZones, createMarketZone, updateMarketZone, deleteMarketZone };
}
