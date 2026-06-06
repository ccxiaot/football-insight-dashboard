import type {
  DashboardMetrics,
  DateOption,
  MatchPrediction,
  RecommendationLevel,
  RecommendationGroups,
} from '../types';

export type MatchSortKey = 'kickoff' | 'confidence' | 'odds';

export function filterMatchesByDate(matches: MatchPrediction[], date: string): MatchPrediction[] {
  if (date === 'all') {
    return [...matches].sort((left, right) => `${left.date} ${left.kickoff}`.localeCompare(`${right.date} ${right.kickoff}`));
  }
  return matches
    .filter((match) => match.date === date)
    .sort((left, right) => left.kickoff.localeCompare(right.kickoff));
}

export function groupRecommendations(matches: MatchPrediction[]): RecommendationGroups {
  return matches.reduce<RecommendationGroups>(
    (groups, match) => {
      groups[match.recommendation] += 1;
      return groups;
    },
    { high: 0, watch: 0, avoid: 0 },
  );
}

export function calculateDashboardMetrics(
  matches: MatchPrediction[],
  selectedDate: string,
): DashboardMetrics {
  const filteredMatches = filterMatchesByDate(matches, selectedDate);
  const completedMatches = filteredMatches.filter(
    (match) => match.result === 'hit' || match.result === 'miss',
  );
  const hitCount = completedMatches.filter((match) => match.result === 'hit').length;
  const confidenceTotal = filteredMatches.reduce((total, match) => total + match.confidence, 0);

  return {
    filteredCount: filteredMatches.length,
    completedCount: completedMatches.length,
    hitRate: completedMatches.length ? Math.round((hitCount / completedMatches.length) * 100) : 0,
    averageConfidence: filteredMatches.length
      ? Math.round(confidenceTotal / filteredMatches.length)
      : 0,
    totalCount: matches.length,
  };
}

export function getDateOptions(matches: MatchPrediction[], today: string): DateOption[] {
  const todayTime = new Date(`${today}T00:00:00`).getTime();
  const uniqueDates = [...new Set(matches.map((match) => match.date))].sort();

  return [
    { date: 'all', label: '全部日期', display: `${matches.length} 场` },
    ...uniqueDates.map((date) => {
    const diffDays = Math.round((new Date(`${date}T00:00:00`).getTime() - todayTime) / 86400000);
    const label =
      diffDays === 0
        ? '今天'
        : diffDays === 1
          ? '明天'
          : diffDays === -1
            ? '昨天'
            : diffDays > 1
              ? `${diffDays}天后`
              : `历史 ${Math.abs(diffDays)}天前`;

      return {
      date,
      label,
      display: formatDateDisplay(date),
      };
    }),
  ];
}

export function getCompetitionOptions(matches: MatchPrediction[]): string[] {
  return ['全部赛事', ...Array.from(new Set(matches.map((match) => match.competition))).sort()];
}

export function filterMatches(matches: MatchPrediction[], filters: {
  competition: string;
  recommendation: 'all' | RecommendationLevel;
}): MatchPrediction[] {
  return matches.filter((match) => {
    const competitionOk = filters.competition === '全部赛事' || match.competition === filters.competition;
    const recommendationOk = filters.recommendation === 'all' || match.recommendation === filters.recommendation;
    return competitionOk && recommendationOk;
  });
}

export function sortMatches(matches: MatchPrediction[], sortKey: MatchSortKey): MatchPrediction[] {
  return [...matches].sort((left, right) => {
    if (sortKey === 'confidence') return right.confidence - left.confidence;
    if (sortKey === 'odds') return (left.odds?.home ?? 99) - (right.odds?.home ?? 99);
    return `${left.date} ${left.kickoff}`.localeCompare(`${right.date} ${right.kickoff}`);
  });
}

export function countByStatus(matches: MatchPrediction[]) {
  return matches.reduce(
    (total, match) => {
      const status = match.status ?? 'scheduled';
      if (status === 'finished') total.finished += 1;
      else if (status === 'live') total.live += 1;
      else total.scheduled += 1;
      return total;
    },
    { finished: 0, live: 0, scheduled: 0 },
  );
}

function formatDateDisplay(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][parsed.getDay()];
  return `${month}/${day}${week}`;
}
