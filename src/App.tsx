import { useEffect, useMemo, useState } from 'react';
import { BetSlipPanel } from './components/BetSlipPanel';
import { DateFilters } from './components/DateFilters';
import { EmptyState } from './components/EmptyState';
import { HitChallenge } from './components/HitChallenge';
import { MatchCard } from './components/MatchCard';
import { MatchDetailModal } from './components/MatchDetailModal';
import { Navbar } from './components/Navbar';
import { NoticeBar } from './components/NoticeBar';
import { SummaryGrid } from './components/SummaryGrid';
import { SyncPanel } from './components/SyncPanel';
import { WorldCupSpotlight } from './components/WorldCupSpotlight';
import {
  calculateDashboardMetrics,
  filterMatchesByDate,
  getDateOptions,
  groupRecommendations,
} from './services/dashboard';
import { loadDashboardData } from './services/dataLoader';
import type { DashboardData, MatchPrediction } from './types';
import './index.css';

const today = '2026-06-06';

export default function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeView, setActiveView] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMatch, setSelectedMatch] = useState<MatchPrediction | null>(null);

  useEffect(() => {
    let mounted = true;

    void loadDashboardData().then((data) => {
      if (mounted) {
        setDashboardData(data);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const matches = useMemo(() => dashboardData?.matches ?? [], [dashboardData]);
  const syncMeta = dashboardData?.syncMeta;
  const filteredMatches = useMemo(() => filterMatchesByDate(matches, selectedDate), [matches, selectedDate]);
  const metrics = useMemo(() => calculateDashboardMetrics(matches, selectedDate), [matches, selectedDate]);
  const groups = useMemo(() => groupRecommendations(filteredMatches), [filteredMatches]);
  const dateOptions = useMemo(() => getDateOptions(matches, today), [matches]);
  const featuredMatch = filteredMatches[0] ?? matches[0] ?? null;

  const showDashboard = activeView === 'overview' || activeView === 'predictions';

  return (
    <div className="app-shell">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      <main>
        <NoticeBar />
        {!dashboardData || !syncMeta || !featuredMatch ? <section className="empty-state">数据加载中...</section> : null}
        {showDashboard && dashboardData && syncMeta && featuredMatch ? (
          <>
            <WorldCupSpotlight featuredMatch={featuredMatch} onOpenMatch={setSelectedMatch} />
            <SummaryGrid groups={groups} metrics={metrics} />
            <SyncPanel meta={syncMeta} />
            <DateFilters
              onSelectDate={setSelectedDate}
              options={dateOptions}
              selectedDate={selectedDate}
            />
            <section className="match-grid" aria-label="赛事预测列表">
              {filteredMatches.length ? (
                filteredMatches.map((match) => (
                  <MatchCard key={match.id} match={match} onOpen={setSelectedMatch} />
                ))
              ) : (
                <EmptyState />
              )}
            </section>
          </>
        ) : null}
        {activeView === 'worldcup' && featuredMatch ? (
          <WorldCupSpotlight featuredMatch={featuredMatch} onOpenMatch={setSelectedMatch} />
        ) : null}
        {activeView === 'betslip' ? <BetSlipPanel matches={matches} /> : null}
        {activeView === 'challenge' ? <HitChallenge matches={matches} /> : null}
      </main>
      <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </div>
  );
}
