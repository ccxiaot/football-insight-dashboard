import { Activity, BadgePercent, CalendarSearch, Globe2, Target, Trophy } from 'lucide-react';

type NavbarProps = {
  activeView: string;
  onViewChange: (view: string) => void;
};

const items = [
  { id: 'overview', label: '赛前观察', icon: CalendarSearch },
  { id: 'predictions', label: '赛事预测', icon: Activity },
  { id: 'worldcup', label: '世界杯', icon: Globe2 },
  { id: 'betslip', label: '投注单', icon: BadgePercent },
  { id: 'challenge', label: '命中挑战', icon: Target },
];

export function Navbar({ activeView, onViewChange }: NavbarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Trophy size={20} />
        </div>
        <div>
          <h1>足球洞察看板</h1>
          <p>静态演示 · AI 预测工作台</p>
        </div>
      </div>
      <nav aria-label="主导航" className="nav-tabs">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              aria-pressed={activeView === item.id}
              className={activeView === item.id ? 'nav-tab active' : 'nav-tab'}
              key={item.id}
              onClick={() => onViewChange(item.id)}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
