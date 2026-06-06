import { LockKeyhole } from 'lucide-react';

export function NoticeBar() {
  return (
    <section aria-label="演示模式提示" className="notice-bar">
      <LockKeyhole size={18} />
      <p>当前已接入中国体育彩票竞彩赛程与 SP 快照；预测为赔率启发式模型，临场首发前仍需复核。</p>
      <button type="button">竞彩同步</button>
    </section>
  );
}
