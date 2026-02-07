import {
  createMarketZone as createMarketZoneApi,
  deleteMarketZone as deleteMarketZoneApi,
  listMarketZones,
  updateMarketZone as updateMarketZoneApi,
} from '../lib/api';
import { MarketZone } from '../lib/types';
import { useEntityCRUD } from './useEntityCRUD';

export type CreateMarketZoneInput = Partial<MarketZone>;
export type UpdateMarketZoneInput = Partial<MarketZone>;

/**
 * Hook personnalisé pour gérer les zones de marché.
 */
export function useMarketZones() {
  const { items: zones, loading, error, load, create, update, remove } = useEntityCRUD<MarketZone>({
    entityName: 'zones de marché',
    listFn: listMarketZones,
    createFn: createMarketZoneApi,
    updateFn: updateMarketZoneApi,
    deleteFn: deleteMarketZoneApi,
  });

  return {
    zones,
    loading,
    error,
    loadMarketZones: load,
    createMarketZone: create,
    updateMarketZone: update,
    deleteMarketZone: remove,
  };
}
