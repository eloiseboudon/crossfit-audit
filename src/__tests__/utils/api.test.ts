import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AuditStatus } from '../../lib/types';
import {
  getAuthToken,
  listGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym,
  listAudits,
  getAudit,
  createAudit,
  updateAudit,
  deleteAudit,
  listAnswers,
  upsertAnswer,
  upsertAnswers,
  listMarketBenchmarks,
  updateMarketBenchmark,
  listMarketZones,
  createMarketZone,
  updateMarketZone,
  deleteMarketZone,
  listCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
  listGymOffers,
  createGymOffer,
  updateGymOffer,
  deleteGymOffer,
  upsertKpis,
  upsertScores,
  replaceRecommendations,
  listDataTables,
  getDataTable,
} from '../../lib/api';

// ===========================================================================
// Helpers
// ===========================================================================

/** Build a mock Response from a JSON payload. */
function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

function mockEmptyResponse(status = 204): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'No Content',
    text: () => Promise.resolve(''),
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ===========================================================================
// Auth token
// ===========================================================================
describe('getAuthToken', () => {
  it('returns null when no token stored', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('returns authToken from localStorage', () => {
    localStorage.setItem('authToken', 'abc-123');
    expect(getAuthToken()).toBe('abc-123');
  });

  it('falls back to "token" key', () => {
    localStorage.setItem('token', 'fallback-token');
    expect(getAuthToken()).toBe('fallback-token');
  });

  it('prefers authToken over token', () => {
    localStorage.setItem('authToken', 'primary');
    localStorage.setItem('token', 'secondary');
    expect(getAuthToken()).toBe('primary');
  });

  it('returns null for whitespace-only token', () => {
    localStorage.setItem('authToken', '   ');
    expect(getAuthToken()).toBeNull();
  });
});

// ===========================================================================
// Request internals (tested via public functions)
// ===========================================================================
describe('request (via listGyms)', () => {
  it('sends Authorization header when token present', async () => {
    localStorage.setItem('authToken', 'my-token');
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [] }));

    await listGyms();

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('does not send Authorization header when no token', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [] }));

    await listGyms();

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBeNull();
  });

  it('throws on non-ok response with API message', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ message: 'Forbidden' }, 403));

    await expect(listGyms()).rejects.toThrow('Forbidden');
  });

  it('throws with statusText when no message in body', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, 500));

    await expect(listGyms()).rejects.toThrow();
  });
});

// ===========================================================================
// Gyms
// ===========================================================================
describe('gym CRUD', () => {
  const gym = { id: 'g1', name: 'CrossFit Box' };

  it('listGyms returns data array', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [gym] }));
    const result = await listGyms();
    expect(result).toEqual([gym]);
  });

  it('listGyms returns empty array when no data', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}));
    const result = await listGyms();
    expect(result).toEqual([]);
  });

  it('getGym returns gym data', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: gym }));
    const result = await getGym('g1');
    expect(result).toEqual(gym);
  });

  it('getGym throws when data is null', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: null }));
    await expect(getGym('g1')).rejects.toThrow('Gym not found');
  });

  it('createGym sends POST with body', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: gym }));
    const result = await createGym({ name: 'CrossFit Box' });
    expect(result).toEqual(gym);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/gyms');
    expect(init.method).toBe('POST');
  });

  it('updateGym sends PUT', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: gym }));
    await updateGym('g1', { name: 'Updated' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/gyms/g1');
    expect(init.method).toBe('PUT');
  });

  it('deleteGym sends DELETE', async () => {
    fetchMock.mockResolvedValueOnce(mockEmptyResponse());
    await deleteGym('g1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/gyms/g1');
    expect(init.method).toBe('DELETE');
  });
});

