import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDashboardData } from './dataLoader';

describe('loadDashboardData', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to bundled data when running from file protocol', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({ protocol: 'file:' } as Location);

    const data = await loadDashboardData();

    expect(data.matches.length).toBeGreaterThan(0);
    expect(data.syncMeta.mode).toBe('fallback');
  });

  it('loads generated JSON data over http', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({ protocol: 'http:' } as Location);
    vi.spyOn(window, 'fetch').mockImplementation(
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              id: 'json-match',
              date: '2026-06-06',
              kickoff: '20:00',
              competition: 'JSON',
              homeTeam: '主队',
              awayTeam: '客队',
              prediction: '主胜',
              recommendation: 'high',
              confidence: 80,
              riskLevel: 'low',
              tags: [],
              analysis: 'from json',
              probabilities: { home: 60, draw: 25, away: 15 },
              handicap: '主 -0.5',
              totalGoals: '2-3 球',
            },
          ],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            generatedAt: '2026-06-06T18:00:00+08:00',
            sourceLabel: 'generated demo',
            currentCount: 1,
            historyCount: 0,
            status: 'generated',
          }),
        }) as unknown as typeof fetch,
    );

    const data = await loadDashboardData();

    expect(data.matches[0].id).toBe('json-match');
    expect(data.syncMeta.mode).toBe('generated');
  });
});
