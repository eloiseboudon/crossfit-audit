import {
  createGymOffer as createGymOfferApi,
  deleteGymOffer as deleteGymOfferApi,
  listGymOffers,
  updateGymOffer as updateGymOfferApi,
} from '../lib/api';
import { GymOffer } from '../lib/types';
import { useEntityCRUD } from './useEntityCRUD';

export type CreateGymOfferInput = Partial<GymOffer>;
export type UpdateGymOfferInput = Partial<GymOffer>;

/**
 * Hook personnalisé pour gérer les offres des salles.
 */
export function useGymOffers() {
  const { items: offers, loading, error, load, create, update, remove } = useEntityCRUD<GymOffer, [string]>({
    entityName: 'offres',
    listFn: listGymOffers,
    createFn: createGymOfferApi,
    updateFn: updateGymOfferApi,
    deleteFn: deleteGymOfferApi,
  });

  return {
    offers,
    loading,
    error,
    loadGymOffers: load,
    createGymOffer: create,
    updateGymOffer: update,
    deleteGymOffer: remove,
  };
}
