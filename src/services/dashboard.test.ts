import { describe, expect, it } from 'vitest';
import type { MatchPrediction } from '../types';
import {
  calculateDashboardMetrics,
  filterMatchesByDate,
  getDateOptions,
  groupRecommendations,
} from './dashboard';

const matches: MatchPrediction[] = [
  {
    id: 'm1',
    date: '2026-06-06',
    kickoff: '21:00',
    competition: '国际赛',
    homeTeam: '比利时',
    awayTeam: '突尼斯',
    homeFlag: 'be',
    awayFlag: 'tn',
    odds: { home: 1.62, draw: 3.7, away: 5.4 },
    prediction: '主胜',
    recommendation: 'high',
    confidence: 78,
    riskLevel: 'medium',
    tags: ['阵容稳定', '主场优势'],
    analysis: '主队控球和定位球质量更稳定。',
    probabilities: { home: 58, draw: 25, away: 17 },
    handicap: '主 -0.75',
    totalGoals: '2-3 球',
    result: 'hit',
  },
  {
    id: 'm2',
    date: '2026-06-06',
    kickoff: '23:30',
    competition: '欧预赛',
    homeTeam: '斯洛伐克',
    awayTeam: '黑山',
    homeFlag: 'sk',
    awayFlag: 'me',
    odds: { home: 2.1, draw: 3.1, away: 3.3 },
    prediction: '平局',
    recommendation: 'watch',
    confidence: 61,
    riskLevel: 'high',
    tags: ['节奏偏慢'],
    analysis: '双方进攻效率接近，平局保护价值更高。',
    probabilities: { home: 35, draw: 34, away: 31 },
    handicap: '客 +0.25',
    totalGoals: '小 2.5',
    result: 'miss',
  },
  {
    id: 'm3',
    date: '2026-06-07',
    kickoff: '02:00',
    competition: '友谊赛',
    homeTeam: '加拿大',
    awayTeam: '爱尔兰',
    homeFlag: 'ca',
    awayFlag: 'ie',
    odds: { home: 2.4, draw: 3.2, away: 2.8 },
    prediction: '观望',
    recommendation: 'avoid',
    confidence: 44,
    riskLevel: 'high',
    tags: ['轮换不明'],
    analysis: '首发变动概率高，不适合进入组合。',
    probabilities: { home: 34, draw: 31, away: 35 },
    handicap: '跳过',
    totalGoals: 'pending update',
  },
];

describe('dashboard services', () => {
  it('filters matches by selected date', () => {
    expect(filterMatchesByDate(matches, '2026-06-06')).toHaveLength(2);
    expect(filterMatchesByDate(matches, '2026-06-06').map((match) => match.id)).toEqual(['m1', 'm2']);
  });

  it('calculates summary metrics for the selected date', () => {
    const metrics = calculateDashboardMetrics(matches, '2026-06-06');

    expect(metrics.filteredCount).toBe(2);
    expect(metrics.completedCount).toBe(2);
    expect(metrics.hitRate).toBe(50);
    expect(metrics.averageConfidence).toBe(70);
    expect(metrics.totalCount).toBe(3);
  });

  it('groups recommendation levels', () => {
    expect(groupRecommendations(matches)).toEqual({ high: 1, watch: 1, avoid: 1 });
  });

  it('builds nearby date options with labels', () => {
    const options = getDateOptions(matches, '2026-06-06');

    expect(options.map((option) => option.label)).toEqual(['全部日期', '今天', '明天']);
    expect(options.map((option) => option.date)).toEqual(['all', '2026-06-06', '2026-06-07']);
  });
});
