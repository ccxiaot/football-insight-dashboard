import { Crown, Flag, Route, Shield, Sparkles, Trophy } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { MatchPrediction } from '../types';
import { TeamBadge } from './TeamBadge';

type WorldCupDeskProps = {
  matches: MatchPrediction[];
  onOpenMatch: (match: MatchPrediction) => void;
};

const groupForecasts = [
  { group: 'A 组', seed: '墨西哥', challenger: '丹麦', pressure: '东道主节奏稳定，第二名更看防线完整度。' },
  { group: 'B 组', seed: '阿根廷', challenger: '塞尔维亚', pressure: '强队控球优势明显，塞尔维亚需要避免早段丢球。' },
  { group: 'C 组', seed: '法国', challenger: '日本', pressure: '法国上限最高，日本适合做冷门和进球数观察。' },
  { group: 'D 组', seed: '英格兰', challenger: '乌拉圭', pressure: '英格兰阵容深度占优，乌拉圭淘汰赛经验更强。' },
];

const knockoutRoutes = [
  { stage: '16 强', focus: '高位压迫队伍优先避开南美反击组', risk: '点球和加时风险上升' },
  { stage: '8 强', focus: '强队之间看中场推进质量和边路防守', risk: '让球深盘需要保守处理' },
  { stage: '半决赛', focus: '阵容厚度、停赛累积和门将状态成为主变量', risk: '总进球倾向转向小球' },
  { stage: '决赛', focus: '冠军盘只保留两条路径，不做过宽分散', risk: '赛前 24 小时再确认主力名单' },
];

const contenders = [
  { team: '法国', score: 91, tag: '阵容天花板', note: '锋线爆点和中后场厚度仍是最完整组合。' },
  { team: '阿根廷', score: 88, tag: '大赛稳定性', note: '节奏控制和关键球能力适合淘汰赛。' },
  { team: '英格兰', score: 85, tag: '深度充足', note: '纸面实力强，关键在临场调整速度。' },
  { team: '巴西', score: 84, tag: '进攻上限', note: '上限足够高，但防守转换需要持续复核。' },
];

const roadmap = [
  '小组赛：先按实力差和赛程密度建立首轮基准。',
  '第二轮：用积分压力修正让球盘和总进球方向。',
  '第三轮：区分轮换、保平出线和必须抢分三类动机。',
  '淘汰赛：重点看伤停、停赛、体能和盘口是否反向。',
];

export function WorldCupDesk({ matches, onOpenMatch }: WorldCupDeskProps) {
  const watchMatches = matches
    .filter((match) => match.status !== 'finished')
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 6);
  const featuredMatch = watchMatches[0] ?? matches[0];

  return (
    <div className="worldcup-page">
      <section className="worldcup-hero-panel">
        <div>
          <span className="eyebrow">World Cup Desk</span>
          <h2>2026 世界杯专题</h2>
          <p>
            用小组路径、淘汰赛分支、冠军候选和当前观察场次搭一个完整演示工作台。这里先给出静态框架，
            后续可以继续接入真实赛程、积分和赔率更新。
          </p>
          <div className="worldcup-kpi-grid">
            <span><Trophy size={16} /> 48 队扩军</span>
            <span><Route size={16} /> 12 组路径</span>
            <span><Shield size={16} /> 4 档风险</span>
            <span><Sparkles size={16} /> 冠军池跟踪</span>
          </div>
        </div>
        {featuredMatch ? (
          <button className="worldcup-featured-match" onClick={() => onOpenMatch(featuredMatch)} type="button">
            <small>世界杯观察焦点</small>
            <div className="featured-teams">
              <TeamBadge code={featuredMatch.homeFlag} name={featuredMatch.homeTeam} />
              <strong>VS</strong>
              <TeamBadge code={featuredMatch.awayFlag} name={featuredMatch.awayTeam} />
            </div>
            <b>{featuredMatch.prediction}</b>
            <span>可信度 {featuredMatch.confidence}% / {featuredMatch.totalGoals}</span>
          </button>
        ) : null}
      </section>

      <section className="worldcup-section">
        <div className="section-title">
          <span className="eyebrow">Group Forecast</span>
          <h2>小组路径预测</h2>
        </div>
        <div className="worldcup-group-grid">
          {groupForecasts.map((item) => (
            <article key={item.group}>
              <span><Flag size={16} /> {item.group}</span>
              <strong>{item.seed} / {item.challenger}</strong>
              <p>{item.pressure}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="worldcup-section split">
        <div>
          <div className="section-title">
            <span className="eyebrow">Knockout Route</span>
            <h2>淘汰赛路径</h2>
          </div>
          <div className="worldcup-route-list">
            {knockoutRoutes.map((route) => (
              <article key={route.stage}>
                <b>{route.stage}</b>
                <strong>{route.focus}</strong>
                <span>{route.risk}</span>
              </article>
            ))}
          </div>
        </div>
        <div>
          <div className="section-title">
            <span className="eyebrow">Title Pool</span>
            <h2>冠军候选观察</h2>
          </div>
          <div className="worldcup-contender-list">
            {contenders.map((item) => (
              <article key={item.team}>
                <div>
                  <Crown size={17} />
                  <strong>{item.team}</strong>
                  <em>{item.tag}</em>
                </div>
                <span style={{ '--score': `${item.score}%` } as CSSProperties} />
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="worldcup-section split">
        <div>
          <div className="section-title">
            <span className="eyebrow">Watch Pool</span>
            <h2>世界杯观察场次</h2>
          </div>
          <div className="worldcup-match-grid">
            {watchMatches.map((match) => (
              <button key={match.id} onClick={() => onOpenMatch(match)} type="button">
                <small>{match.kickoff} / {match.competition}</small>
                <strong>{match.homeTeam} vs {match.awayTeam}</strong>
                <span>{match.prediction} · {match.confidence}%</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="section-title">
            <span className="eyebrow">Prediction Pipeline</span>
            <h2>预测推进路线</h2>
          </div>
          <ol className="worldcup-roadmap">
            {roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
