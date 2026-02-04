import { useCallback, useState } from 'react';
import { createGym as createGymApi, deleteGym as deleteGymApi, listGyms, updateGym as updateGymApi } from '../lib/api';
import { Gym } from '../lib/types';

export type CreateGymInput = Partial<Gym>;
export type UpdateGymInput = Partial<Gym>;

/**
 * Hook personnalisé pour gérer les salles.
 */
export function useGyms() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGyms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listGyms();
      setGyms(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des salles.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGym = useCallback(async (data: CreateGymInput) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createGymApi(data);
      setGyms((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la salle.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGym = useCallback(async (gymId: string, data: UpdateGymInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateGymApi(gymId, data);
      setGyms((prev) => prev.map((gym) => (gym.id === gymId ? updated : gym)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la salle.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGym = useCallback(async (gymId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteGymApi(gymId);
      setGyms((prev) => prev.filter((gym) => gym.id !== gymId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression de la salle.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { gyms, loading, error, loadGyms, createGym, updateGym, deleteGym };
}
