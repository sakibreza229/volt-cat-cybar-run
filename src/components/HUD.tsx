/**
 * Clean, In-Viewport Game HUD
 * Displays real-time stats and sound / pause controllers directly inside the game viewport.
 * Free of clutter and multipliers; brand logo is exclusive to the start menu.
 */

import React from 'react';
import { GameScore } from '../types/game';
import { Volume2, VolumeX, Pause, Play, Eye, EyeOff } from 'lucide-react';
import { ShardIcon } from './ShardIcon';

interface HUDProps {
  score: GameScore;
  isPaused: boolean;
  isMuted: boolean;
  isUiHidden: boolean;
  showStats?: boolean;
  showPause?: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleHideUi: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  isPaused,
  isMuted,
  isUiHidden,
  showStats = true,
  showPause = true,
  onTogglePause,
  onToggleMute,
  onToggleHideUi,
}) => {
  return (
    <header className="absolute top-2.5 left-3 right-3 md:top-3 md:left-4 md:right-4 z-20 flex items-center justify-between pointer-events-none select-none">
      {/* Real-time Telemetry Stats (Inside Viewport Top Left) */}
      {showStats && !isUiHidden ? (
        <div className="flex items-center gap-2.5 md:gap-4 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-xs border border-slate-800/80 shadow-md text-xs md:text-sm font-mono tracking-tight text-slate-300 pointer-events-none transition-opacity duration-200">
          {/* Score */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] md:text-xs uppercase text-slate-400 font-sans font-semibold tracking-wider">Score</span>
            <span className="text-sm md:text-base font-bold text-white tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] leading-none">
              {score.score.toLocaleString()}
            </span>
            {score.highScore > 0 && (
              <span className="text-[10px] md:text-xs text-slate-400 tabular-nums ml-0.5 leading-none">
                (HI {score.highScore.toLocaleString()})
              </span>
            )}
          </div>

          <span className="text-slate-700 leading-none" aria-hidden="true">·</span>

          {/* Distance */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] md:text-xs uppercase text-slate-400 font-sans font-semibold tracking-wider">Distance</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs md:text-sm font-bold text-slate-100 tabular-nums leading-none">
                {Math.floor(score.distance).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-sans leading-none">m</span>
            </div>
          </div>

          <span className="text-slate-700 leading-none" aria-hidden="true">·</span>

          {/* Shards */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] md:text-xs uppercase text-slate-400 font-sans font-semibold tracking-wider">Shards</span>
            <div className="flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
              <ShardIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-bold text-cyan-300 tabular-nums leading-none">
                {score.shards}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div />
      )}

      {/* Controllers: Toggle UI, Sound & Pause / Resume (Inside Viewport Top Right) */}
      <div className="flex items-center gap-2 pointer-events-auto ml-auto">
        {/* Toggle UI Visibility Button (Hides stats and bottom hint; never hides top-right) */}
        <button
          onClick={onToggleHideUi}
          aria-label={isUiHidden ? 'Show UI (H)' : 'Hide UI (H)'}
          className={`p-2 rounded-xl backdrop-blur-xs border transition-all cursor-pointer shadow-sm active:scale-95 ${
            isUiHidden
              ? 'bg-cyan-950/75 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/80 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'bg-slate-950/75 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-900/90'
          }`}
          title={isUiHidden ? 'Show UI (H)' : 'Hide UI (H)'}
        >
          {isUiHidden ? (
            <EyeOff className="w-4 h-4 text-cyan-400" />
          ) : (
            <Eye className="w-4 h-4 text-slate-300" />
          )}
        </button>

        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-xl bg-slate-950/75 backdrop-blur-xs border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Toggle Sound (M)"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
        </button>

        {showPause && (
          <button
            onClick={onTogglePause}
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
            className="p-2 rounded-xl bg-slate-950/75 backdrop-blur-xs border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm active:scale-95"
            title={isPaused ? 'Resume (P)' : 'Pause (P)'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
          </button>
        )}
      </div>
    </header>
  );
};
