import { useCallback, useState } from 'react';

/**
 * Configuration des opérations CRUD pour une entité.
 * Seul `listFn` est obligatoire. Les autres sont optionnels pour les entités en lecture seule.
 */
interface EntityCRUDConfig<T, TLoadArgs extends unknown[] = []> {
  entityName: string;
  listFn: (...args: TLoadArgs) => Promise<T[]>;
  createFn?: (data: Partial<T>) => Promise<T>;
  updateFn?: (id: string, data: Partial<T>) => Promise<T>;
  deleteFn?: (id: string) => Promise<void>;
}

/**
 * Hook générique pour gérer le CRUD d'une entité.
 * Factorise le pattern commun à useGyms, useAudits, useCompetitors, etc.
 */
export function useEntityCRUD<T extends { id: string }, TLoadArgs extends unknown[] = []>(
  config: EntityCRUDConfig<T, TLoadArgs>,
) {
  const { entityName, listFn, createFn, updateFn, deleteFn } = config;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (...args: TLoadArgs) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listFn(...args);
      setItems(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Erreur lors du chargement des ${entityName}.`;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [listFn, entityName]);

  const create = useCallback(async (data: Partial<T>) => {
    if (!createFn) throw new Error(`Création non supportée pour ${entityName}`);
    setLoading(true);
    setError(null);
    try {
      const created = await createFn(data);
      setItems((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Erreur lors de la création.`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createFn, entityName]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    if (!updateFn) throw new Error(`Mise à jour non supportée pour ${entityName}`);
    setLoading(true);
    setError(null);
    try {
      const updated = await updateFn(id, data);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Erreur lors de la mise à jour.`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateFn, entityName]);

  const remove = useCallback(async (id: string) => {
    if (!deleteFn) throw new Error(`Suppression non supportée pour ${entityName}`);
    setLoading(true);
    setError(null);
    try {
      await deleteFn(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : `Erreur lors de la suppression.`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteFn, entityName]);

  return { items, loading, error, load, create, update, remove };
}
