import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractRowsFromPayload, normalizeSportteryRow } from './sportteryTransform.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDataDir = path.join(rootDir, 'public', 'data');
const sportteryBase = 'https://webapi.sporttery.cn';
const sources = [
  `${sportteryBase}/gateway/uniform/football/getMatchListV1.qry?clientCode=3001`,
  `${sportteryBase}/gateway/jc/football/getMatchCalculatorV1.qry?poolCode=hhad,had&channel=c`,
];

async function main() {
  await fs.mkdir(publicDataDir, { recursive: true });
  const capturedAt = new Date().toISOString();
  const existing = await readExistingData();

  let rows = [];
  const sourceResults = [];

  for (const url of sources) {
    try {
      const payload = await fetchJson(url);
      const extracted = extractRowsFromPayload(payload);
      rows = rows.concat(extracted);
      sourceResults.push({ url, ok: true, rows: extracted.length });
    } catch (error) {
      sourceResults.push({ url, ok: false, error: error.message || String(error) });
    }
  }

  const matches = dedupeMatches(
    rows
      .map((row) => normalizeSportteryRow({ row, capturedAt }))
      .filter(Boolean),
  );

  if (!matches.length) {
    if (existing.current.length || existing.history.length) {
      await writeSyncMeta({
        generatedAt: capturedAt,
        sourceLabel: 'sporttery-fallback',
        currentCount: existing.current.length,
        historyCount: existing.history.length,
        status: 'Sporttery 同步失败，已保留上一次可用 JSON 数据。',
        mode: 'generated',
        sourceResults,
      });
      console.log(JSON.stringify({ ok: true, fallback: true, sourceResults }, null, 2));
      return;
    }

    throw new Error(`Sporttery returned no usable matches: ${JSON.stringify(sourceResults)}`);
  }

  const { current, history } = splitMatches(matches);
  await writeJson(path.join(publicDataDir, 'matches-current.json'), current);
  await writeJson(path.join(publicDataDir, 'matches-history.json'), history);
  await writeSyncMeta({
    generatedAt: capturedAt,
    sourceLabel: 'sporttery',
    currentCount: current.length,
    historyCount: history.length,
    status: '已从中国体育彩票竞彩接口同步赛程与赔率。',
    mode: 'generated',
    sourceResults,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        source: 'sporttery',
        current: current.length,
        history: history.length,
        scannedRows: rows.length,
        sourceResults,
      },
      null,
      2,
    ),
  );
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Origin: 'https://www.sporttery.cn',
      Referer: 'https://www.sporttery.cn/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`${url} -> HTTP ${response.status}`);
  }

  return response.json();
}

async function readExistingData() {
  const [current, history] = await Promise.all([
    readJsonArray('matches-current.json'),
    readJsonArray('matches-history.json'),
  ]);
  return { current, history };
}

async function readJsonArray(file) {
  try {
    const parsed = JSON.parse(await fs.readFile(path.join(publicDataDir, file), 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function dedupeMatches(matches) {
  const byId = new Map();
  for (const match of matches) {
    const existing = byId.get(match.id);
    if (!existing || scoreMatch(match) > scoreMatch(existing)) {
      byId.set(match.id, match);
    }
  }
  return Array.from(byId.values()).sort((left, right) => {
    const byDate = left.date.localeCompare(right.date);
    if (byDate !== 0) return byDate;
    return left.kickoff.localeCompare(right.kickoff);
  });
}

function scoreMatch(match) {
  return (match.odds ? 10 : 0) + (match.tags.includes('含让球盘') ? 3 : 0);
}

function splitMatches(matches) {
  return {
    current: matches.filter((match) => match.result !== 'hit' && match.result !== 'miss'),
    history: matches.filter((match) => match.result === 'hit' || match.result === 'miss'),
  };
}

async function writeSyncMeta(payload) {
  await writeJson(path.join(publicDataDir, 'sync-meta.json'), payload);
}

async function writeJson(file, payload) {
  await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
