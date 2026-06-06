import { ArrowRight } from 'lucide-react';
import type { MatchPrediction, Odds } from '../types';
import { TeamBadge } from './TeamBadge';

type PredictionsTableProps = {
  matches: MatchPrediction[];
  onOpenMatch: (match: MatchPrediction) => void;
};

const recommendationText = {
  high: '高可信候选',
  watch: '观察',
  avoid: '避坑',
};

const recommendationClass = {
  high: 'steady',
  watch: 'watch',
  avoid: 'avoid',
};

const statusText = {
  finished: '已完场',
  live: '进行中',
  pending: '待确认',
  scheduled: '待开赛',
};

function formatOdds(odds?: Odds) {
  if (!odds) return ['--', '--', '--'];
  return [odds.home.toFixed(2), odds.draw.toFixed(2), odds.away.toFixed(2)];
}

function getOneXTwoTip(match: MatchPrediction) {
  if (match.prediction.includes('平')) return 'X';
  if (match.prediction.includes('客')) return '2';
  if (match.prediction.includes('小')) return '观察';
  return '1';
}

function getGoalsTip(match: MatchPrediction) {
  if (match.totalGoals.includes('小') || match.prediction.includes('小比分')) return '小 2.5';
  if (match.totalGoals.includes('大')) return '大 2.5';
  return match.confidence >= 72 ? '大 2.5' : '观察';
}

function getBestTip(match: MatchPrediction) {
  if (match.recommendation === 'avoid') return '回避';
  if (match.recommendation === 'watch') return 'WATCH';
  return match.prediction;
}

function groupByCompetition(matches: MatchPrediction[]) {
  const groups = new Map<string, MatchPrediction[]>();
  matches.forEach((match) => {
    const list = groups.get(match.competition) ?? [];
    list.push(match);
    groups.set(match.competition, list);
  });
  return Array.from(groups.entries()).map(([competition, groupMatches]) => ({
    competition,
    matches: groupMatches,
  }));
}

export function PredictionsTable({ matches, onOpenMatch }: PredictionsTableProps) {
  return (
    <section className="league-stack" aria-label="赛事预测表格">
      {groupByCompetition(matches).map((group) => (
        <article className="league-card" key={group.competition}>
          <header className="league-header">
            <div className="league-title">
              <span>🌐</span>
              <strong>{group.competition}</strong>
              <span className="league-meta">官方 SP 快照 / 模型方向</span>
            </div>
            <span className="league-count">{group.matches.length} 场比赛</span>
          </header>
          <div className="table-scroll">
            <table className="responsive-table" aria-label={`${group.competition}预测表`}>
              <thead>
                <tr>
                  <th>时间 / 状态</th>
                  <th>对阵双方</th>
                  <th>胜平负 / 让球</th>
                  <th>1X2</th>
                  <th>总进球</th>
                  <th>BEST</th>
                  <th>可信度</th>
                  <th aria-label="操作" />
                </tr>
              </thead>
              <tbody>
                {group.matches.map((match) => {
                  const [homeOdds, drawOdds, awayOdds] = formatOdds(match.odds);
                  const [handicapHome, handicapDraw, handicapAway] = formatOdds(match.handicapOdds);
                  const signalClass = recommendationClass[match.recommendation];

                  return (
                    <tr className="match-row" key={match.id} onClick={() => onOpenMatch(match)}>
                      <td data-label="时间 / 状态">
                        <div className="time-stack">
                          <span className="kickoff-time">{match.date} {match.kickoff}</span>
                          <span className={match.status === 'live' ? 'badge badge-live' : 'badge'}>
                            {statusText[match.status ?? 'scheduled']}
                          </span>
                          {match.matchNo ? <span className="status-note">{match.matchNo}</span> : null}
                        </div>
                      </td>
                      <td data-label="对阵双方">
                        <div className="team-stack">
                          <div className="team-line">
                            <TeamBadge code={match.homeFlag} name={match.homeTeam} />
                          </div>
                          <div className="team-line">
                            <TeamBadge code={match.awayFlag} name={match.awayTeam} />
                          </div>
                          <div className="match-signal-line">
                            <span className={`signal-badge is-${signalClass}`}>
                              {recommendationText[match.recommendation]}
                            </span>
                            {match.tags.length ? <span className="signal-risk-count">风险 {match.tags.length}</span> : null}
                          </div>
                        </div>
                      </td>
                      <td data-label="胜平负 / 让球">
                        <div className="sporttery-pool-stack">
                          <div className="sporttery-pool-head">
                            <span>让球</span>
                            <span>胜</span>
                            <span>平</span>
                            <span>负</span>
                            <span>支持率</span>
                          </div>
                          <div className="sporttery-pool-row">
                            <span className="pool-line">0</span>
                            <strong>{homeOdds}</strong>
                            <strong>{drawOdds}</strong>
                            <strong>{awayOdds}</strong>
                            <span className="pool-prob">
                              {match.probabilities.home}/{match.probabilities.draw}/{match.probabilities.away}%
                            </span>
                          </div>
                          <div className="sporttery-pool-row">
                            <span className="pool-line">{match.handicapOdds?.line ?? match.handicap}</span>
                            <strong>{handicapHome}</strong>
                            <strong>{handicapDraw}</strong>
                            <strong>{handicapAway}</strong>
                            <span className="pool-prob">{match.handicap}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="1X2">
                        <div className={`prediction-cell is-${signalClass}`}>
                          <span className="prediction-tip">{getOneXTwoTip(match)}</span>
                          <span className="prediction-odds">SP {homeOdds}</span>
                        </div>
                      </td>
                      <td data-label="总进球">
                        <div className="prediction-cell is-premium">
                          <span className="prediction-tip">{getGoalsTip(match)}</span>
                          <span className="prediction-odds">PRO</span>
                        </div>
                      </td>
                      <td data-label="BEST">
                        <div className={`prediction-cell is-${signalClass}`}>
                          <span className="prediction-tip">{getBestTip(match)}</span>
                          <span className="prediction-odds">{match.riskLevel === 'high' ? '高风险' : '模型首选'}</span>
                        </div>
                      </td>
                      <td data-label="可信度">
                        <div className="trust-meter" style={{ '--trust': `${match.confidence}%` } as React.CSSProperties}>
                          <span className="trust-value">{match.confidence}%</span>
                          <span className="trust-bar">
                            <span />
                          </span>
                        </div>
                      </td>
                      <td className="match-action-cell">
                        <button
                          aria-label={`查看 ${match.homeTeam} vs ${match.awayTeam}`}
                          className="details-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenMatch(match);
                          }}
                          type="button"
                        >
                          详情
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </section>
  );
}
