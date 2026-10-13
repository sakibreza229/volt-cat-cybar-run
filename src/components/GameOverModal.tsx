/**
 * Game Over Run Summary Modal
 * Shows score, records, and replay button without pseudo-technical clutter.
 */

import React from 'react';
import { RotateCcw, Trophy, Navigation, Home } from 'lucide-react';
import { ShardIcon } from './ShardIcon';
import { GameScore } from '../types/game';
import { getActiveBiomeAccentColor } from '../game/parallaxLayers';
import { GAME_MODES } from '../game/modeConfig';

interface GameOverModalProps {
  score: GameScore;
  onRestart: () => void;
  onHome?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ score, onRestart, onHome }) => {
  const isNewRecord = score.score > 0 && score.score >= score.highScore;
  const accentColor = getActiveBiomeAccentColor(score.score);
  const modeConfig = score.mode ? GAME_MODES[score.mode] : null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xs p-6 select-none animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 text-center shadow-2xl">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400">
              Sprint Terminated
            </span>
            {modeConfig && (
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                style={{
                  color: modeConfig.accentHex,
                  backgroundColor: `${modeConfig.accentHex}20`,
                  border: `1px solid ${modeConfig.accentHex}40`,
                }}
              >
                {modeConfig.name} ({modeConfig.scoreMultiplier}x)
              </span>
            )}
          </div>
          <h2 className="font-tech text-3xl md:text-4xl font-bold text-white tracking-wide">
            RUN COMPLETE
          </h2>
        </div>

        {/* Primary Score Showcase */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-sans">Final Score</span>
          <div
            className="text-4xl md:text-5xl font-mono font-bold tabular-nums"
            style={{
              color: accentColor,
              filter: `drop-shadow(0 0 16px ${accentColor}66)`,
            }}
          >
            {score.score.toLocaleString()}
          </div>

          {isNewRecord ? (
            <div
              className="flex items-center justify-center gap-1.5 text-xs font-semibold pt-1"
              style={{
                color: accentColor,
                filter: `drop-shadow(0 0 8px ${accentColor}80)`,
              }}
            >
              <Trophy className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>NEW ALL-TIME RECORD!</span>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500 pt-1">
              Personal Best: <span className="text-slate-300 tabular-nums">{score.highScore.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Telemetry Breakdown (Unboxed Clean List) */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 space-y-1">
            <span className="text-[11px] uppercase text-slate-500 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-slate-400" /> Distance
            </span>
            <div className="text-lg font-mono font-semibold text-slate-100 tabular-nums flex items-baseline gap-1">
              <span>{Math.floor(score.distance).toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-sans font-normal">m</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 space-y-1">
            <span className="text-[11px] uppercase text-slate-500 flex items-center gap-1.5">
              <ShardIcon className="w-3.5 h-3.5" /> Shards
            </span>
            <div className="text-lg font-mono font-semibold text-cyan-400 tabular-nums flex items-baseline gap-1">
              <span>{score.shards}</span>
              <span className="text-xs text-slate-500 font-sans font-normal">collected</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={onRestart}
            autoFocus
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-150 cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-4 h-4 fill-slate-950" />
            <span>Play Again</span>
            <span className="text-xs opacity-75 font-mono">(Space / R)</span>
          </button>

          {onHome && (
            <button
              onClick={onHome}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-medium text-xs rounded-xl transition-all duration-150 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back to Home Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
