import {
  createCompetitor as createCompetitorApi,
  deleteCompetitor as deleteCompetitorApi,
  listCompetitors,
  updateCompetitor as updateCompetitorApi,
} from '../lib/api';
import { Competitor } from '../lib/types';
import { useEntityCRUD } from './useEntityCRUD';

export type CreateCompetitorInput = Partial<Competitor>;
export type UpdateCompetitorInput = Partial<Competitor>;

/**
 * Hook personnalisé pour gérer les concurrents.
 */
export function useCompetitors() {
  const { items: competitors, loading, error, load, create, update, remove } = useEntityCRUD<Competitor, [string]>({
    entityName: 'concurrents',
    listFn: listCompetitors,
    createFn: createCompetitorApi,
    updateFn: updateCompetitorApi,
    deleteFn: deleteCompetitorApi,
  });

  return {
    competitors,
    loading,
    error,
    loadCompetitors: load,
    createCompetitor: create,
    updateCompetitor: update,
    deleteCompetitor: remove,
  };
}
