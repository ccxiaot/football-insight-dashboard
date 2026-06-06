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

const riskText = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

const statusText = {
  finished: '已完场',
  live: '进行中',
  pending: '待确认',
  scheduled: '待开赛',
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
        <span>
          {match.matchNo ? `${match.matchNo} · ` : ''}
          {match.competition}
        </span>
        <strong>{match.date} {match.kickoff}</strong>
      </div>
      <div className="match-meta">
        <span>{statusText[match.status ?? 'scheduled']}</span>
        <span>让球 {match.handicap}</span>
        <span>进球 {match.totalGoals}</span>
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
      {match.handicapOdds ? (
        <div className="odds-row muted">
          <span>让球 {match.handicapOdds.line || '0'}</span>
          <span>胜 {match.handicapOdds.home}</span>
          <span>平 {match.handicapOdds.draw}</span>
          <span>负 {match.handicapOdds.away}</span>
        </div>
      ) : null}
      <p>{match.analysis}</p>
      <div className="tag-row">
        {match.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="match-footer">
        <span>
          <Gauge size={15} />
          {match.confidence}%
        </span>
        <span>
          <AlertTriangle size={15} />
          {riskText[match.riskLevel]}
        </span>
      </div>
      <div className="confidence-track" aria-hidden="true">
        <i style={{ width: `${match.confidence}%` }} />
      </div>
    </button>
  );
}
