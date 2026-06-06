const fifaToIso = {
  ARG: 'ar',
  AUS: 'au',
  BEL: 'be',
  BIH: 'ba',
  BRA: 'br',
  CAN: 'ca',
  CHN: 'cn',
  COL: 'co',
  ENG: 'gb',
  FRA: 'fr',
  GER: 'de',
  IRL: 'ie',
  JPN: 'jp',
  KOR: 'kr',
  MEX: 'mx',
  POR: 'pt',
  ROU: 'ro',
  SUI: 'ch',
  SVK: 'sk',
  TUN: 'tn',
  TUR: 'tr',
  USA: 'us',
};

const teamNameToIso = {
  阿根廷: 'ar',
  澳大利亚: 'au',
  巴西: 'br',
  比利时: 'be',
  波黑: 'ba',
  德国: 'de',
  法国: 'fr',
  哥伦比亚: 'co',
  加拿大: 'ca',
  韩国: 'kr',
  罗马尼亚: 'ro',
  摩洛哥: 'ma',
  墨西哥: 'mx',
  葡萄牙: 'pt',
  日本: 'jp',
  瑞士: 'ch',
  斯洛伐克: 'sk',
  突尼斯: 'tn',
  土耳其: 'tr',
  英格兰: 'gb',
  美国: 'us',
};

export function normalizeSportteryRow({ row, capturedAt }) {
  const matchId = text(row.matchId || row.id || row.matchNo || row.matchNumStr);
  const date = text(row.matchDate || row.businessDate || row.matchDateStr);
  const kickoff = normalizeKickoff(row.matchTime || row.matchTimeStr || row.startTime);
  const homeTeam = text(row.homeTeamAllName || row.homeTeamName || row.homeTeamAbbName);
  const awayTeam = text(row.awayTeamAllName || row.awayTeamName || row.awayTeamAbbName);
  const odds = extractPoolOdds(row, 'HAD');

  if (!matchId || !date || !kickoff || !homeTeam || !awayTeam || !odds) {
    return null;
  }

  const handicapPool = extractPoolOdds(row, 'HHAD');
  const probabilities = impliedProbabilities(odds);
  const strongest = strongestOutcome(probabilities);
  const confidence = confidenceFromProbabilities(probabilities);
  const recommendation = recommendationFromConfidence(confidence);
  const riskLevel = riskFromConfidence(confidence);
  const prediction = predictionText(strongest);

  return {
    id: `sporttery_${matchId}`,
    source: 'sporttery',
    sourceMatchId: matchId,
    capturedAt,
    date,
    kickoff,
    competition: text(row.leagueName || row.leagueAbbName || row.matchName, '竞彩赛事'),
    homeTeam,
    awayTeam,
    homeFlag: isoFromTeam(homeTeam, row.homeTeamCode),
    awayFlag: isoFromTeam(awayTeam, row.awayTeamCode),
    odds,
    prediction,
    recommendation,
    confidence,
    riskLevel,
    tags: buildTags(row, handicapPool),
    analysis: buildAnalysis({ homeTeam, awayTeam, strongest, confidence, odds }),
    probabilities,
    handicap: handicapPool?.line ? `让球 ${handicapPool.line}` : '无让球参考',
    totalGoals: totalGoalsText(probabilities),
    result: statusFromRow(row),
  };
}

export function extractRowsFromPayload(payload) {
  const rows = [];
  const matchInfoList = payload?.value?.matchInfoList;
  if (Array.isArray(matchInfoList)) {
    for (const day of matchInfoList) {
      if (Array.isArray(day?.subMatchList)) rows.push(...day.subMatchList);
      if (Array.isArray(day?.matchList)) rows.push(...day.matchList);
    }
  }
  if (Array.isArray(payload?.value?.list)) rows.push(...payload.value.list);
  if (Array.isArray(payload?.value)) rows.push(...payload.value);
  if (Array.isArray(payload?.data)) rows.push(...payload.data);
  return rows;
}

