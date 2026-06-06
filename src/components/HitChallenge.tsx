import type { MatchPrediction } from '../types';

type HitChallengeProps = {
  matches: MatchPrediction[];
};

export function HitChallenge({ matches }: HitChallengeProps) {
  const completed = matches.filter((match) => match.result === 'hit' || match.result === 'miss');
  const hitCount = completed.filter((match) => match.result === 'hit').length;
  const hitRate = completed.length ? Math.round((hitCount / completed.length) * 100) : 0;

  return (
    <section className="panel-view">
      <span className="eyebrow">命中挑战</span>
      <h2>历史方向回看</h2>
      <p>
        以静态样本展示命中记录，当前 {completed.length} 场已结算，命中率 {hitRate}%。
      </p>
      <div className="simple-list">
        {completed.map((match) => (
          <article key={match.id}>
            <strong>
              {match.homeTeam} vs {match.awayTeam}
            </strong>
            <span className={match.result === 'hit' ? 'result-hit' : 'result-miss'}>
              {match.result === 'hit' ? '命中' : '未中'} · {match.prediction}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
