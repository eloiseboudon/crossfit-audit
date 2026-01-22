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

const STORAGE_PREFIX = 'crossfit.audit.';

const DEFAULT_BENCHMARKS: Omit<MarketBenchmark, 'id' | 'updated_at'>[] = [
  {
    benchmark_code: 'arpm_toulouse',
    name: 'ARPM moyen Toulouse',
    value: 85,
    unit: '€',
    description: 'Revenu moyen par membre par mois à Toulouse',
    category: 'pricing',
  },
  {
    benchmark_code: 'churn_target',
    name: 'Taux de churn cible',
    value: 2,
    unit: '%',
    description: 'Taux de churn mensuel cible',
    category: 'retention',
  },
  {
    benchmark_code: 'conversion_target',
    name: 'Taux de conversion cible',
    value: 40,
    unit: '%',
    description: "Taux de conversion essai vers abonnement cible",
    category: 'acquisition',
  },
  {
    benchmark_code: 'loyer_ratio_max',
    name: 'Ratio loyer/CA maximum',
    value: 15,
    unit: '%',
    description: 'Ratio loyer/CA à ne pas dépasser',
    category: 'finance',
  },
  {
    benchmark_code: 'masse_salariale_ratio_max',
    name: 'Ratio masse salariale/CA maximum',
    value: 45,
    unit: '%',
    description: 'Ratio masse salariale/CA à ne pas dépasser',
    category: 'finance',
  },
  {
    benchmark_code: 'ebitda_target',
    name: 'Marge EBITDA cible',
    value: 20,
    unit: '%',
    description: 'Marge EBITDA cible',
    category: 'finance',
  },
  {
    benchmark_code: 'occupation_target',
    name: 'Taux occupation cible',
    value: 70,
    unit: '%',
    description: 'Taux de remplissage des cours cible',
    category: 'exploitation',
  },
  {
    benchmark_code: 'ca_par_m2_target',
    name: 'CA par m² cible',
    value: 300,
    unit: '€',
    description: 'Chiffre affaires par m² cible annuel',
    category: 'exploitation',
  },
];

type StorageKey =
  | 'gyms'
  | 'audits'
  | 'answers'
  | 'market_benchmarks'
  | 'market_zones'
  | 'competitors'
  | 'gym_offers'
  | 'kpis'
  | 'scores'
  | 'recommendations';

function storageKey(key: StorageKey): string {
  return `${STORAGE_PREFIX}${key}`;
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function loadCollection<T>(key: StorageKey, fallback: T[] = []): T[] {
  return safeParse<T[]>(localStorage.getItem(storageKey(key)), fallback);
}

function saveCollection<T>(key: StorageKey, items: T[]): void {
  localStorage.setItem(storageKey(key), JSON.stringify(items));
}

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function ensureBenchmarks(): MarketBenchmark[] {
  const existing = loadCollection<MarketBenchmark>('market_benchmarks');
  if (existing.length > 0) {
    return existing;
  }
  const seeded = DEFAULT_BENCHMARKS.map((benchmark) => ({
    id: generateId(),
    updated_at: nowIso(),
    ...benchmark,
  }));
  saveCollection('market_benchmarks', seeded);
  return seeded;
}

function sortByDateDesc<T extends { created_at?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function sortByDateAsc<T extends { created_at?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
}

function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

function updateById<T extends { id: string }>(items: T[], id: string, update: Partial<T>): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...update } : item));
}

export async function listGyms(): Promise<Gym[]> {
  return sortByDateDesc(loadCollection<Gym>('gyms'));
}

export async function getGym(gymId: string): Promise<Gym> {
  const gym = findById(loadCollection<Gym>('gyms'), gymId);
  if (!gym) {
    throw new Error('Gym not found');
  }
  return gym;
}

export async function createGym(payload: Partial<Gym>): Promise<Gym> {
  const now = nowIso();
  const newGym: Gym = {
    id: generateId(),
    name: payload.name || 'Nouvelle salle',
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
    ...payload,
  };
  const gyms = loadCollection<Gym>('gyms');
  gyms.push(newGym);
  saveCollection('gyms', gyms);
  return newGym;
}

export async function updateGym(gymId: string, payload: Partial<Gym>): Promise<Gym> {
  const gyms = loadCollection<Gym>('gyms');
  const gym = findById(gyms, gymId);
  if (!gym) {
    throw new Error('Gym not found');
  }
  const updated: Gym = {
    ...gym,
    ...payload,
    updated_at: payload.updated_at || nowIso(),
  };
  saveCollection('gyms', updateById(gyms, gymId, updated));
  return updated;
}

