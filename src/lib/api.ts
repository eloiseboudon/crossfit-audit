import {
  Answer,
  Audit,
  Competitor,
  Gym,
  GymOffer,
  KPI,
  DataTableData,
  DataTableSummary,
  MarketBenchmark,
  MarketZone,
  Recommendation,
  Score,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
const AUTH_STORAGE_KEY = 'crossfit_audit_auth';

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  count?: number;
};

/**
 * Lit le token d'authentification depuis le localStorage.
 *
 * @returns Le token JWT ou null si indisponible.
 */
const readAuthToken = (): string | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
};

/**
 * Expose le token d'authentification actuellement stocké.
 *
 * @returns Le token JWT ou null.
 */
export const getAuthToken = (): string | null => readAuthToken();

/**
 * Normalise une valeur hétérogène en booléen.
 *
 * @param value - Valeur potentiellement booléenne/numérique/chaîne.
 * @returns True si la valeur représente un vrai.
 */
const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
};

/**
 * Effectue une requête HTTP vers l'API backend.
 *
 * @param path - Chemin d'API relatif.
 * @param options - Options fetch (méthode, body, headers).
 * @returns Promesse résolue avec le payload typé.
 * @throws {Error} Si la réponse HTTP est en erreur.
 */
type RequestOptions = RequestInit & {
  requireAuth?: boolean;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { requireAuth = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = readAuthToken();
  if (requireAuth) {
    if (!token) {
      throw new Error('Authentification requise');
    }
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } else if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText;
    throw new Error(message);
  }

  return payload as T;
};

/**
 * Récupère toutes les salles accessibles.
 *
 * @returns Promesse résolue avec la liste des salles.
 * @throws {Error} Si l'API retourne une erreur.
 *
 * @example
 * ```ts
 * const gyms = await listGyms();
 * ```
 */
export async function listGyms(): Promise<Gym[]> {
  const payload = await request<ApiResponse<Gym[]>>('/gyms');
  return payload.data ?? [];
}

/**
 * Récupère une salle par identifiant.
 *
 * @param gymId - Identifiant de la salle.
 * @returns Promesse résolue avec la salle.
 * @throws {Error} Si la salle est introuvable ou l'API échoue.
 */
export async function getGym(gymId: string): Promise<Gym> {
  const payload = await request<ApiResponse<Gym>>(`/gyms/${gymId}`);
  if (!payload.data) {
    throw new Error('Gym not found');
  }
  return payload.data;
}

/**
 * Crée une nouvelle salle.
 *
 * @param payload - Données de la salle.
 * @returns Promesse résolue avec la salle créée.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function createGym(payload: Partial<Gym>): Promise<Gym> {
  const response = await request<ApiResponse<Gym>>('/gyms', {
    method: 'POST',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Gym not created');
  }
  return response.data;
}

/**
 * Met à jour une salle existante.
 *
 * @param gymId - Identifiant de la salle.
 * @param payload - Données à mettre à jour.
 * @returns Promesse résolue avec la salle mise à jour.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function updateGym(gymId: string, payload: Partial<Gym>): Promise<Gym> {
  const response = await request<ApiResponse<Gym>>(`/gyms/${gymId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Gym not updated');
  }
  return response.data;
}

/**
 * Supprime une salle.
 *
 * @param gymId - Identifiant de la salle.
 * @returns Promesse résolue une fois la suppression effectuée.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function deleteGym(gymId: string): Promise<void> {
  await request(`/gyms/${gymId}`, { method: 'DELETE', requireAuth: true });
}

/**
 * Liste les audits et, optionnellement, hydrate la salle associée.
 *
 * @param includeGym - True pour enrichir chaque audit avec la salle.
 * @returns Promesse résolue avec la liste des audits.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function listAudits(includeGym = false): Promise<Audit[]> {
  const payload = await request<ApiResponse<Audit[]>>('/audits');
  const audits = payload.data ?? [];

  if (!includeGym) {
    return audits;
  }

  const gyms = await listGyms();
  return audits.map((audit) => ({
    ...audit,
    gym: gyms.find((gym) => gym.id === audit.gym_id),
  }));
}

/**
 * Récupère un audit par identifiant.
 *
 * @param auditId - Identifiant de l'audit.
 * @param includeGym - True pour enrichir avec les détails de la salle.
 * @returns Promesse résolue avec l'audit.
 * @throws {Error} Si l'audit est introuvable ou l'API échoue.
 */
