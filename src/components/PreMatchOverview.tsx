import { AlertTriangle, ClipboardCheck, Clock, Gauge, ShieldAlert } from 'lucide-react';
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
    </>
  );
}