export async function deleteGym(gymId: string): Promise<void> {
  const gyms = loadCollection<Gym>('gyms').filter((gym) => gym.id !== gymId);
  saveCollection('gyms', gyms);
}

export async function listAudits(includeGym = false): Promise<Audit[]> {
  const audits = sortByDateDesc(loadCollection<Audit>('audits'));
  if (!includeGym) {
    return audits;
  }
  const gyms = loadCollection<Gym>('gyms');
  return audits.map((audit) => ({
    ...audit,
    gym: gyms.find((gym) => gym.id === audit.gym_id),
  }));
}

export async function getAudit(auditId: string, includeGym = false): Promise<Audit> {
  const audits = loadCollection<Audit>('audits');
  const audit = findById(audits, auditId);
  if (!audit) {
    throw new Error('Audit not found');
  }
  if (!includeGym) {
    return audit;
  }
  const gyms = loadCollection<Gym>('gyms');
  return { ...audit, gym: gyms.find((gym) => gym.id === audit.gym_id) };
}

export async function createAudit(payload: Partial<Audit>): Promise<Audit> {
  const now = nowIso();
  const newAudit: Audit = {
    id: generateId(),
    gym_id: payload.gym_id || '',
    status: payload.status || 'brouillon',
    baseline_period: payload.baseline_period || 'mensuel',
    currency: payload.currency || 'EUR',
    completion_percentage: payload.completion_percentage ?? 0,
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
    ...payload,
  };
  const audits = loadCollection<Audit>('audits');
  audits.push(newAudit);
  saveCollection('audits', audits);
  return newAudit;
}

export async function updateAudit(auditId: string, payload: Partial<Audit>): Promise<Audit> {
  const audits = loadCollection<Audit>('audits');
  const audit = findById(audits, auditId);
  if (!audit) {
    throw new Error('Audit not found');
  }
  const updated: Audit = {
    ...audit,
    ...payload,
    updated_at: payload.updated_at || nowIso(),
  };
  saveCollection('audits', updateById(audits, auditId, updated));
  return updated;
}

export async function deleteAudit(auditId: string): Promise<void> {
  const audits = loadCollection<Audit>('audits').filter((audit) => audit.id !== auditId);
  saveCollection('audits', audits);
}

export async function listAnswers(auditId: string): Promise<Answer[]> {
  const answers = loadCollection<Answer>('answers').filter((answer) => answer.audit_id === auditId);
  return sortByDateAsc(answers);
}

export async function upsertAnswer(record: Partial<Answer>): Promise<void> {
  await upsertAnswers([record]);
}

export async function upsertAnswers(records: Partial<Answer>[]): Promise<void> {
  const answers = loadCollection<Answer>('answers');
  const now = nowIso();
  records.forEach((record) => {
    if (!record.audit_id || !record.block_code || !record.question_code) {
      return;
    }
    const existingIndex = answers.findIndex(
      (answer) =>
        answer.audit_id === record.audit_id &&
        answer.block_code === record.block_code &&
        answer.question_code === record.question_code,
    );
    if (existingIndex >= 0) {
      answers[existingIndex] = {
        ...answers[existingIndex],
        ...record,
        id: answers[existingIndex].id,
        updated_at: record.updated_at || now,
      } as Answer;
    } else {
      answers.push({
        id: record.id || generateId(),
        audit_id: record.audit_id,
        block_code: record.block_code,
        question_code: record.question_code,
        value: record.value,
        created_at: record.created_at || now,
        updated_at: record.updated_at || now,
      } as Answer);
    }
  });
  saveCollection('answers', answers);
}

export async function listMarketBenchmarks(): Promise<MarketBenchmark[]> {
  const benchmarks = ensureBenchmarks();
  return [...benchmarks].sort((a, b) => {
    const categoryCompare = (a.category || '').localeCompare(b.category || '');
    if (categoryCompare !== 0) {
      return categoryCompare;
    }
    return a.name.localeCompare(b.name);
  });
}