function extractPoolOdds(row, poolCode) {
  const upper = poolCode.toUpperCase();
  const oddsList = Array.isArray(row.oddsList) ? row.oddsList : [];
  const pool =
    oddsList.find((item) => text(item.poolCode).toUpperCase() === upper) ||
    row[upper.toLowerCase()] ||
    (upper === 'HAD' && row.h && row.d && row.a ? row : null);

  if (!pool) return null;

  const home = toNumber(pool.h ?? pool.odds1);
  const draw = toNumber(pool.d ?? pool.oddsX);
  const away = toNumber(pool.a ?? pool.odds2);
  if (!validOdds(home) || !validOdds(draw) || !validOdds(away)) return null;

  return {
    home,
    draw,
    away,
    line: text(pool.goalLine || pool.goalLineValue || row.goalLine),
  };
}

function impliedProbabilities(odds) {
  const homeInv = 1 / odds.home;
  const drawInv = 1 / odds.draw;
  const awayInv = 1 / odds.away;
  const total = homeInv + drawInv + awayInv;
  return {
    home: Math.round((homeInv / total) * 100),
    draw: Math.round((drawInv / total) * 100),
    away: Math.round((awayInv / total) * 100),
  };
}

function strongestOutcome(probabilities) {
  const entries = [
    ['home', probabilities.home],
    ['draw', probabilities.draw],
    ['away', probabilities.away],
  ].sort((left, right) => right[1] - left[1]);
  return entries[0][0];
}

function confidenceFromProbabilities(probabilities) {
  const values = [probabilities.home, probabilities.draw, probabilities.away].sort((a, b) => b - a);
  return clamp(Math.round(48 + values[0] * 0.72 + (values[0] - values[1]) * 0.45), 42, 88);
}

function recommendationFromConfidence(confidence) {
  if (confidence >= 72) return 'high';
  if (confidence >= 58) return 'watch';
  return 'avoid';
}

function riskFromConfidence(confidence) {
  if (confidence >= 72) return 'low';
  if (confidence >= 60) return 'medium';
  return 'high';
}

function predictionText(outcome) {
  if (outcome === 'home') return '主胜方向';
  if (outcome === 'away') return '客胜方向';
  return '平局保护';
}

function totalGoalsText(probabilities) {
  const balance = Math.abs(probabilities.home - probabilities.away);
  if (probabilities.draw >= 30 && balance <= 12) return '小 2.5';
  if (Math.max(probabilities.home, probabilities.away) >= 55) return '大 2.5';
  return '2-3 球';
}

function buildTags(row, handicapPool) {
  const tags = ['竞彩官方'];
  if (handicapPool) tags.push('含让球盘');
  if (text(row.matchNumStr)) tags.push(text(row.matchNumStr));
  return tags;
}

function buildAnalysis({ homeTeam, awayTeam, strongest, confidence, odds }) {
  const leader = strongest === 'home' ? homeTeam : strongest === 'away' ? awayTeam : '平局方向';
  return `基于竞彩胜平负赔率 ${odds.home}/${odds.draw}/${odds.away}，模型暂时倾向 ${leader}，可信度 ${confidence}%。真实临场仍需结合首发和盘口变化。`;
}

function statusFromRow(row) {
  const status = text(row.matchStatus || row.status || row.statusName).toLowerCase();
  if (status.includes('finish') || status.includes('result') || status.includes('完')) return 'pending';
  return 'pending';
}

function isoFromTeam(teamName, teamCode) {
  return fifaToIso[text(teamCode).toUpperCase()] || teamNameToIso[text(teamName)] || undefined;
}

function normalizeKickoff(value) {
  const raw = text(value);
  const match = raw.match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const trimmed = String(value).trim();
  return trimmed || fallback;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validOdds(value) {
  return Number.isFinite(value) && value > 1.01;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
