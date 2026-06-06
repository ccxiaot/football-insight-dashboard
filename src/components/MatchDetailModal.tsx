import { X } from 'lucide-react';
import type { MatchPrediction } from '../types';
import { TeamBadge } from './TeamBadge';

type MatchDetailModalProps = {
  match: MatchPrediction | null;
  onClose: () => void;
};

const recommendationText = {
  high: '高可信候选',
  watch: '观察',
  avoid: '避坑',
};

const riskText = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

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

function buildScoreHeat(match: MatchPrediction) {
  const homeEdge = match.probabilities.home - match.probabilities.away;
  if (match.prediction.includes('小') || match.totalGoals.includes('小')) {
    return [
      { score: '1-0', probability: 15 },
      { score: '1-1', probability: 12 },
      { score: '0-0', probability: 10 },
    ];
  }
  if (homeEdge > 28) {
    return [
      { score: '2-0', probability: 14 },
      { score: '2-1', probability: 11 },
      { score: '3-1', probability: 8 },
    ];
  }
  if (homeEdge < -12) {
    return [
      { score: '0-1', probability: 13 },
      { score: '1-2', probability: 10 },
      { score: '1-1', probability: 9 },
    ];
  }
  return [
    { score: '1-1', probability: 14 },
    { score: '1-0', probability: 10 },
    { score: '0-1', probability: 9 },
  ];
}

function getMarketLead(match: MatchPrediction) {
  const values = [
    { label: '主胜', value: match.probabilities.home },
    { label: '平局', value: match.probabilities.draw },
    { label: '客胜', value: match.probabilities.away },
  ].sort((left, right) => right.value - left.value);
  return `${values[0].label}领先 ${Math.max(0, values[0].value - values[1].value).toFixed(0)} 个百分点`;
}

export function MatchDetailModal({ match, onClose }: MatchDetailModalProps) {
  if (!match) {
    return null;
  }

  const scoreHeat = buildScoreHeat(match);
  const predictionMarkets = [
    {
      market: '1X2',
      tip: getOneXTwoTip(match),
      odds: match.odds?.home ? `SP ${match.odds.home.toFixed(2)}` : 'SP 待更新',
      trust: match.confidence,
      note: '基于胜平负 SP、概率差距与推荐方向生成。',
    },
    {
      market: '总进球',
      tip: getGoalsTip(match),
      odds: 'PRO',
      trust: Math.max(48, match.confidence - 14),
      note: '由比分热区和总进球参考推导，演示为高级项。',
    },
    {
      market: 'BEST',
      tip: match.recommendation === 'avoid' ? '回避' : match.prediction,
      odds: match.riskLevel === 'high' ? '高风险' : '模型首选',
      trust: match.recommendation === 'high' ? match.confidence : Math.max(45, match.confidence - 8),
      note: recommendationText[match.recommendation],
    },
  ];

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
        <div className="detail-hero">
          <div>
            <span className={`chip ${match.recommendation}`}>{recommendationText[match.recommendation]}</span>
            <h2>{match.prediction}</h2>
            <p>{match.analysis}</p>
          </div>
          <div className="detail-score">
            <span>综合可信度</span>
            <strong>{match.confidence}%</strong>
            <em>{riskText[match.riskLevel]}</em>
          </div>
        </div>
        <h3>预测市场</h3>
        <div className="detail-market-grid">
          {predictionMarkets.map((item) => (
            <article className="detail-market-card" key={item.market}>
              <span>{item.market}</span>
              <strong>{item.tip}</strong>
              <small>{item.odds}</small>
              <div className="trust-bar">
                <span style={{ width: `${item.trust}%` }} />
              </div>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
        <h3>概率拆解</h3>
        <div className="prob-grid">
          <span>主胜 {match.probabilities.home}%</span>
          <span>平局 {match.probabilities.draw}%</span>
          <span>客胜 {match.probabilities.away}%</span>
        </div>
        <h3>模型深度解析</h3>
        <div className="detail-analysis-grid">
          <article>
            <span>市场权重</span>
            <strong>58%</strong>
            <p>以官方胜平负 SP 和让球盘为主轴，优先识别市场主线。</p>
          </article>
          <article>
            <span>强度快照</span>
            <strong>24%</strong>
            <p>{getMarketLead(match)}，结合主客队基本面做二次校验。</p>
          </article>
          <article>
            <span>比分分布</span>
            <strong>18%</strong>
            <p>用概率差与总进球倾向生成比分热区，避免只看单一 SP。</p>
          </article>
        </div>
        <h3>比分热区</h3>
        <div className="score-heat-list">
          {scoreHeat.map((item) => (
            <span key={item.score}>
              <strong>{item.score}</strong>
              {item.probability}%
            </span>
          ))}
        </div>
        <h3>风险复核</h3>
        <div className="risk-review">
          {(match.tags.length ? match.tags : ['临场首发', 'SP 波动', '让球盘复核']).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
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
