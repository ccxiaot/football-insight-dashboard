import { describe, expect, it } from 'vitest';
import type { MatchPrediction } from '../types';
import { generateBetSlip } from './betSlip';

const baseMatch: MatchPrediction = {
  id: 'base',
  date: '2026-06-06',
  kickoff: '20:00',
  competition: '测试',
  homeTeam: '主队',
  awayTeam: '客队',
  prediction: '主胜',
  recommendation: 'watch',
  confidence: 60,
  riskLevel: 'medium',
  tags: [],
  analysis: '测试样本',
  probabilities: { home: 50, draw: 30, away: 20 },
  handicap: '主 -0.5',
  totalGoals: '2-3 球',
};

describe('generateBetSlip', () => {
  it('returns high and watch matches sorted by confidence', () => {
    const matches: MatchPrediction[] = [
      { ...baseMatch, id: 'avoid', recommendation: 'avoid', confidence: 95 },
      { ...baseMatch, id: 'watch-low', recommendation: 'watch', confidence: 61 },
      { ...baseMatch, id: 'high', recommendation: 'high', confidence: 80 },
      { ...baseMatch, id: 'watch-high', recommendation: 'watch', confidence: 72 },
    ];

    const slip = generateBetSlip(matches, 3);

    expect(slip.map((match) => match.id)).toEqual(['high', 'watch-high', 'watch-low']);
  });

  it('respects the requested limit', () => {
    const matches: MatchPrediction[] = [
      { ...baseMatch, id: 'one', recommendation: 'high', confidence: 80 },
      { ...baseMatch, id: 'two', recommendation: 'high', confidence: 78 },
      { ...baseMatch, id: 'three', recommendation: 'watch', confidence: 70 },
    ];

    expect(generateBetSlip(matches, 2)).toHaveLength(2);
  });
});
