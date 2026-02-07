import { createGym as createGymApi, deleteGym as deleteGymApi, listGyms, updateGym as updateGymApi } from '../lib/api';
import { Gym } from '../lib/types';
import { useEntityCRUD } from './useEntityCRUD';

export type CreateGymInput = Partial<Gym>;
export type UpdateGymInput = Partial<Gym>;

/**
 * Hook personnalisé pour gérer les salles.
 */
export function useGyms() {
  const { items: gyms, loading, error, load, create, update, remove } = useEntityCRUD<Gym>({
    entityName: 'salles',
    listFn: listGyms,
    createFn: createGymApi,
    updateFn: updateGymApi,
    deleteFn: deleteGymApi,
  });

  return {
    gyms,
    loading,
    error,
    loadGyms: load,
    createGym: create,
    updateGym: update,
    deleteGym: remove,
  };
}
