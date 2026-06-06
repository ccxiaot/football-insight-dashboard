import { X } from 'lucide-react';
import type { MatchPrediction } from '../types';
import { TeamBadge } from './TeamBadge';

type MatchDetailModalProps = {
  match: MatchPrediction | null;
  onClose: () => void;
};

export function MatchDetailModal({ match, onClose }: MatchDetailModalProps) {
  if (!match) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <section
        aria-label={`${match.homeTeam} vs ${match.awayTeam} 详细分析`}
        aria-modal="true"
        className="detail-modal"
        role="dialog"
      >
        <button aria-label="关闭分析" className="icon-button" onClick={onClose} type="button">
          <X size={18} />
        </button>
        <div className="modal-teams">
          <TeamBadge code={match.homeFlag} name={match.homeTeam} />
          <strong>VS</strong>
          <TeamBadge code={match.awayFlag} name={match.awayTeam} />
        </div>
        <h2>{match.prediction}</h2>
        <p>{match.analysis}</p>
        <h3>概率拆解</h3>
        <div className="prob-grid">
          <span>主胜 {match.probabilities.home}%</span>
          <span>平局 {match.probabilities.draw}%</span>
          <span>客胜 {match.probabilities.away}%</span>
        </div>
        {match.odds ? (
          <>
            <h3>竞彩 SP</h3>
            <div className="prob-grid">
              <span>胜 {match.odds.home}</span>
              <span>平 {match.odds.draw}</span>
              <span>负 {match.odds.away}</span>
            </div>
          </>
        ) : null}
        {match.handicapOdds ? (
          <>
            <h3>让球胜平负</h3>
            <div className="prob-grid">
              <span>{match.handicapOdds.line || '让球'}</span>
              <span>胜 {match.handicapOdds.home}</span>
              <span>平 {match.handicapOdds.draw}</span>
              <span>负 {match.handicapOdds.away}</span>
            </div>
          </>
        ) : null}
        <dl className="detail-list">
          <div>
            <dt>让球参考</dt>
            <dd>{match.handicap}</dd>
          </div>
          <div>
            <dt>总进球</dt>
            <dd>{match.totalGoals}</dd>
          </div>
          <div>
            <dt>风险标签</dt>
            <dd>{match.tags.join(' / ')}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
