import { useCallback, useState } from 'react';
import { createAudit as createAuditApi, deleteAudit as deleteAuditApi, listAudits, updateAudit as updateAuditApi } from '../lib/api';
import { Audit } from '../lib/types';

export type CreateAuditInput = Partial<Audit>;
export type UpdateAuditInput = Partial<Audit>;

/**
 * Hook personnalisé pour gérer les audits.
 */
export function useAudits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAudits = useCallback(async (includeGym = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAudits(includeGym);
      setAudits(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des audits.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAudit = useCallback(async (data: CreateAuditInput) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createAuditApi(data);
      setAudits((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création de l'audit.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAudit = useCallback(async (auditId: string, data: UpdateAuditInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateAuditApi(auditId, data);
      setAudits((prev) => prev.map((audit) => (audit.id === auditId ? updated : audit)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'audit.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAudit = useCallback(async (auditId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteAuditApi(auditId);
      setAudits((prev) => prev.filter((audit) => audit.id !== auditId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression de l'audit.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { audits, loading, error, loadAudits, createAudit, updateAudit, deleteAudit };
}