// ===========================================================================
// Audits
// ===========================================================================
describe('audit CRUD', () => {
  const audit = { id: 'a1', gym_id: 'g1', status: 'draft' };

  it('listAudits returns audits', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [audit] }));
    const result = await listAudits();
    expect(result).toEqual([audit]);
  });

  it('listAudits with includeGym hydrates gym', async () => {
    const gym = { id: 'g1', name: 'Box' };
    fetchMock
      .mockResolvedValueOnce(mockResponse({ data: [audit] }))
      .mockResolvedValueOnce(mockResponse({ data: [gym] }));

    const result = await listAudits(true);
    expect(result[0].gym).toEqual(gym);
  });

  it('getAudit returns audit', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: audit }));
    const result = await getAudit('a1');
    expect(result).toEqual(audit);
  });

  it('getAudit throws when not found', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: null }));
    await expect(getAudit('a1')).rejects.toThrow('Audit not found');
  });

  it('createAudit sends POST', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: audit }));
    const result = await createAudit({ gym_id: 'g1' });
    expect(result).toEqual(audit);
  });

  it('updateAudit sends PUT', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: audit }));
    await updateAudit('a1', { status: AuditStatus.COMPLETED });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('PUT');
  });

  it('deleteAudit sends DELETE', async () => {
    fetchMock.mockResolvedValueOnce(mockEmptyResponse());
    await deleteAudit('a1');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('DELETE');
  });
});

// ===========================================================================
// Answers
// ===========================================================================
describe('answers', () => {
  it('listAnswers returns answers array', async () => {
    const answers = [{ id: '1', audit_id: 'a1', block_code: 'b', question_code: 'q', value: '42' }];
    fetchMock.mockResolvedValueOnce(mockResponse({ data: answers }));
    const result = await listAnswers('a1');
    expect(result).toEqual(answers);
  });

  it('upsertAnswer delegates to upsertAnswers', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}));
    await upsertAnswer({ audit_id: 'a1', block_code: 'b', question_code: 'q', value: '1' });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/audits/a1/answers');
    expect(init.method).toBe('POST');
  });

  it('upsertAnswers skips records without required fields', async () => {
    await upsertAnswers([{ value: '1' }]); // missing audit_id, block_code, question_code
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Boolean normalization (competitors, gym offers, market zones)
// ===========================================================================
describe('boolean normalization', () => {
  it('listCompetitors normalizes boolean fields', async () => {
    const raw = { id: 'c1', gym_id: 'g1', has_hyrox: 1, has_weightlifting: 0, is_active: '1',
      has_gymnastics: 'true', has_childcare: false, has_nutrition: 0 };
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [raw] }));

    const result = await listCompetitors('g1');
    expect(result[0].has_hyrox).toBe(true);
    expect(result[0].has_weightlifting).toBe(false);
    expect(result[0].is_active).toBe(true);
    expect(result[0].has_gymnastics).toBe(true);
    expect(result[0].has_childcare).toBe(false);
  });

  it('listGymOffers normalizes is_active and is_featured', async () => {
    const raw = { id: 'o1', is_active: 1, is_featured: 0 };
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [raw] }));

    const result = await listGymOffers('g1');
    expect(result[0].is_active).toBe(true);
    expect(result[0].is_featured).toBe(false);
  });

  it('listMarketZones normalizes is_active', async () => {
    const raw = { id: 'z1', is_active: 1 };
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [raw] }));

    const result = await listMarketZones();
    expect(result[0].is_active).toBe(true);
  });

  it('createCompetitor normalizes response', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: { id: 'c1', has_hyrox: 1, has_weightlifting: 0, has_gymnastics: 0, has_childcare: 0, has_nutrition: 0, is_active: 1 } }));
    const result = await createCompetitor({ gym_id: 'g1', name: 'Rival' });
    expect(result.has_hyrox).toBe(true);
    expect(result.is_active).toBe(true);
  });

  it('createMarketZone normalizes response', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: { id: 'z1', is_active: 1, name: 'Zone A' } }));
    const result = await createMarketZone({ name: 'Zone A' });
    expect(result.is_active).toBe(true);
  });

  it('createGymOffer normalizes response', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: { id: 'o1', is_active: 1, is_featured: 0 } }));
    const result = await createGymOffer({ gym_id: 'g1', offer_name: 'Monthly' });
    expect(result.is_active).toBe(true);
    expect(result.is_featured).toBe(false);
  });
});

// ===========================================================================
// Market zones CRUD
// ===========================================================================
describe('market zone CRUD', () => {
  it('updateMarketZone sends PUT and normalizes', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: { id: 'z1', is_active: 0 } }));
    const result = await updateMarketZone('z1', { name: 'Updated' });
    expect(result.is_active).toBe(false);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('PUT');
  });

  it('deleteMarketZone sends DELETE', async () => {
    fetchMock.mockResolvedValueOnce(mockEmptyResponse());
    await deleteMarketZone('z1');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('DELETE');
  });
});

