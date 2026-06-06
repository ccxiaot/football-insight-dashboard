export type RecommendationLevel = 'high' | 'watch' | 'avoid';

export type RiskLevel = 'low' | 'medium' | 'high';

export type MatchResult = 'hit' | 'miss' | 'pending';

export type Odds = {
  home: number;
  draw: number;
  away: number;
};

export type ProbabilityBreakdown = {
  home: number;
  draw: number;
  away: number;
};

export type MatchPrediction = {
  id: string;
  date: string;
  kickoff: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag?: string;
  awayFlag?: string;
  odds?: Odds;
  prediction: string;
  recommendation: RecommendationLevel;
  confidence: number;
  riskLevel: RiskLevel;
  tags: string[];
  analysis: string;
  probabilities: ProbabilityBreakdown;
  handicap: string;
  totalGoals: string;
  result?: MatchResult;
};

export type SyncMeta = {
  generatedAt: string;
  sourceLabel: string;
  currentCount: number;
  historyCount: number;
  status: string;
  mode?: 'generated' | 'fallback';
};

export type DashboardData = {
  matches: MatchPrediction[];
  syncMeta: SyncMeta;
};

export type DashboardMetrics = {
  filteredCount: number;
  completedCount: number;
  hitRate: number;
  averageConfidence: number;
  totalCount: number;
};

export type RecommendationGroups = Record<RecommendationLevel, number>;

export type DateOption = {
  date: string;
  label: string;
  display: string;
};
