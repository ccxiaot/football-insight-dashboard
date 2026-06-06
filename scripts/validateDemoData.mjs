import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(rootDir, 'public', 'data');

const requiredMatchFields = [
  'id',
  'date',
  'kickoff',
  'competition',
  'homeTeam',
  'awayTeam',
  'prediction',
  'recommendation',
  'confidence',
  'riskLevel',
  'analysis',
  'probabilities',
  'handicap',
  'totalGoals',
];

async function readJson(file) {
  return JSON.parse(await fs.readFile(path.join(dataDir, file), 'utf8'));
}

function validateMatch(match, index, file) {
  for (const field of requiredMatchFields) {
    if (match[field] === undefined || match[field] === null || match[field] === '') {
      throw new Error(`${file}[${index}] missing ${field}`);
    }
  }
  if (!['high', 'watch', 'avoid'].includes(match.recommendation)) {
    throw new Error(`${file}[${index}] invalid recommendation`);
  }
  if (!['low', 'medium', 'high'].includes(match.riskLevel)) {
    throw new Error(`${file}[${index}] invalid riskLevel`);
  }
  if (!Number.isFinite(match.confidence) || match.confidence < 0 || match.confidence > 100) {
    throw new Error(`${file}[${index}] invalid confidence`);
  }
}

async function main() {
  const current = await readJson('matches-current.json');
  const history = await readJson('matches-history.json');
  const syncMeta = await readJson('sync-meta.json');

  if (!Array.isArray(current) || !Array.isArray(history)) {
    throw new Error('match files must be arrays');
  }

  current.forEach((match, index) => validateMatch(match, index, 'matches-current.json'));
  history.forEach((match, index) => validateMatch(match, index, 'matches-history.json'));

  if (syncMeta.currentCount !== current.length) {
    throw new Error('sync-meta currentCount does not match current file');
  }
  if (syncMeta.historyCount !== history.length) {
    throw new Error('sync-meta historyCount does not match history file');
  }

  console.log(JSON.stringify({ ok: true, current: current.length, history: history.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
