import { useCallback, useState } from 'react';
import {
  createGymOffer as createGymOfferApi,
  deleteGymOffer as deleteGymOfferApi,
  listGymOffers,
  updateGymOffer as updateGymOfferApi,
} from '../lib/api';
import { GymOffer } from '../lib/types';

export type CreateGymOfferInput = Partial<GymOffer>;
export type UpdateGymOfferInput = Partial<GymOffer>;

/**
 * Hook personnalisé pour gérer les offres des salles.
 */
export function useGymOffers() {
  const [offers, setOffers] = useState<GymOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGymOffers = useCallback(async (gymId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listGymOffers(gymId);
      setOffers(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des offres.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGymOffer = useCallback(async (data: CreateGymOfferInput) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createGymOfferApi(data);
      setOffers((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création de l'offre.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGymOffer = useCallback(async (offerId: string, data: UpdateGymOfferInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateGymOfferApi(offerId, data);
      setOffers((prev) => prev.map((offer) => (offer.id === offerId ? updated : offer)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'offre.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGymOffer = useCallback(async (offerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteGymOfferApi(offerId);
      setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression de l'offre.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { offers, loading, error, loadGymOffers, createGymOffer, updateGymOffer, deleteGymOffer };
}
