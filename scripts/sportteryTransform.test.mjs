import { describe, expect, it } from 'vitest';
import { normalizeSportteryRow } from './sportteryTransform.mjs';

describe('normalizeSportteryRow', () => {
  it('converts a Sporttery row into a dashboard match', () => {
    const match = normalizeSportteryRow({
      row: {
        matchId: '123456',
        matchNumStr: '周六001',
        matchDate: '2026-06-06',
        matchTime: '21:00',
        leagueName: '国际赛',
        homeTeamAllName: '比利时',
        awayTeamAllName: '突尼斯',
        homeTeamAbbName: '比利时',
        awayTeamAbbName: '突尼斯',
        homeTeamCode: 'BEL',
        awayTeamCode: 'TUN',
        oddsList: [
          { poolCode: 'HAD', h: '1.62', d: '3.70', a: '5.40' },
          { poolCode: 'HHAD', h: '2.10', d: '3.25', a: '2.90', goalLine: '-1' },
        ],
      },
      capturedAt: '2026-06-06T10:00:00.000Z',
    });

    expect(match).toMatchObject({
      id: 'sporttery_123456',
      date: '2026-06-06',
      kickoff: '21:00',
      competition: '国际赛',
      homeTeam: '比利时',
      awayTeam: '突尼斯',
      homeFlag: 'be',
      awayFlag: 'tn',
      odds: { home: 1.62, draw: 3.7, away: 5.4 },
      recommendation: 'high',
      riskLevel: 'low',
    });
    expect(match.confidence).toBeGreaterThanOrEqual(70);
    expect(match.probabilities.home).toBeGreaterThan(match.probabilities.away);
    expect(match.tags).toContain('竞彩官方');
  });

  it('returns null when no valid HAD odds exist', () => {
    const match = normalizeSportteryRow({
      row: {
        matchId: 'missing-odds',
        matchDate: '2026-06-06',
        matchTime: '21:00',
        homeTeamAllName: '主队',
        awayTeamAllName: '客队',
      },
      capturedAt: '2026-06-06T10:00:00.000Z',
    });

    expect(match).toBeNull();
  });
});
