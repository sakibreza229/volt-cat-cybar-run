/**
 * Scores & Player Records Modal
 * Displays high scores by mode, recent runs history, and career telemetry.
 */

import React, { useState, useEffect } from 'react';
import { X, Trophy, Navigation, Award, RotateCcw, Clock, Trash2 } from 'lucide-react';
import { ShardIcon } from './ShardIcon';
import { GameMode, ScoreHistoryItem, CareerStats } from '../types/game';
import { GAME_MODES, getCareerStats, getScoreHistory, clearScoreHistory } from '../game/modeConfig';

interface ScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHighScore: number;
}

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getPlayerRank(score: number): { title: string; color: string } {
  if (score >= 12000) return { title: 'APEX VOLT PHANTOM', color: '#F43F5E' };
  if (score >= 7000) return { title: 'SUB-LIGHT STRIKER', color: '#F59E0B' };
  if (score >= 3500) return { title: 'NEON RUNNER', color: '#06B6D4' };
  if (score >= 1000) return { title: 'CYBER CAT', color: '#10B981' };
  return { title: 'TRACK NOVICE', color: '#94A3B8' };
}

export const ScoresModal: React.FC<ScoresModalProps> = ({ isOpen, onClose, currentHighScore }) => {
  const [stats, setStats] = useState<CareerStats>(() => getCareerStats());
  const [history, setHistory] = useState<ScoreHistoryItem[]>(() => getScoreHistory());
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  // Refresh stats whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStats(getCareerStats());
      setHistory(getScoreHistory());
      setConfirmClear(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearScoreHistory();
    setHistory([]);
    setStats(getCareerStats());
    setConfirmClear(false);
  };

  const highestScore = Math.max(currentHighScore, stats.bestScoreOverall);
  const playerRank = getPlayerRank(highestScore);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-tech text-lg md:text-xl font-bold text-white tracking-wide">
                PLAYER SCORES & RECORDS
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Career telemetry, mode personal bests & recent sprints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Scores (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-slate-300">
          {/* Top Showcase: All-time high & rank */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>All-Time High Score</span>
              </div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-amber-400 tabular-nums">
                {highestScore.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">PTS</span>
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                Current Feline Rank
              </div>
              <div
                className="font-tech text-sm md:text-base font-bold tracking-wider px-3 py-1 rounded-lg border"
                style={{
                  color: playerRank.color,
                  borderColor: `${playerRank.color}40`,
                  backgroundColor: `${playerRank.color}15`,
                }}
              >
                {playerRank.title}
              </div>
            </div>
          </div>

          {/* Mode Personal Bests (4 Modes) */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <span>Personal Best by Mode</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['beginner', 'intermediate', 'advanced', 'expert'] as GameMode[]).map((modeKey) => {
                const modeCfg = GAME_MODES[modeKey];
                const modeScore = stats.bestScoresByMode[modeKey] || 0;
                return (
                  <div
                    key={modeKey}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-center sm:text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: modeCfg.accentHex }}
                        />
                        {modeCfg.name}
                      </span>
                      <span
                        className="font-mono text-[9px] px-1 py-0.5 rounded font-bold"
                        style={{
                          color: modeCfg.accentHex,
                          backgroundColor: `${modeCfg.accentHex}15`,
                        }}
                      >
                        {modeCfg.scoreMultiplier}x
                      </span>
                    </div>

                    <div className="font-mono text-base md:text-lg font-bold text-slate-100 tabular-nums pt-1">
                      {modeScore > 0 ? modeScore.toLocaleString() : '—'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {modeScore > 0 ? 'Record' : 'No runs yet'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifetime Telemetry Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 space-y-0.5 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500">Total Sprints</span>
              <div className="text-base font-mono font-semibold text-slate-200 tabular-nums">
                {stats.totalRuns}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 space-y-0.5 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-center gap-1">
                <Navigation className="w-3 h-3 text-slate-400" /> Total Distance
              </span>
              <div className="text-base font-mono font-semibold text-slate-200 tabular-nums">
                {stats.totalDistance.toLocaleString()}m
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 space-y-0.5 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-center gap-1">
                <ShardIcon className="w-3 h-3" /> Total Shards
              </span>
              <div className="text-base font-mono font-semibold text-cyan-400 tabular-nums">
                {stats.totalShards.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Recent Runs History */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Recent Runs Log
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{confirmClear ? 'Click again to confirm' : 'Clear Log'}</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-500 space-y-1">
                <p>No recent sprints recorded yet.</p>
                <p className="text-slate-600">Complete your first sprint to view history telemetry here!</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {history.map((run, idx) => {
                  const modeCfg = GAME_MODES[run.mode] || GAME_MODES.intermediate;
                  return (
                    <div
                      key={run.id || idx}
                      className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                          style={{
                            color: modeCfg.accentHex,
                            backgroundColor: `${modeCfg.accentHex}15`,
                            border: `1px solid ${modeCfg.accentHex}30`,
                          }}
                        >
                          {modeCfg.name}
                        </span>
                        <div className="font-mono font-bold text-slate-200 tabular-nums text-sm">
                          {run.score.toLocaleString()} <span className="text-[10px] font-sans font-normal text-slate-500">pts</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                        <span className="hidden sm:inline tabular-nums">
                          {run.distance.toLocaleString()}m
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400 tabular-nums">
                          <ShardIcon className="w-3 h-3" /> {run.shards}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {formatTimeAgo(run.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-500">
            Scores save automatically in local storage
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs tracking-wide transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
