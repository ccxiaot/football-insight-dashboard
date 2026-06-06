import { RefreshCw } from 'lucide-react';
import type { SyncMeta } from '../types';

type SyncPanelProps = {
  meta: SyncMeta;
};

export function SyncPanel({ meta }: SyncPanelProps) {
  const generated = new Date(meta.generatedAt).toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <section className="sync-panel" aria-label="数据同步">
      <div>
        <strong>
          <RefreshCw size={16} />
          数据同步
        </strong>
        <p>{meta.status}</p>
      </div>
      <dl>
        <div>
          <dt>当前赛程</dt>
          <dd>{meta.currentCount} 场</dd>
        </div>
        <div>
          <dt>历史库</dt>
          <dd>{meta.historyCount} 场</dd>
        </div>
        <div>
          <dt>数据源</dt>
          <dd>{meta.sourceLabel}</dd>
        </div>
        <div>
          <dt>更新时间</dt>
          <dd>{generated}</dd>
        </div>
      </dl>
    </section>
  );
}
