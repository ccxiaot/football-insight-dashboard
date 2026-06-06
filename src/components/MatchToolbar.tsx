import type { MatchSortKey } from '../services/dashboard';
import type { RecommendationLevel } from '../types';

type MatchToolbarProps = {
  competitions: string[];
  competition: string;
  recommendation: 'all' | RecommendationLevel;
  sortKey: MatchSortKey;
  counts: {
    all: number;
    high: number;
    watch: number;
    avoid: number;
  };
  onCompetitionChange: (competition: string) => void;
  onRecommendationChange: (recommendation: 'all' | RecommendationLevel) => void;
  onSortChange: (sortKey: MatchSortKey) => void;
  onReset: () => void;
};

const recommendations: Array<{ key: 'all' | RecommendationLevel; label: string }> = [
  { key: 'all', label: '全部分组' },
  { key: 'high', label: '高信' },
  { key: 'watch', label: '观察' },
  { key: 'avoid', label: '避坑' },
];

const sortOptions: Array<{ key: MatchSortKey; label: string }> = [
  { key: 'kickoff', label: '开赛时间' },
  { key: 'confidence', label: '可信度' },
  { key: 'odds', label: 'SP 值' },
];

export function MatchToolbar({
  competitions,
  competition,
  recommendation,
  sortKey,
  counts,
  onCompetitionChange,
  onRecommendationChange,
  onSortChange,
  onReset,
}: MatchToolbarProps) {
  return (
    <section className="match-toolbar" aria-label="赛事筛选">
      <div>
        <strong>赛事筛选</strong>
        <div className="toolbar-row">
          {competitions.map((item) => (
            <button
              aria-pressed={competition === item}
              className={competition === item ? 'filter-chip active' : 'filter-chip'}
              key={item}
              onClick={() => onCompetitionChange(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div>
        <strong>推荐分组</strong>
        <div className="toolbar-row">
          {recommendations.map((item) => (
            <button
              aria-pressed={recommendation === item.key}
              className={recommendation === item.key ? 'filter-chip active' : 'filter-chip'}
              key={item.key}
              onClick={() => onRecommendationChange(item.key)}
              type="button"
            >
              {item.label}
              <span>{item.key === 'all' ? counts.all : counts[item.key]}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <strong>排序</strong>
        <div className="toolbar-row">
          {sortOptions.map((item) => (
            <button
              aria-pressed={sortKey === item.key}
              className={sortKey === item.key ? 'filter-chip active' : 'filter-chip'}
              key={item.key}
              onClick={() => onSortChange(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
          <button className="filter-chip" onClick={onReset} type="button">
            重置
          </button>
        </div>
      </div>
    </section>
  );
}
