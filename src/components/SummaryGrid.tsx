import type { DashboardMetrics, RecommendationGroups } from '../types';

type SummaryGridProps = {
  groups: RecommendationGroups;
  metrics: DashboardMetrics;
};

export function SummaryGrid({ groups, metrics }: SummaryGridProps) {
  const cards = [
    { label: '可结算命中率', value: `${metrics.hitRate}%`, note: `${metrics.completedCount} 场已结算` },
    { label: '当前筛选场次', value: metrics.filteredCount, note: `总样本 ${metrics.totalCount} 场` },
    { label: '推荐分组', value: `${groups.high}/${groups.watch}/${groups.avoid}`, note: '高信 / 观察 / 回避' },
    { label: '平均可信度', value: `${metrics.averageConfidence}%`, note: '按开赛时间排序' },
  ];

  return (
    <section className="summary-grid" aria-label="看板摘要">
      {cards.map((card) => (
        <article className="summary-card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.note}</small>
        </article>
      ))}
    </section>
  );
}
