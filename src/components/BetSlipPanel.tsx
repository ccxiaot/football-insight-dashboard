import type { MatchPrediction } from '../types';
import { generateBetSlip } from '../services/betSlip';

type BetSlipPanelProps = {
  matches: MatchPrediction[];
};

export function BetSlipPanel({ matches }: BetSlipPanelProps) {
  const picks = generateBetSlip(matches, 4);
  const averageConfidence = picks.length
    ? Math.round(picks.reduce((total, match) => total + match.confidence, 0) / picks.length)
    : 0;

  return (
    <section className="panel-view">
      <span className="eyebrow">投注单</span>
      <h2>组合候选</h2>
      <p>从高信和观察场次中筛出最多 4 场，按可信度排序。组合平均可信度 {averageConfidence}%。</p>
      <div className="spotlight-stats">
        <span>建议 2 串 1 起步</span>
        <span>回避高风险单关</span>
        <span>临场首发前复核</span>
      </div>
      <div className="simple-list">
        {picks.map((match) => (
          <article key={match.id}>
            <strong>
              {match.homeTeam} vs {match.awayTeam}
            </strong>
            <span>
              {match.prediction} · {match.confidence}% · {match.odds ? `SP ${match.odds.home}/${match.odds.draw}/${match.odds.away}` : 'SP 待更新'}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
