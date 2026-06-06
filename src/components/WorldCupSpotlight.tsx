import type { MatchPrediction } from '../types';
import { TeamBadge } from './TeamBadge';

type WorldCupSpotlightProps = {
  featuredMatch: MatchPrediction;
  onOpenMatch: (match: MatchPrediction) => void;
};

export function WorldCupSpotlight({ featuredMatch, onOpenMatch }: WorldCupSpotlightProps) {
  return (
    <section className="spotlight" aria-label="世界杯专栏">
      <div className="spotlight-copy">
        <span className="eyebrow">世界杯专栏</span>
        <h2>赛前路径与焦点战观察</h2>
        <p>用分组实力、赛程密度和赔率变化做第一轮筛选，先给出演示级趋势判断。</p>
        <div className="spotlight-stats">
          <span>12 组路径</span>
          <span>104 场样本</span>
          <span>静态演示</span>
        </div>
      </div>
      <button
        aria-label={`${featuredMatch.homeTeam} vs ${featuredMatch.awayTeam} 查看分析`}
        className="featured-match"
        onClick={() => onOpenMatch(featuredMatch)}
        type="button"
      >
        <span>今日观察</span>
        <div className="featured-teams">
          <TeamBadge code={featuredMatch.homeFlag} name={featuredMatch.homeTeam} />
          <strong>VS</strong>
          <TeamBadge code={featuredMatch.awayFlag} name={featuredMatch.awayTeam} />
        </div>
        <small>
          {featuredMatch.kickoff} / {featuredMatch.prediction} / 可信度 {featuredMatch.confidence}%
        </small>
      </button>
    </section>
  );
}
