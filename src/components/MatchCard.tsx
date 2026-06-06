import { AlertTriangle, Gauge } from 'lucide-react';
import type { MatchPrediction } from '../types';
import { TeamBadge } from './TeamBadge';

type MatchCardProps = {
  match: MatchPrediction;
  onOpen: (match: MatchPrediction) => void;
};

const recommendationText = {
  high: '高信',
  watch: '观察',
  avoid: '回避',
};

export function MatchCard({ match, onOpen }: MatchCardProps) {
  return (
    <button
      aria-label={`${match.homeTeam} vs ${match.awayTeam} ${match.prediction}`}
      className="match-card"
      onClick={() => onOpen(match)}
      type="button"
    >
      <div className="match-card-head">
        <span>{match.competition}</span>
        <strong>{match.kickoff}</strong>
      </div>
      <div className="match-teams">
        <TeamBadge code={match.homeFlag} name={match.homeTeam} />
        <span className="versus">vs</span>
        <TeamBadge code={match.awayFlag} name={match.awayTeam} />
      </div>
      <div className="match-signal">
        <span className={`chip ${match.recommendation}`}>{recommendationText[match.recommendation]}</span>
        <strong>{match.prediction}</strong>
      </div>
      {match.odds ? (
        <div className="odds-row">
          <span>胜 {match.odds.home}</span>
          <span>平 {match.odds.draw}</span>
          <span>负 {match.odds.away}</span>
        </div>
      ) : null}
      <p>{match.analysis}</p>
      <div className="match-footer">
        <span>
          <Gauge size={15} />
          {match.confidence}%
        </span>
        <span>
          <AlertTriangle size={15} />
          {match.riskLevel}
        </span>
      </div>
    </button>
  );
}