export async function updateMarketBenchmark(
  benchmarkId: string,
  payload: Partial<MarketBenchmark>,
): Promise<MarketBenchmark> {
  const benchmarks = ensureBenchmarks();
  const benchmark = findById(benchmarks, benchmarkId);
  if (!benchmark) {
    throw new Error('Benchmark not found');
  }
  const updated: MarketBenchmark = {
    ...benchmark,
    ...payload,
    updated_at: payload.updated_at || nowIso(),
  };
  saveCollection('market_benchmarks', updateById(benchmarks, benchmarkId, updated));
  return updated;
}

export async function listMarketZones(): Promise<MarketZone[]> {
  const zones = loadCollection<MarketZone>('market_zones').filter((zone) => zone.is_active);
  return [...zones].sort((a, b) => (a.price_level || '').localeCompare(b.price_level || ''));
}

export async function createMarketZone(payload: Partial<MarketZone>): Promise<MarketZone> {
  const now = nowIso();
  const newZone: MarketZone = {
    id: generateId(),
    name: payload.name || 'Nouvelle zone',
    description: payload.description,
    price_level: payload.price_level || 'standard',
    avg_subscription_min: payload.avg_subscription_min ?? 0,
    avg_subscription_max: payload.avg_subscription_max ?? 0,
    geographic_scope: payload.geographic_scope,
    population_density: payload.population_density,
    avg_household_income_range: payload.avg_household_income_range,
    is_active: payload.is_active ?? true,
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
  };
  const zones = loadCollection<MarketZone>('market_zones');
  zones.push(newZone);
  saveCollection('market_zones', zones);
  return newZone;
}

export async function updateMarketZone(zoneId: string, payload: Partial<MarketZone>): Promise<MarketZone> {
  const zones = loadCollection<MarketZone>('market_zones');
  const zone = findById(zones, zoneId);
  if (!zone) {
    throw new Error('Zone not found');
  }
  const updated: MarketZone = {
    ...zone,
    ...payload,
    updated_at: payload.updated_at || nowIso(),
  };
  saveCollection('market_zones', updateById(zones, zoneId, updated));
  return updated;
}

export async function deleteMarketZone(zoneId: string): Promise<void> {
  const zones = loadCollection<MarketZone>('market_zones').filter((zone) => zone.id !== zoneId);
  saveCollection('market_zones', zones);
}

export async function listCompetitors(gymId: string): Promise<Competitor[]> {
  return sortByDateDesc(loadCollection<Competitor>('competitors').filter((competitor) => competitor.gym_id === gymId));
}

export async function createCompetitor(payload: Partial<Competitor>): Promise<Competitor> {
  const now = nowIso();
  const newCompetitor: Competitor = {
    id: generateId(),
    gym_id: payload.gym_id || '',
    name: payload.name || 'Concurrent',
    offers_count: payload.offers_count ?? 0,
    google_reviews_count: payload.google_reviews_count ?? 0,
    instagram_followers: payload.instagram_followers ?? 0,
    has_hyrox: payload.has_hyrox ?? false,
    has_weightlifting: payload.has_weightlifting ?? false,
    has_gymnastics: payload.has_gymnastics ?? false,
    has_childcare: payload.has_childcare ?? false,
    has_nutrition: payload.has_nutrition ?? false,
    last_updated: payload.last_updated || now,
    is_active: payload.is_active ?? true,
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
    ...payload,
  };
  const competitors = loadCollection<Competitor>('competitors');
  competitors.push(newCompetitor);
  saveCollection('competitors', competitors);
  return newCompetitor;
}

export async function updateCompetitor(competitorId: string, payload: Partial<Competitor>): Promise<Competitor> {
  const competitors = loadCollection<Competitor>('competitors');
  const competitor = findById(competitors, competitorId);
  if (!competitor) {
    throw new Error('Competitor not found');
  }
  const updated: Competitor = {
    ...competitor,
    ...payload,
    updated_at: payload.updated_at || nowIso(),
  };
  saveCollection('competitors', updateById(competitors, competitorId, updated));
  return updated;
}

export async function deleteCompetitor(competitorId: string): Promise<void> {
  const competitors = loadCollection<Competitor>('competitors').filter(
    (competitor) => competitor.id !== competitorId,
  );
  saveCollection('competitors', competitors);
}

export async function listGymOffers(gymId: string): Promise<GymOffer[]> {
  return sortByDateDesc(loadCollection<GymOffer>('gym_offers').filter((offer) => offer.gym_id === gymId));
}

