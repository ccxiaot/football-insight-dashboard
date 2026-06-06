import type { MatchPrediction } from '../types';

type BetSlipPanelProps = {
  matches: MatchPrediction[];
};

export function BetSlipPanel({ matches }: BetSlipPanelProps) {
  return (
    <section className="panel-view">
      <span className="eyebrow">投注单</span>
      <h2>组合候选</h2>
      <p>这里会展示从高信和观察场次中筛出的组合，第一版先使用静态演示数据。</p>
      <div className="simple-list">
        {matches.slice(0, 4).map((match) => (
          <article key={match.id}>
            <strong>
              {match.homeTeam} vs {match.awayTeam}
            </strong>
            <span>
              {match.prediction} · {match.confidence}%
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
