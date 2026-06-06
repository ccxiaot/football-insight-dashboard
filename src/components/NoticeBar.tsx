import { LockKeyhole } from 'lucide-react';

export function NoticeBar() {
  return (
    <section aria-label="演示模式提示" className="notice-bar">
      <LockKeyhole size={18} />
      <p>当前为本地演示版本，数据来自静态样例。后续可接入真实赛程、赔率同步和 AI 分析。</p>
      <button type="button">演示模式</button>
    </section>
  );
}