export async function getAudit(auditId: string, includeGym = false): Promise<Audit> {
  const payload = await request<ApiResponse<Audit>>(`/audits/${auditId}`);
  if (!payload.data) {
    throw new Error('Audit not found');
  }

  if (!includeGym) {
    return payload.data;
  }

  const gyms = await listGyms();
  return {
    ...payload.data,
    gym: gyms.find((gym) => gym.id === payload.data?.gym_id),
  };
}

/**
 * Crée un nouvel audit pour une salle.
 *
 * @param payload - Données de l'audit.
 * @returns Promesse résolue avec l'audit créé.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function createAudit(payload: Partial<Audit>): Promise<Audit> {
  const response = await request<ApiResponse<Audit>>('/audits', {
    method: 'POST',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Audit not created');
  }
  return response.data;
}

/**
 * Met à jour un audit existant.
 *
 * @param auditId - Identifiant de l'audit.
 * @param payload - Données à mettre à jour.
 * @returns Promesse résolue avec l'audit mis à jour.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function updateAudit(auditId: string, payload: Partial<Audit>): Promise<Audit> {
  const response = await request<ApiResponse<Audit>>(`/audits/${auditId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Audit not updated');
  }
  return response.data;
}

/**
 * Supprime un audit.
 *
 * @param auditId - Identifiant de l'audit.
 * @returns Promesse résolue une fois la suppression effectuée.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function deleteAudit(auditId: string): Promise<void> {
  await request(`/audits/${auditId}`, { method: 'DELETE', requireAuth: true });
}

/**
 * Récupère les réponses d'un audit.
 *
 * @param auditId - Identifiant de l'audit.
 * @returns Promesse résolue avec la liste des réponses.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function listAnswers(auditId: string): Promise<Answer[]> {
  const payload = await request<ApiResponse<Answer[]>>(`/audits/${auditId}/answers`);
  return payload.data ?? [];
}

/**
 * Enregistre une réponse unique (upsert).
 *
 * @param record - Réponse à sauvegarder.
 * @returns Promesse résolue une fois l'enregistrement effectué.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function upsertAnswer(record: Partial<Answer>): Promise<void> {
  await upsertAnswers([record]);
}

/**
 * Enregistre un lot de réponses (upsert).
 *
 * @param records - Tableau de réponses.
 * @returns Promesse résolue une fois l'enregistrement effectué.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function upsertAnswers(records: Partial<Answer>[]): Promise<void> {
  const answers = records.filter((record) => record.audit_id && record.block_code && record.question_code);
  if (answers.length === 0) return;

  const auditId = answers[0].audit_id as string;
  await request(`/audits/${auditId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
    requireAuth: true,
  });
}

/**
 * Récupère les benchmarks de marché.
 *
 * @returns Promesse résolue avec la liste des benchmarks.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function listMarketBenchmarks(): Promise<MarketBenchmark[]> {
  const payload = await request<ApiResponse<MarketBenchmark[]>>('/market-benchmarks');
  return payload.data ?? [];
}

/**
 * Met à jour un benchmark de marché.
 *
 * @param benchmarkId - Identifiant du benchmark.
 * @param payload - Données à mettre à jour.
 * @returns Promesse résolue avec le benchmark mis à jour.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function updateMarketBenchmark(
  benchmarkId: string,
  payload: Partial<MarketBenchmark>,
): Promise<MarketBenchmark> {
  const response = await request<ApiResponse<MarketBenchmark>>(`/market-benchmarks/${benchmarkId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Benchmark not updated');
  }
  return response.data;
}

/**
 * Liste les zones de marché actives.
 *
 * @returns Promesse résolue avec la liste des zones.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function listMarketZones(): Promise<MarketZone[]> {
  const payload = await request<ApiResponse<MarketZone[]>>('/market-zones');
  return (payload.data ?? []).map((zone) => ({
    ...zone,
    is_active: toBoolean(zone.is_active),
  }));
}

/**
 * Crée une zone de marché.
 *
 * @param payload - Données de la zone.
 * @returns Promesse résolue avec la zone créée.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function createMarketZone(payload: Partial<MarketZone>): Promise<MarketZone> {
  const response = await request<ApiResponse<MarketZone>>('/market-zones', {
    method: 'POST',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Zone not created');
  }
  return {
    ...response.data,
    is_active: toBoolean(response.data.is_active),
  };
}

/**
 * Met à jour une zone de marché.
 *
 * @param zoneId - Identifiant de la zone.
 * @param payload - Données à mettre à jour.
 * @returns Promesse résolue avec la zone mise à jour.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function updateMarketZone(zoneId: string, payload: Partial<MarketZone>): Promise<MarketZone> {
  const response = await request<ApiResponse<MarketZone>>(`/market-zones/${zoneId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Zone not updated');
  }
  return {
    ...response.data,
    is_active: toBoolean(response.data.is_active),
  };
}

/**
 * Supprime une zone de marché.
 *
 * @param zoneId - Identifiant de la zone.
 * @returns Promesse résolue une fois la suppression effectuée.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function deleteMarketZone(zoneId: string): Promise<void> {
  await request(`/market-zones/${zoneId}`, { method: 'DELETE', requireAuth: true });
}

/**
 * Récupère les concurrents d'une salle.
 *
 * @param gymId - Identifiant de la salle.
 * @returns Promesse résolue avec la liste des concurrents.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function listCompetitors(gymId: string): Promise<Competitor[]> {
  const payload = await request<ApiResponse<Competitor[]>>(`/competitors?gym_id=${gymId}`);
  return (payload.data ?? []).map((competitor) => ({
    ...competitor,
    has_hyrox: toBoolean(competitor.has_hyrox),
    has_weightlifting: toBoolean(competitor.has_weightlifting),
    has_gymnastics: toBoolean(competitor.has_gymnastics),
    has_childcare: toBoolean(competitor.has_childcare),
    has_nutrition: toBoolean(competitor.has_nutrition),
    is_active: toBoolean(competitor.is_active),
  }));
}

/**
 * Crée un concurrent.
 *
 * @param payload - Données du concurrent.
 * @returns Promesse résolue avec le concurrent créé.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function createCompetitor(payload: Partial<Competitor>): Promise<Competitor> {
  const response = await request<ApiResponse<Competitor>>('/competitors', {
    method: 'POST',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Competitor not created');
  }
  return {
    ...response.data,
    has_hyrox: toBoolean(response.data.has_hyrox),
    has_weightlifting: toBoolean(response.data.has_weightlifting),
    has_gymnastics: toBoolean(response.data.has_gymnastics),
    has_childcare: toBoolean(response.data.has_childcare),
    has_nutrition: toBoolean(response.data.has_nutrition),
    is_active: toBoolean(response.data.is_active),
  };
}

/**
 * Met à jour un concurrent.
 *
 * @param competitorId - Identifiant du concurrent.
 * @param payload - Données à mettre à jour.
 * @returns Promesse résolue avec le concurrent mis à jour.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function updateCompetitor(competitorId: string, payload: Partial<Competitor>): Promise<Competitor> {
  const response = await request<ApiResponse<Competitor>>(`/competitors/${competitorId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Competitor not updated');
  }
  return {
    ...response.data,
    has_hyrox: toBoolean(response.data.has_hyrox),
    has_weightlifting: toBoolean(response.data.has_weightlifting),
    has_gymnastics: toBoolean(response.data.has_gymnastics),
    has_childcare: toBoolean(response.data.has_childcare),
    has_nutrition: toBoolean(response.data.has_nutrition),
    is_active: toBoolean(response.data.is_active),
  };
}

/**
 * Supprime un concurrent.
 *
 * @param competitorId - Identifiant du concurrent.
 * @returns Promesse résolue une fois la suppression effectuée.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function deleteCompetitor(competitorId: string): Promise<void> {
  await request(`/competitors/${competitorId}`, { method: 'DELETE', requireAuth: true });
}

/**
 * Récupère les offres commerciales d'une salle.
 *
 * @param gymId - Identifiant de la salle.
 * @returns Promesse résolue avec la liste des offres.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function listGymOffers(gymId: string): Promise<GymOffer[]> {
  const payload = await request<ApiResponse<GymOffer[]>>(`/gym-offers?gym_id=${gymId}&include_inactive=1`);
  return (payload.data ?? []).map((offer) => ({
    ...offer,
    is_active: toBoolean(offer.is_active),
    is_featured: toBoolean(offer.is_featured),
  }));
}

/**
 * Crée une offre commerciale.
 *
 * @param payload - Données de l'offre.
 * @returns Promesse résolue avec l'offre créée.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function createGymOffer(payload: Partial<GymOffer>): Promise<GymOffer> {
  const response = await request<ApiResponse<GymOffer>>('/gym-offers', {
    method: 'POST',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Offer not created');
  }
  return {
    ...response.data,
    is_active: toBoolean(response.data.is_active),
    is_featured: toBoolean(response.data.is_featured),
  };
}

/**
 * Met à jour une offre commerciale.
 *
 * @param offerId - Identifiant de l'offre.
 * @param payload - Données à mettre à jour.
 * @returns Promesse résolue avec l'offre mise à jour.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function updateGymOffer(offerId: string, payload: Partial<GymOffer>): Promise<GymOffer> {
  const response = await request<ApiResponse<GymOffer>>(`/gym-offers/${offerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  if (!response.data) {
    throw new Error('Offer not updated');
  }
  return {
    ...response.data,
    is_active: toBoolean(response.data.is_active),
    is_featured: toBoolean(response.data.is_featured),
  };
}

/**
 * Supprime une offre commerciale.
 *
 * @param offerId - Identifiant de l'offre.
 * @returns Promesse résolue une fois la suppression effectuée.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function deleteGymOffer(offerId: string): Promise<void> {
  await request(`/gym-offers/${offerId}`, { method: 'DELETE', requireAuth: true });
}

/**
 * Enregistre un lot de KPIs regroupés par audit.
 *
 * @param records - Tableau de KPIs.
 * @returns Promesse résolue une fois l'enregistrement effectué.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function upsertKpis(records: Partial<KPI>[]): Promise<void> {
  const grouped = records.reduce<Record<string, Partial<KPI>[]>>((acc, record) => {
    if (!record.audit_id || !record.kpi_code) return acc;
    acc[record.audit_id] = acc[record.audit_id] || [];
    acc[record.audit_id].push(record);
    return acc;
  }, {});

  await Promise.all(
    Object.entries(grouped).map(([auditId, kpis]) =>
      request(`/audits/${auditId}/kpis`, {
        method: 'POST',
        body: JSON.stringify({ kpis }),
        requireAuth: true,
      }),
    ),
  );
}

/**
 * Enregistre un lot de scores regroupés par audit.
 *
 * @param records - Tableau de scores.
 * @returns Promesse résolue une fois l'enregistrement effectué.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function upsertScores(records: Partial<Score>[]): Promise<void> {
  const grouped = records.reduce<Record<string, Partial<Score>[]>>((acc, record) => {
    if (!record.audit_id || !record.pillar_code) return acc;
    acc[record.audit_id] = acc[record.audit_id] || [];
    acc[record.audit_id].push(record);
    return acc;
  }, {});

  await Promise.all(
    Object.entries(grouped).map(([auditId, scores]) =>
      request(`/audits/${auditId}/scores`, {
        method: 'POST',
        body: JSON.stringify({ scores }),
        requireAuth: true,
      }),
    ),
  );
}

/**
 * Remplace les recommandations d'un audit.
 *
 * @param auditId - Identifiant de l'audit.
 * @param records - Tableau de recommandations.
 * @returns Promesse résolue une fois l'enregistrement effectué.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function replaceRecommendations(auditId: string, records: Partial<Recommendation>[]): Promise<void> {
  const recommendations = records.map((record) => ({
    ...record,
    audit_id: record.audit_id || auditId,
  }));

  await request(`/audits/${auditId}/recommendations`, {
    method: 'POST',
    body: JSON.stringify({ recommendations }),
    requireAuth: true,
  });
}

/**
 * Liste les tables de données disponibles.
 *
 * @returns Promesse résolue avec la liste des tables.
 * @throws {Error} Si l'API retourne une erreur.
 */
export async function listDataTables(): Promise<DataTableSummary[]> {
  const payload = await request<ApiResponse<DataTableSummary[]>>('/data-tables');
  return payload.data ?? [];
}

/**
 * Récupère les données d'une table.
 *
 * @param name - Nom de la table.
 * @returns Promesse résolue avec les données de la table.
 * @throws {Error} Si la table est introuvable ou l'API échoue.
 */
export async function getDataTable(name: string): Promise<DataTableData> {
  const payload = await request<ApiResponse<DataTableData>>(`/data-tables/${encodeURIComponent(name)}`);
  if (!payload.data) {
    throw new Error('Table not found');
  }
  return payload.data;
}
