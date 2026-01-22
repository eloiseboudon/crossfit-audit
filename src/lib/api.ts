import {
  Audit,
  Answer,
  Gym,
  MarketBenchmark,
  MarketZone,
  Competitor,
  GymOffer,
  KPI,
  Score,
  Recommendation,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || response.statusText;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function listGyms(): Promise<Gym[]> {
  return apiRequest<Gym[]>('/gyms');
}

export async function getGym(gymId: string): Promise<Gym> {
  return apiRequest<Gym>(`/gyms/${gymId}`);
}

export async function createGym(payload: Partial<Gym>): Promise<Gym> {
  return apiRequest<Gym>('/gyms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateGym(gymId: string, payload: Partial<Gym>): Promise<Gym> {
  return apiRequest<Gym>(`/gyms/${gymId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteGym(gymId: string): Promise<void> {
  await apiRequest(`/gyms/${gymId}`, { method: 'DELETE' });
}

export async function listAudits(includeGym = false): Promise<Audit[]> {
  const query = includeGym ? '?include_gym=1' : '';
  return apiRequest<Audit[]>(`/audits${query}`);
}

export async function getAudit(auditId: string, includeGym = false): Promise<Audit> {
  const query = includeGym ? '?include_gym=1' : '';
  return apiRequest<Audit>(`/audits/${auditId}${query}`);
}

export async function createAudit(payload: Partial<Audit>): Promise<Audit> {
  return apiRequest<Audit>('/audits', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAudit(auditId: string, payload: Partial<Audit>): Promise<Audit> {
  return apiRequest<Audit>(`/audits/${auditId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteAudit(auditId: string): Promise<void> {
  await apiRequest(`/audits/${auditId}`, { method: 'DELETE' });
}

export async function listAnswers(auditId: string): Promise<Answer[]> {
  return apiRequest<Answer[]>(`/answers?audit_id=${encodeURIComponent(auditId)}`);
}

export async function upsertAnswer(record: Partial<Answer>): Promise<void> {
  await apiRequest('/answers', {
    method: 'POST',
    body: JSON.stringify({ record }),
  });
}

export async function upsertAnswers(records: Partial<Answer>[]): Promise<void> {
  await apiRequest('/answers', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
}

export async function listMarketBenchmarks(): Promise<MarketBenchmark[]> {
  return apiRequest<MarketBenchmark[]>('/market-benchmarks');
}

export async function updateMarketBenchmark(benchmarkId: string, payload: Partial<MarketBenchmark>): Promise<MarketBenchmark> {
  return apiRequest<MarketBenchmark>(`/market-benchmarks/${benchmarkId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function listMarketZones(): Promise<MarketZone[]> {
  return apiRequest<MarketZone[]>('/market-zones');
}

export async function createMarketZone(payload: Partial<MarketZone>): Promise<MarketZone> {
  return apiRequest<MarketZone>('/market-zones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMarketZone(zoneId: string, payload: Partial<MarketZone>): Promise<MarketZone> {
  return apiRequest<MarketZone>(`/market-zones/${zoneId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteMarketZone(zoneId: string): Promise<void> {
  await apiRequest(`/market-zones/${zoneId}`, { method: 'DELETE' });
}

export async function listCompetitors(gymId: string): Promise<Competitor[]> {
  return apiRequest<Competitor[]>(`/competitors?gym_id=${encodeURIComponent(gymId)}`);
}

export async function createCompetitor(payload: Partial<Competitor>): Promise<Competitor> {
  return apiRequest<Competitor>('/competitors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCompetitor(competitorId: string, payload: Partial<Competitor>): Promise<Competitor> {
  return apiRequest<Competitor>(`/competitors/${competitorId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteCompetitor(competitorId: string): Promise<void> {
  await apiRequest(`/competitors/${competitorId}`, { method: 'DELETE' });
}

export async function listGymOffers(gymId: string): Promise<GymOffer[]> {
  return apiRequest<GymOffer[]>(`/gym-offers?gym_id=${encodeURIComponent(gymId)}`);
}

export async function createGymOffer(payload: Partial<GymOffer>): Promise<GymOffer> {
  return apiRequest<GymOffer>('/gym-offers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateGymOffer(offerId: string, payload: Partial<GymOffer>): Promise<GymOffer> {
  return apiRequest<GymOffer>(`/gym-offers/${offerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteGymOffer(offerId: string): Promise<void> {
  await apiRequest(`/gym-offers/${offerId}`, { method: 'DELETE' });
}

export async function upsertKpis(records: Partial<KPI>[]): Promise<void> {
  await apiRequest('/kpis/upsert', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
}

export async function upsertScores(records: Partial<Score>[]): Promise<void> {
  await apiRequest('/scores/upsert', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
}

export async function replaceRecommendations(auditId: string, records: Partial<Recommendation>[]): Promise<void> {
  await apiRequest('/recommendations/replace', {
    method: 'POST',
    body: JSON.stringify({ audit_id: auditId, records }),
  });
}
