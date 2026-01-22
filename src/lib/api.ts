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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5176/api';
const AUTH_STORAGE_KEY = 'crossfit_audit_auth';

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  count?: number;
};

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

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = readAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
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

export async function listGyms(): Promise<Gym[]> {
  const payload = await request<ApiResponse<Gym[]>>('/gyms');
  return payload.data ?? [];
}

export async function getGym(gymId: string): Promise<Gym> {
  const payload = await request<ApiResponse<Gym>>(`/gyms/${gymId}`);
  if (!payload.data) {
    throw new Error('Gym not found');
  }
  return payload.data;
}

export async function createGym(payload: Partial<Gym>): Promise<Gym> {
  const response = await request<ApiResponse<Gym>>('/gyms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.data) {
    throw new Error('Gym not created');
  }
  return response.data;
}

export async function updateGym(gymId: string, payload: Partial<Gym>): Promise<Gym> {
  const response = await request<ApiResponse<Gym>>(`/gyms/${gymId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.data) {
    throw new Error('Gym not updated');
  }
  return response.data;
}

export async function deleteGym(gymId: string): Promise<void> {
  await request(`/gyms/${gymId}`, { method: 'DELETE' });
}

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

export async function createAudit(payload: Partial<Audit>): Promise<Audit> {
  const response = await request<ApiResponse<Audit>>('/audits', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.data) {
    throw new Error('Audit not created');
  }
  return response.data;
}

export async function updateAudit(auditId: string, payload: Partial<Audit>): Promise<Audit> {
  const response = await request<ApiResponse<Audit>>(`/audits/${auditId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.data) {
    throw new Error('Audit not updated');
  }
  return response.data;
}

export async function deleteAudit(auditId: string): Promise<void> {
  await request(`/audits/${auditId}`, { method: 'DELETE' });
}

export async function listAnswers(auditId: string): Promise<Answer[]> {
  const payload = await request<ApiResponse<Answer[]>>(`/audits/${auditId}/answers`);
  return payload.data ?? [];
}

export async function upsertAnswer(record: Partial<Answer>): Promise<void> {
  await upsertAnswers([record]);
}

export async function upsertAnswers(records: Partial<Answer>[]): Promise<void> {
  const answers = records.filter((record) => record.audit_id && record.block_code && record.question_code);
  if (answers.length === 0) return;

  const auditId = answers[0].audit_id as string;
  await request(`/audits/${auditId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function listMarketBenchmarks(): Promise<MarketBenchmark[]> {
  const payload = await request<ApiResponse<MarketBenchmark[]>>('/market-benchmarks');
  return payload.data ?? [];
}

export async function updateMarketBenchmark(
  benchmarkId: string,
  payload: Partial<MarketBenchmark>,
): Promise<MarketBenchmark> {
  const response = await request<ApiResponse<MarketBenchmark>>(`/market-benchmarks/${benchmarkId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.data) {
    throw new Error('Benchmark not updated');
  }
  return response.data;
}

export async function listMarketZones(): Promise<MarketZone[]> {
  const payload = await request<ApiResponse<MarketZone[]>>('/market-zones');
  return (payload.data ?? []).map((zone) => ({
    ...zone,
    is_active: toBoolean(zone.is_active),
  }));
}

export async function createMarketZone(payload: Partial<MarketZone>): Promise<MarketZone> {
  const response = await request<ApiResponse<MarketZone>>('/market-zones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.data) {
    throw new Error('Zone not created');
  }
  return {
    ...response.data,
    is_active: toBoolean(response.data.is_active),
  };
}

export async function updateMarketZone(zoneId: string, payload: Partial<MarketZone>): Promise<MarketZone> {
  const response = await request<ApiResponse<MarketZone>>(`/market-zones/${zoneId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.data) {
    throw new Error('Zone not updated');
  }
  return {
    ...response.data,
    is_active: toBoolean(response.data.is_active),
  };
}

export async function deleteMarketZone(zoneId: string): Promise<void> {
  await request(`/market-zones/${zoneId}`, { method: 'DELETE' });
}

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

export async function createCompetitor(payload: Partial<Competitor>): Promise<Competitor> {
  const response = await request<ApiResponse<Competitor>>('/competitors', {
    method: 'POST',
    body: JSON.stringify(payload),
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

export async function updateCompetitor(competitorId: string, payload: Partial<Competitor>): Promise<Competitor> {
  const response = await request<ApiResponse<Competitor>>(`/competitors/${competitorId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
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

export async function deleteCompetitor(competitorId: string): Promise<void> {
  await request(`/competitors/${competitorId}`, { method: 'DELETE' });
}

export async function listGymOffers(gymId: string): Promise<GymOffer[]> {
  const payload = await request<ApiResponse<GymOffer[]>>(`/gym-offers?gym_id=${gymId}&include_inactive=1`);
  return (payload.data ?? []).map((offer) => ({
    ...offer,
    is_active: toBoolean(offer.is_active),
    is_featured: toBoolean(offer.is_featured),
  }));
}

export async function createGymOffer(payload: Partial<GymOffer>): Promise<GymOffer> {
  const response = await request<ApiResponse<GymOffer>>('/gym-offers', {
    method: 'POST',
    body: JSON.stringify(payload),
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

export async function updateGymOffer(offerId: string, payload: Partial<GymOffer>): Promise<GymOffer> {
  const response = await request<ApiResponse<GymOffer>>(`/gym-offers/${offerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
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

export async function deleteGymOffer(offerId: string): Promise<void> {
  await request(`/gym-offers/${offerId}`, { method: 'DELETE' });
}

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
      }),
    ),
  );
}

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
      }),
    ),
  );
}

export async function replaceRecommendations(auditId: string, records: Partial<Recommendation>[]): Promise<void> {
  const recommendations = records.map((record) => ({
    ...record,
    audit_id: record.audit_id || auditId,
  }));

  await request(`/audits/${auditId}/recommendations`, {
    method: 'POST',
    body: JSON.stringify({ recommendations }),
  });
}
