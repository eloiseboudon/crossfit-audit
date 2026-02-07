import { createAudit as createAuditApi, deleteAudit as deleteAuditApi, listAudits, updateAudit as updateAuditApi } from '../lib/api';
import { Audit } from '../lib/types';
import { useEntityCRUD } from './useEntityCRUD';

export type CreateAuditInput = Partial<Audit>;
export type UpdateAuditInput = Partial<Audit>;

/**
 * Hook personnalisé pour gérer les audits.
 */
export function useAudits() {
  const { items: audits, loading, error, load, create, update, remove } = useEntityCRUD<Audit, [boolean?]>({
    entityName: 'audits',
    listFn: listAudits,
    createFn: createAuditApi,
    updateFn: updateAuditApi,
    deleteFn: deleteAuditApi,
  });

  return {
    audits,
    loading,
    error,
    loadAudits: load,
    createAudit: create,
    updateAudit: update,
    deleteAudit: remove,
  };
}
