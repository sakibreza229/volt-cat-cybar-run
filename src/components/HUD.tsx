/**
 * Clean, In-Viewport Game HUD
 * Displays real-time stats and sound / pause controllers directly inside the game viewport.
 * Free of clutter and multipliers; brand logo is exclusive to the start menu.
 */

import React from 'react';
import { GameScore } from '../types/game';
import { Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react';

interface HUDProps {
  score: GameScore;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
}) => {
  return (
    <header className="absolute top-2.5 left-3 right-3 md:top-3 md:left-4 md:right-4 z-20 flex items-center justify-between pointer-events-none select-none">
      {/* Real-time Telemetry Stats (Inside Viewport Top Left) */}
      <div className="flex items-center gap-3 md:gap-5 px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-xs border border-slate-800/60 shadow-sm text-xs md:text-sm font-mono tracking-tight text-slate-300 pointer-events-none">
        {/* Score */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] md:text-xs uppercase text-slate-400 font-sans font-semibold">Score</span>
          <span className="text-sm md:text-base font-bold text-white tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            {score.score.toLocaleString()}
          </span>
          {score.highScore > 0 && (
            <span className="text-[10px] md:text-xs text-slate-400 tabular-nums ml-1">
              (HI {score.highScore.toLocaleString()})
            </span>
          )}
        </div>

        <span className="text-slate-700" aria-hidden="true">·</span>

        {/* Distance */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] md:text-xs uppercase text-slate-400 font-sans font-semibold">Distance</span>
          <span className="text-xs md:text-sm font-bold text-slate-100 tabular-nums">
            {Math.floor(score.distance).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">m</span>
        </div>

        <span className="text-slate-700" aria-hidden="true">·</span>

        {/* Shards */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] md:text-xs uppercase text-slate-400 font-sans font-semibold">Shards</span>
          <span className="text-xs md:text-sm font-bold text-cyan-400 tabular-nums flex items-center gap-1">
            <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-cyan-400 inline" />
            {score.shards}
          </span>
        </div>
      </div>

      {/* Controllers: Sound & Pause / Resume (Inside Viewport Top Right) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-xl bg-slate-950/75 backdrop-blur-xs border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Toggle Sound (M)"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
        </button>

        <button
          onClick={onTogglePause}
          aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
          className="p-2 rounded-xl bg-slate-950/75 backdrop-blur-xs border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm active:scale-95"
          title={isPaused ? "Resume (P)" : "Pause (P)"}
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
    </header>
  );
};
