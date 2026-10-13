/**
 * Scores & Player Records Modal
 * Fullscreen blurry modal displaying high scores by mode
 * and all-time player rank matching AboutModal styling.
 */

import React, { useState, useEffect } from 'react';
import { Award, ArrowLeft } from 'lucide-react';
import { GameMode, CareerStats } from '../types/game';
import { GAME_MODES, getCareerStats } from '../game/modeConfig';

interface ScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHighScore: number;
}

function getPlayerRank(score: number): { title: string; color: string } {
  if (score >= 12000) return { title: 'APEX VOLT PHANTOM', color: '#22D3EE' };
  if (score >= 7000) return { title: 'SUB-LIGHT STRIKER', color: '#38BDF8' };
  if (score >= 3500) return { title: 'NEON RUNNER', color: '#06B6D4' };
  if (score >= 1000) return { title: 'CYBER CAT', color: '#0EA5E9' };
  return { title: 'TRACK NOVICE', color: '#94A3B8' };
}

export const ScoresModal: React.FC<ScoresModalProps> = ({ isOpen, onClose, currentHighScore }) => {
  const [stats, setStats] = useState<CareerStats>(() => getCareerStats());

  // Refresh stats whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStats(getCareerStats());
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

  const highestScore = Math.max(currentHighScore, stats.bestScoreOverall);
  const playerRank = getPlayerRank(highestScore);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/90 backdrop-blur-md p-6 md:p-10 select-none animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        // Close if user clicks directly on empty backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Pinned Top Header (Clean text style matching AboutModal & StartScreen) */}
      <header className="w-full flex items-center justify-between text-xs font-mono select-none">
        <h2 className="font-tech text-lg font-bold tracking-wider text-cyan-400">
          VOLT CAT CYBERUN
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 font-tech font-bold text-xs tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
          title="Return to Game"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-cyan-400" />
          <span>RETURN TO GAME</span>
        </button>
      </header>

      {/* Main Center Telemetry & Records Section */}
      <div className="relative max-w-2xl sm:max-w-3xl w-full mx-auto my-auto space-y-6 py-6 text-left">
        {/* Ambient Cyber Neon Backglow */}
        <div
          className="absolute -inset-x-8 -inset-y-6 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-cyan-500/20 blur-3xl rounded-full pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Title Lockup */}
        <div className="text-center space-y-2">
          <h2 className="font-tech text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_24px_rgba(6,182,212,0.4)]">
            SCORES & <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">RECORDS</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-lg mx-auto">
            All-time high scores & personal records by mode.
          </p>
        </div>

        {/* Top Showcase: All-Time High & Rank */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
              All-Time BEST
            </div>
            <div className="font-mono text-3xl md:text-4xl font-bold text-cyan-400 tabular-nums">
              {highestScore.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">PTS</span>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              Current Feline Rank
            </div>
            <div
              className="font-tech text-sm md:text-base font-bold tracking-wider px-3.5 py-1.5 rounded-lg border shadow-sm"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['beginner', 'intermediate', 'advanced', 'expert'] as GameMode[]).map((modeKey) => {
              const modeCfg = GAME_MODES[modeKey];
              const modeScore = stats.bestScoresByMode[modeKey] || 0;
              return (
                <div
                  key={modeKey}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-1 text-center sm:text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      {modeCfg.name}
                    </span>
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: modeCfg.accentHex }}
                      />
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

        {/* Footer Note Card (Matching AboutModal bottom card) */}
        <div className="p-4 rounded-xl text-center text-xs text-slate-400 font-mono leading-relaxed space-y-1">
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-300">
            <span>Scores save automatically to browser storage</span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-cyan-400 font-semibold">Apex Leaderboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
