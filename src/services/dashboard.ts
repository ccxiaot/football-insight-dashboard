import type {
  DashboardMetrics,
  DateOption,
  MatchPrediction,
  RecommendationGroups,
} from '../types';

export function filterMatchesByDate(matches: MatchPrediction[], date: string): MatchPrediction[] {
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

  return uniqueDates.map((date) => {
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
  });
}

function formatDateDisplay(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][parsed.getDay()];
  return `${month}/${day}${week}`;
}