// ===========================================================================
// Competitors CRUD
// ===========================================================================
describe('competitor CRUD', () => {
  it('updateCompetitor sends PUT and normalizes', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: { id: 'c1', has_hyrox: 0, has_weightlifting: 0, has_gymnastics: 0, has_childcare: 0, has_nutrition: 0, is_active: 1 } }));
    const result = await updateCompetitor('c1', { name: 'Updated' });
    expect(result.is_active).toBe(true);
  });

  it('deleteCompetitor sends DELETE', async () => {
    fetchMock.mockResolvedValueOnce(mockEmptyResponse());
    await deleteCompetitor('c1');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('DELETE');
  });
});

// ===========================================================================
// Gym offers CRUD
// ===========================================================================
describe('gym offer CRUD', () => {
  it('updateGymOffer sends PUT and normalizes', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: { id: 'o1', is_active: 1, is_featured: 1 } }));
    const result = await updateGymOffer('o1', { offer_name: 'Updated' });
    expect(result.is_featured).toBe(true);
  });

  it('deleteGymOffer sends DELETE', async () => {
    fetchMock.mockResolvedValueOnce(mockEmptyResponse());
    await deleteGymOffer('o1');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('DELETE');
  });
});

// ===========================================================================
// KPIs & Scores grouped upsert
// ===========================================================================
describe('upsertKpis', () => {
  it('groups KPIs by audit_id and sends one request per group', async () => {
    fetchMock.mockResolvedValue(mockResponse({}));

    await upsertKpis([
      { audit_id: 'a1', kpi_code: 'k1', value: 10 },
      { audit_id: 'a1', kpi_code: 'k2', value: 20 },
      { audit_id: 'a2', kpi_code: 'k1', value: 30 },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const urls = fetchMock.mock.calls.map((c: unknown[]) => c[0] as string);
    expect(urls.some((u) => u.includes('/audits/a1/kpis'))).toBe(true);
    expect(urls.some((u) => u.includes('/audits/a2/kpis'))).toBe(true);
  });

  it('skips records without audit_id or kpi_code', async () => {
    fetchMock.mockResolvedValue(mockResponse({}));
    await upsertKpis([{ value: 10 }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('upsertScores', () => {
  it('groups scores by audit_id', async () => {
    fetchMock.mockResolvedValue(mockResponse({}));

    await upsertScores([
      { audit_id: 'a1', pillar_code: 'finance', score: 80 },
      { audit_id: 'a1', pillar_code: 'commercial', score: 70 },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain('/audits/a1/scores');
  });
});

// ===========================================================================
// Recommendations
// ===========================================================================
describe('replaceRecommendations', () => {
  it('sends POST with recommendations', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}));

    await replaceRecommendations('a1', [
      { rec_code: 'R1', title: 'Optimize pricing' },
    ]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/audits/a1/recommendations');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.recommendations[0].audit_id).toBe('a1');
  });
});

// ===========================================================================
// Market benchmarks
// ===========================================================================
describe('market benchmarks', () => {
  it('listMarketBenchmarks returns data', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [{ id: 'b1' }] }));
    const result = await listMarketBenchmarks();
    expect(result).toEqual([{ id: 'b1' }]);
  });

  it('updateMarketBenchmark sends PUT', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: { id: 'b1', value: 42 } }));
    const result = await updateMarketBenchmark('b1', { value: 42 } as never);
    expect(result).toEqual({ id: 'b1', value: 42 });
  });

  it('updateMarketBenchmark throws when no data', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: null }));
    await expect(updateMarketBenchmark('b1', {})).rejects.toThrow('Benchmark not updated');
  });
});

// ===========================================================================
// Data tables
// ===========================================================================
describe('data tables', () => {
  it('listDataTables returns summaries', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: [{ name: 'gyms', count: 5 }] }));
    const result = await listDataTables();
    expect(result).toEqual([{ name: 'gyms', count: 5 }]);
  });

  it('getDataTable returns table data', async () => {
    const tableData = { columns: ['id', 'name'], rows: [['1', 'Box']] };
    fetchMock.mockResolvedValueOnce(mockResponse({ data: tableData }));
    const result = await getDataTable('gyms');
    expect(result).toEqual(tableData);
  });

  it('getDataTable throws when not found', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ data: null }));
    await expect(getDataTable('nope')).rejects.toThrow('Table not found');
  });
});
