import { GameMode, GameModeConfig, ScoreHistoryItem, CareerStats, GameScore } from '../types/game';

export const MODE_ORDER: GameMode[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  beginner: {
    id: 'beginner',
    name: 'Novice',
    badge: 'NOVICE',
    tagline: 'Gentle speed & wide obstacle gaps',
    description: 'Forgiving reaction windows with slower starting velocity and wider obstacle spacing. 0.8x score.',
    baseSpeed: 5.2,
    maxSpeed: 10.5,
    minGapFactor: 1.35,
    scoreMultiplier: 0.8,
    color: 'emerald',
    accentHex: '#10B981',
  },
  intermediate: {
    id: 'intermediate',
    name: 'Balanced',
    badge: 'BALANCED',
    tagline: 'Classic cyber tempo & standard obstacles',
    description: 'The balanced runner experience. Standard pacing, classic hazard patterns, and 1.0x score.',
    baseSpeed: 6.8,
    maxSpeed: 14.5,
    minGapFactor: 1.0,
    scoreMultiplier: 1.0,
    color: 'cyan',
    accentHex: '#06B6D4',
  },
  advanced: {
    id: 'advanced',
    name: 'Veteran',
    badge: 'VETERAN',
    tagline: 'High velocity & rapid hazards (+50% score)',
    description: 'Accelerated track velocity and closer obstacle clusters. Demands keen anticipation. 1.5x score bonus.',
    baseSpeed: 8.5,
    maxSpeed: 17.5,
    minGapFactor: 0.82,
    scoreMultiplier: 1.5,
    color: 'amber',
    accentHex: '#F59E0B',
  },
  expert: {
    id: 'expert',
    name: 'Hyperdrive',
    badge: 'HYPERDRIVE',
    tagline: 'Blistering hyper speed & razor timing (2.0x score)',
    description: 'Extreme kinetic velocity with relentless hazard density. Requires frame-perfect reflex timing. 2.0x score bonus.',
    baseSpeed: 10.5,
    maxSpeed: 21.0,
    minGapFactor: 0.70,
    scoreMultiplier: 2.0,
    color: 'rose',
    accentHex: '#F43F5E',
  },
};

const MODE_STORAGE_KEY = 'voltfox_selected_mode';
const HISTORY_STORAGE_KEY = 'voltfox_score_history';

// Clear legacy persistent mode so Balanced is always active by default on load
try {
  localStorage.removeItem(MODE_STORAGE_KEY);
} catch {
  // fallback
}

export function getStoredMode(): GameMode {
  try {
    const saved = sessionStorage.getItem(MODE_STORAGE_KEY);
    if (saved && saved in GAME_MODES) {
      return saved as GameMode;
    }
  } catch {
    // fallback
  }
  return 'intermediate';
}

export function setStoredMode(mode: GameMode): void {
  try {
    sessionStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // fallback
  }
}

export function getScoreHistory(): ScoreHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveScoreRecord(score: GameScore, mode: GameMode): ScoreHistoryItem {
  const item: ScoreHistoryItem = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    score: score.score,
    distance: Math.floor(score.distance),
    shards: score.shards,
    mode,
  };

  try {
    const current = getScoreHistory();
    // Keep up to 25 recent runs
    const updated = [item, ...current].slice(0, 25);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));

    // Also update mode-specific highscore
    const modeKey = `voltfox_highscore_${mode}`;
    const prevModeHigh = parseInt(localStorage.getItem(modeKey) || '0', 10);
    if (score.score > prevModeHigh) {
      localStorage.setItem(modeKey, String(score.score));
    }

    // Also update overall highscore
    const overallHigh = parseInt(localStorage.getItem('voltfox_highscore') || '0', 10);
    if (score.score > overallHigh) {
      localStorage.setItem('voltfox_highscore', String(score.score));
    }
  } catch {
    // fallback
  }

  return item;
}

export function getCareerStats(): CareerStats {
  const history = getScoreHistory();
  let totalDistance = 0;
  let totalShards = 0;
  let bestOverall = 0;
  const bestByMode: Record<GameMode, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  };

  try {
    const overallSaved = parseInt(localStorage.getItem('voltfox_highscore') || '0', 10);
    bestOverall = overallSaved;

    (['beginner', 'intermediate', 'advanced', 'expert'] as GameMode[]).forEach((m) => {
      const saved = parseInt(localStorage.getItem(`voltfox_highscore_${m}`) || '0', 10);
      bestByMode[m] = saved;
    });
  } catch {
    // fallback
  }

  history.forEach((h) => {
    totalDistance += h.distance;
    totalShards += h.shards;
    if (h.score > bestOverall) bestOverall = h.score;
    if (h.score > bestByMode[h.mode]) bestByMode[h.mode] = h.score;
  });

  return {
    totalRuns: history.length,
    totalDistance,
    totalShards,
    bestScoreOverall: bestOverall,
    bestScoresByMode: bestByMode,
  };
}

export function clearScoreHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // fallback
  }
}

export function getStoredHighScore(mode?: GameMode): number {
  try {
    if (mode) {
      const modeVal = parseInt(localStorage.getItem(`voltfox_highscore_${mode}`) || '0', 10);
      if (modeVal > 0) return modeVal;
    }
    return parseInt(localStorage.getItem('voltfox_highscore') || '0', 10);
  } catch {
    return 0;
  }
}
