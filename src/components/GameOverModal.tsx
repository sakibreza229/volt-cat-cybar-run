/**
 * Game Over Run Summary Modal
 * Clean, compact game over interface matching PauseModal styling.
 */

import React, { useEffect } from 'react';
import { RotateCcw, Trophy, LogOut } from 'lucide-react';
import { GameScore } from '../types/game';

interface GameOverModalProps {
  score: GameScore;
  onRestart: () => void;
  onHome?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ score, onRestart, onHome }) => {
  const isNewRecord = score.score > 0 && score.score >= score.highScore;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      } else if (e.code === 'Escape' && onHome) {
        e.preventDefault();
        onHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart, onHome]);

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-xs p-6 select-none animate-in fade-in duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-xs w-full p-6 text-center space-y-5 shadow-2xl">
        {/* Primary Score Showcase */}
        <div className="space-y-1">
          <div className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tight text-cyan-400 tabular-nums drop-shadow-[0_0_24px_rgba(6,182,212,0.45)]">
            {score.score.toLocaleString()}
          </div>

          {isNewRecord ? (
            <div className="text-xs font-semibold text-cyan-400 tracking-wider flex items-center justify-center gap-1.5 pt-0.5">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              <span>NEW RECORD!</span>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500 pt-0.5">
              Best: <span className="text-slate-300 tabular-nums">{score.highScore.toLocaleString()} PTS</span>
            </div>
          )}
        </div>

        {/* Telemetry Metrics: Distance & Shards */}
        <div className="flex items-center justify-center gap-2.5 text-xs font-mono text-slate-400">
          <span>
            Distance: <span className="text-slate-200 tabular-nums">{Math.floor(score.distance).toLocaleString()}m</span>
          </span>
          <span className="text-slate-700 select-none" aria-hidden="true">·</span>
          <span>
            Shards: <span className="text-cyan-400 tabular-nums font-semibold">{score.shards}</span>
          </span>
        </div>

        {/* Action Grid: Compact Restart | Exit */}
        <div className="flex items-center justify-center gap-2.5 max-w-[150px] mx-auto w-full">
          <button
            type="button"
            onClick={onRestart}
            autoFocus
            title="Try Again (Space / R)"
            aria-label="Try again"
            className="group flex-1 flex items-center justify-center h-9 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 rounded-lg transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-45" />
          </button>

          {onHome && (
            <button
              type="button"
              onClick={onHome}
              title="Exit to Main Menu"
              aria-label="Exit to Main Menu"
              className="group flex-1 flex items-center justify-center h-9 bg-slate-800 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 hover:border-slate-500 text-cyan-400 hover:text-cyan-300 rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">R</kbd> to sprint
        </div>
      </div>
    </div>
  );
};
