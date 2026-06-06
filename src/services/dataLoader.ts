import { matches as fallbackMatches } from '../data/matches';
import { syncMeta as fallbackSyncMeta } from '../data/syncMeta';
import type { DashboardData, MatchPrediction, SyncMeta } from '../types';

const fallbackData: DashboardData = {
  matches: fallbackMatches,
  syncMeta: {
    ...fallbackSyncMeta,
    mode: 'fallback',
  },
};

export async function loadDashboardData(): Promise<DashboardData> {
  if (window.location.protocol === 'file:') {
    return fallbackData;
  }

  try {
    return await loadFromGeneratedJson();
  } catch {
    return fallbackData;
  }
}

async function loadFromGeneratedJson(): Promise<DashboardData> {
  const basePaths = ['./data', '/data', '/football-insight-dashboard/data'];

  for (const basePath of basePaths) {
    const data = await tryLoadPath(basePath);
    if (data) {
      return data;
    }
  }

  return fallbackData;
}

async function tryLoadPath(basePath: string): Promise<DashboardData | null> {
  const [matchesResponse, syncResponse] = await Promise.all([
    fetch(`${basePath}/matches-current.json`),
    fetch(`${basePath}/sync-meta.json`),
  ]);

  if (!matchesResponse.ok || !syncResponse.ok) {
    return null;
  }

  const matches = (await matchesResponse.json()) as MatchPrediction[];
  const syncMeta = (await syncResponse.json()) as SyncMeta;

  if (!Array.isArray(matches) || matches.length === 0) {
    return null;
  }

  return {
    matches,
    syncMeta: {
      ...syncMeta,
      mode: 'generated',
    },
  };
}
