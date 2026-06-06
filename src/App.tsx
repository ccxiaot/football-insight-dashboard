import { useEffect, useMemo, useState } from 'react';
import { BetSlipPanel } from './components/BetSlipPanel';
import { DateFilters } from './components/DateFilters';
import { EmptyState } from './components/EmptyState';
import { HitChallenge } from './components/HitChallenge';
import { MatchDetailModal } from './components/MatchDetailModal';
import { MatchToolbar } from './components/MatchToolbar';
import { Navbar } from './components/Navbar';
import { NoticeBar } from './components/NoticeBar';
import { PreMatchOverview } from './components/PreMatchOverview';
import { PredictionsTable } from './components/PredictionsTable';
import { SummaryGrid } from './components/SummaryGrid';
import { SyncPanel } from './components/SyncPanel';
import { WorldCupDesk } from './components/WorldCupDesk';
import { WorldCupSpotlight } from './components/WorldCupSpotlight';
import {
  calculateDashboardMetrics,
  countByStatus,
  filterMatches,
  filterMatchesByDate,
  getCompetitionOptions,
  getDateOptions,
  groupRecommendations,
  sortMatches,
  type MatchSortKey,
} from './services/dashboard';
import { loadDashboardData } from './services/dataLoader';
import type { DashboardData, MatchPrediction, RecommendationLevel } from './types';
import './index.css';

const today = '2026-06-06';

export default function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeView, setActiveView] = useState('overview');
  const [selectedDate, setSelectedDate] = useState('all');
  const [competition, setCompetition] = useState('全部赛事');
  const [recommendation, setRecommendation] = useState<'all' | RecommendationLevel>('all');
  const [sortKey, setSortKey] = useState<MatchSortKey>('kickoff');
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
  const dateMatches = useMemo(() => filterMatchesByDate(matches, selectedDate), [matches, selectedDate]);
  const filteredMatches = useMemo(
    () => sortMatches(filterMatches(dateMatches, { competition, recommendation }), sortKey),
    [competition, dateMatches, recommendation, sortKey],
  );
  const metrics = useMemo(() => calculateDashboardMetrics(filteredMatches, selectedDate), [filteredMatches, selectedDate]);
  const groups = useMemo(() => groupRecommendations(filteredMatches), [filteredMatches]);
  const dateOptions = useMemo(() => getDateOptions(matches, today), [matches]);
  const competitions = useMemo(() => getCompetitionOptions(dateMatches), [dateMatches]);
  const statusCounts = useMemo(() => countByStatus(matches), [matches]);
  const featuredMatch = filteredMatches[0] ?? matches[0] ?? null;

  return (
    <div className="app-shell">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      <main>
        <NoticeBar />
        {!dashboardData || !syncMeta || !featuredMatch ? <section className="empty-state">数据加载中...</section> : null}
        {activeView === 'overview' && dashboardData && syncMeta && featuredMatch ? (
          <PreMatchOverview
            featuredMatch={featuredMatch}
            groups={groups}
            matches={dateMatches}
            metrics={metrics}
            onOpenMatch={setSelectedMatch}
            statusCounts={statusCounts}
            syncMeta={syncMeta}
          />
        ) : null}
        {activeView === 'predictions' && dashboardData && syncMeta && featuredMatch ? (
          <div className="predictions-page">
            <WorldCupSpotlight featuredMatch={featuredMatch} onOpenMatch={setSelectedMatch} />
            <SummaryGrid groups={groups} metrics={metrics} />
            <SyncPanel meta={syncMeta} statusCounts={statusCounts} />
            <DateFilters
              onSelectDate={setSelectedDate}
              options={dateOptions}
              selectedDate={selectedDate}
            />
            <MatchToolbar
              competition={competition}
              competitions={competitions}
              counts={{
                all: dateMatches.length,
                high: groupRecommendations(dateMatches).high,
                watch: groupRecommendations(dateMatches).watch,
                avoid: groupRecommendations(dateMatches).avoid,
              }}
              onCompetitionChange={setCompetition}
              onRecommendationChange={setRecommendation}
              onReset={() => {
                setCompetition('全部赛事');
                setRecommendation('all');
                setSortKey('kickoff');
              }}
              onSortChange={setSortKey}
              recommendation={recommendation}
              sortKey={sortKey}
            />
            {filteredMatches.length ? (
              <PredictionsTable matches={filteredMatches} onOpenMatch={setSelectedMatch} />
            ) : (
              <EmptyState />
            )}
          </div>
        ) : null}
        {activeView === 'worldcup' && featuredMatch ? (
          <WorldCupDesk matches={matches} onOpenMatch={setSelectedMatch} />
        ) : null}
        {activeView === 'betslip' ? <BetSlipPanel matches={matches} /> : null}
        {activeView === 'challenge' ? <HitChallenge matches={matches} /> : null}
      </main>
      <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </div>
  );
}
