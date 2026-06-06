import { AlertTriangle, ClipboardCheck, Clock, Gauge, ShieldAlert, Target, TrendingUp } from 'lucide-react';
import type { DashboardMetrics, MatchPrediction, RecommendationGroups, SyncMeta } from '../types';
import { MatchCard } from './MatchCard';
import { SummaryGrid } from './SummaryGrid';
import { SyncPanel } from './SyncPanel';
import { WorldCupSpotlight } from './WorldCupSpotlight';

type PreMatchOverviewProps = {
  featuredMatch: MatchPrediction;
  groups: RecommendationGroups;
  matches: MatchPrediction[];
  metrics: DashboardMetrics;
  onOpenMatch: (match: MatchPrediction) => void;
  statusCounts: {
    finished: number;
    live: number;
    scheduled: number;
  };
  syncMeta: SyncMeta;
};

const recommendationText = {
  high: '高信',
  watch: '观察',
  avoid: '回避',
};

export function PreMatchOverview({
  featuredMatch,
  groups,
  matches,
  metrics,
  onOpenMatch,
  statusCounts,
  syncMeta,
}: PreMatchOverviewProps) {
  const upcomingMatches = matches
    .filter((match) => match.status !== 'finished')
    .sort((left, right) => {
      const timeSort = `${left.date} ${left.kickoff}`.localeCompare(`${right.date} ${right.kickoff}`);
      return timeSort || right.confidence - left.confidence;
    })
    .slice(0, 4);

  const highRiskCount = matches.filter((match) => match.riskLevel === 'high').length;
  const avoidCount = groups.avoid;
  const recheckCount = matches.filter(
    (match) => match.recommendation === 'watch' || match.riskLevel !== 'low',
  ).length;
  const lowConfidenceCount = matches.filter((match) => match.confidence < 68).length;
  const topPick = matches
    .filter((match) => match.recommendation === 'high')
    .sort((left, right) => right.confidence - left.confidence)[0] ?? featuredMatch;
  const waitPick = matches
    .filter((match) => match.recommendation === 'watch')
    .sort((left, right) => right.confidence - left.confidence)[0] ?? upcomingMatches[0] ?? featuredMatch;
  const avoidPick = matches
    .filter((match) => match.recommendation === 'avoid' || match.riskLevel === 'high')
    .sort((left, right) => left.confidence - right.confidence)[0] ?? upcomingMatches[1] ?? featuredMatch;
  const latePick = upcomingMatches.find((match) => match.handicapOdds?.line || match.handicap) ?? featuredMatch;

  const decisionCards = [
    {
      icon: <Target size={18} />,
      label: '主推候选',
      match: topPick,
      value: `${topPick.prediction} / ${topPick.confidence}%`,
      note: '模型方向、欧赔倾向和风险等级相对一致，优先进入演示主线。',
    },
    {
      icon: <Clock size={18} />,
      label: '观察等待',
      match: waitPick,
      value: `${waitPick.totalGoals} 球路`,
      note: '先保留方向，等首发、临场赔率和盘口变化二次确认。',
    },
    {
      icon: <AlertTriangle size={18} />,
      label: '回避场次',
      match: avoidPick,
      value: `风险 ${avoidPick.riskLevel}`,
      note: '置信度或风险结构不适合做强推荐，只放入复盘观察。',
    },
    {
      icon: <TrendingUp size={18} />,
      label: '临场复核',
      match: latePick,
      value: latePick.handicapOdds?.line ?? latePick.handicap,
      note: '让球盘与胜平负方向需要同步验证，盘口跳动时降低仓位。',
    },
  ];

  const reviewQueue = matches
    .filter((match) => match.status !== 'finished')
    .sort((left, right) => {
      const leftScore = (left.riskLevel === 'high' ? 3 : left.riskLevel === 'medium' ? 2 : 1) * 100 - left.confidence;
      const rightScore = (right.riskLevel === 'high' ? 3 : right.riskLevel === 'medium' ? 2 : 1) * 100 - right.confidence;
      return rightScore - leftScore;
    })
    .slice(0, 6);

  const riskCards = [
    {
      icon: <ClipboardCheck size={18} />,
      label: '临场首发前复核',
      value: `${recheckCount} 场`,
      note: '观察组或中高风险赛事优先复核阵容、伤停和天气。',
    },
    {
      icon: <ShieldAlert size={18} />,
      label: '让球盘波动',
      value: `${highRiskCount} 场`,
      note: '高风险场次不要只看胜平负，重点看让球盘与 SP 是否同步。',
    },
    {
      icon: <AlertTriangle size={18} />,
      label: '低可信度避坑',
      value: `${lowConfidenceCount + avoidCount} 场`,
      note: '低可信度或回避组只保留观察，不进入主推组合。',
    },
  ];

  return (
    <>
      <WorldCupSpotlight featuredMatch={featuredMatch} onOpenMatch={onOpenMatch} />
      <SummaryGrid groups={groups} metrics={metrics} />
      <SyncPanel meta={syncMeta} statusCounts={statusCounts} />
      <section className="prematch-matrix" aria-label="赛前决策矩阵">
        <div className="section-title">
          <span className="eyebrow">Decision Matrix</span>
          <h2>赛前决策矩阵</h2>
          <p>把今日比赛拆成主推、观察、回避和临场复核四个动作，方便演示时快速说明推荐依据。</p>
        </div>
        <div className="prematch-matrix-grid">
          {decisionCards.map((card) => (
            <button className="prematch-matrix-card" key={card.label} onClick={() => onOpenMatch(card.match)} type="button">
              <span className="risk-icon">{card.icon}</span>
              <small>{card.label}</small>
              <strong>
                {card.match.homeTeam} vs {card.match.awayTeam}
              </strong>
              <b>{card.value}</b>
              <p>{card.note}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="overview-layout" aria-label="赛前观察工作台">
        <div className="overview-main">
          <div className="section-title">
            <span className="eyebrow">Pre-match Watch</span>
            <h2>临场观察</h2>
            <p>按开赛时间截取最需要赛前复核的场次，适合演示时快速说明今天先看哪里。</p>
          </div>
          <div className="match-grid compact">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} onOpen={onOpenMatch} />
            ))}
          </div>
        </div>
        <aside className="overview-side" aria-label="赛前复核清单">
          <div className="section-title">
            <span className="eyebrow">Checklist</span>
            <h2>赛前复核</h2>
          </div>
          <div className="risk-stack">
            {riskCards.map((card) => (
              <article className="risk-card" key={card.label}>
                <div>
                  <span className="risk-icon">{card.icon}</span>
                  <strong>{card.label}</strong>
                </div>
                <b>{card.value}</b>
                <p>{card.note}</p>
              </article>
            ))}
          </div>
          <div className="quick-board">
            <strong>
              <Clock size={17} />
              今日信号
            </strong>
            {matches.slice(0, 5).map((match) => (
              <button key={match.id} onClick={() => onOpenMatch(match)} type="button">
                <span>{match.kickoff}</span>
                <b>
                  {match.homeTeam} vs {match.awayTeam}
                </b>
                <em>{recommendationText[match.recommendation]}</em>
              </button>
            ))}
            <small>
              <Gauge size={14} />
              平均可信度 {metrics.averageConfidence}%
            </small>
          </div>
        </aside>
      </section>
      <section className="odds-review-panel" aria-label="盘口复核队列">
        <div className="section-title">
          <span className="eyebrow">Odds Review</span>
          <h2>盘口复核队列</h2>
          <p>优先列出风险更高、让球信息更敏感的场次，临场只需要沿着队列逐场复核。</p>
        </div>
        <div className="odds-review-list">
          {reviewQueue.map((match) => (
            <button key={match.id} onClick={() => onOpenMatch(match)} type="button">
              <span>
                {match.kickoff}
                <small>{match.competition}</small>
              </span>
              <strong>
                {match.homeTeam} vs {match.awayTeam}
              </strong>
              <em>{match.handicapOdds?.line ?? match.handicap}</em>
              <b>{match.prediction}</b>
              <i>{match.confidence}%</i>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