export async function createGymOffer(payload: Partial<GymOffer>): Promise<GymOffer> {
  const now = nowIso();
  const newOffer: GymOffer = {
    id: generateId(),
    gym_id: payload.gym_id || '',
    offer_type: payload.offer_type || 'unlimited',
    offer_name: payload.offer_name || 'Nouvelle offre',
    price: payload.price ?? 0,
    currency: payload.currency || 'EUR',
    duration_months: payload.duration_months ?? 1,
    commitment_months: payload.commitment_months ?? 1,
    is_active: payload.is_active ?? true,
    is_featured: payload.is_featured ?? false,
    sort_order: payload.sort_order ?? 0,
    active_subscriptions_count: payload.active_subscriptions_count ?? 0,
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
    ...payload,
  };
  const offers = loadCollection<GymOffer>('gym_offers');
  offers.push(newOffer);
  saveCollection('gym_offers', offers);
  return newOffer;
}

export async function updateGymOffer(offerId: string, payload: Partial<GymOffer>): Promise<GymOffer> {
  const offers = loadCollection<GymOffer>('gym_offers');
  const offer = findById(offers, offerId);
  if (!offer) {
    throw new Error('Offer not found');
  }
  const updated: GymOffer = {
    ...offer,
    ...payload,
    updated_at: payload.updated_at || nowIso(),
  };
  saveCollection('gym_offers', updateById(offers, offerId, updated));
  return updated;
}

export async function deleteGymOffer(offerId: string): Promise<void> {
  const offers = loadCollection<GymOffer>('gym_offers').filter((offer) => offer.id !== offerId);
  saveCollection('gym_offers', offers);
}

export async function upsertKpis(records: Partial<KPI>[]): Promise<void> {
  const kpis = loadCollection<KPI>('kpis');
  const now = nowIso();
  records.forEach((record) => {
    if (!record.audit_id || !record.kpi_code) {
      return;
    }
    const existingIndex = kpis.findIndex(
      (kpi) => kpi.audit_id === record.audit_id && kpi.kpi_code === record.kpi_code,
    );
    if (existingIndex >= 0) {
      kpis[existingIndex] = {
        ...kpis[existingIndex],
        ...record,
        id: kpis[existingIndex].id,
        computed_at: record.computed_at || now,
      } as KPI;
    } else {
      kpis.push({
        id: record.id || generateId(),
        audit_id: record.audit_id,
        kpi_code: record.kpi_code,
        value: record.value ?? 0,
        unit: record.unit,
        inputs_snapshot: record.inputs_snapshot,
        computed_at: record.computed_at || now,
      } as KPI);
    }
  });
  saveCollection('kpis', kpis);
}

export async function upsertScores(records: Partial<Score>[]): Promise<void> {
  const scores = loadCollection<Score>('scores');
  const now = nowIso();
  records.forEach((record) => {
    if (!record.audit_id || !record.pillar_code) {
      return;
    }
    const existingIndex = scores.findIndex(
      (score) => score.audit_id === record.audit_id && score.pillar_code === record.pillar_code,
    );
    if (existingIndex >= 0) {
      scores[existingIndex] = {
        ...scores[existingIndex],
        ...record,
        id: scores[existingIndex].id,
        computed_at: record.computed_at || now,
      } as Score;
    } else {
      scores.push({
        id: record.id || generateId(),
        audit_id: record.audit_id,
        pillar_code: record.pillar_code,
        pillar_name: record.pillar_name || '',
        score: record.score ?? 0,
        weight: record.weight ?? 1,
        details: record.details,
        computed_at: record.computed_at || now,
      } as Score);
    }
  });
  saveCollection('scores', scores);
}

export async function replaceRecommendations(auditId: string, records: Partial<Recommendation>[]): Promise<void> {
  const recommendations = loadCollection<Recommendation>('recommendations').filter(
    (rec) => rec.audit_id !== auditId,
  );
  const now = nowIso();
  records.forEach((record) => {
    if (!record.audit_id) {
      record.audit_id = auditId;
    }
    if (!record.audit_id || !record.rec_code || !record.title) {
      return;
    }
    recommendations.push({
      id: record.id || generateId(),
      audit_id: record.audit_id,
      rec_code: record.rec_code,
      title: record.title,
      description: record.description,
      priority: record.priority || 'P2',
      expected_impact_eur: record.expected_impact_eur,
      effort_level: record.effort_level || 'M',
      confidence: record.confidence || 'moyen',
      category: record.category,
      computed_at: record.computed_at || now,
    } as Recommendation);
  });
  saveCollection('recommendations', recommendations);
}
