import { useCallback, useState } from 'react';
import {
  createCompetitor as createCompetitorApi,
  deleteCompetitor as deleteCompetitorApi,
  listCompetitors,
  updateCompetitor as updateCompetitorApi,
} from '../lib/api';
import { Competitor } from '../lib/types';

export type CreateCompetitorInput = Partial<Competitor>;
export type UpdateCompetitorInput = Partial<Competitor>;

/**
 * Hook personnalisé pour gérer les concurrents.
 */
export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompetitors = useCallback(async (gymId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCompetitors(gymId);
      setCompetitors(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des concurrents.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompetitor = useCallback(async (data: CreateCompetitorInput) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createCompetitorApi(data);
      setCompetitors((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création du concurrent.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompetitor = useCallback(async (competitorId: string, data: UpdateCompetitorInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateCompetitorApi(competitorId, data);
      setCompetitors((prev) =>
        prev.map((competitor) => (competitor.id === competitorId ? updated : competitor)),
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du concurrent.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCompetitor = useCallback(async (competitorId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCompetitorApi(competitorId);
      setCompetitors((prev) => prev.filter((competitor) => competitor.id !== competitorId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression du concurrent.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { competitors, loading, error, loadCompetitors, createCompetitor, updateCompetitor, deleteCompetitor };
}
