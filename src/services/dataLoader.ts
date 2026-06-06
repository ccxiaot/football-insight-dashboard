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
    try {
      const data = await tryLoadPath(basePath);
      if (data) {
        return data;
      }
    } catch {
      // Keep trying the next static data base path.
    }
  }

  return fallbackData;
}

async function tryLoadPath(basePath: string): Promise<DashboardData | null> {
  const [matchesResponse, syncResponse] = await Promise.all([
    getJson(`${basePath}/matches-current.json`),
    getJson(`${basePath}/sync-meta.json`),
  ]);

  if (!matchesResponse || !syncResponse) {
    return null;
  }

  const matches = matchesResponse as MatchPrediction[];
  const syncMeta = syncResponse as SyncMeta;

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

async function getJson(url: string): Promise<unknown | null> {
  if (typeof window.fetch === 'function') {
    const response = await window.fetch(url);
    if (!response.ok) {
      return null;
    }
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json';
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        resolve(null);
        return;
      }
      try {
        resolve(request.response ?? JSON.parse(request.responseText));
      } catch {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
    request.send();
  });
}
