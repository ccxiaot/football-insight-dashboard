import type { MatchPrediction } from '../types';

export function generateBetSlip(matches: MatchPrediction[], limit: number): MatchPrediction[] {
  return matches
    .filter((match) => match.recommendation === 'high' || match.recommendation === 'watch')
    .sort((left, right) => {
      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }
      return `${left.date} ${left.kickoff}`.localeCompare(`${right.date} ${right.kickoff}`);
    })
    .slice(0, limit);
}
