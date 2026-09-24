/**
 * Title & Start Screen for Volt Fox
 * Outlines game rules, controls, and features without pseudo-technical clutter.
 */

import React from 'react';
import { Play, Sparkles, Shield, ArrowUp, ArrowDown } from 'lucide-react';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ highScore, onStart }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs p-6 select-none">
      <div className="max-w-xl w-full text-center space-y-6">
        {/* Title Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <span>Cyber Feline Runner</span>
            <span aria-hidden="true">·</span>
            <span>Fluid Pixel Engine</span>
          </div>
          <h1 className="font-tech text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_24px_rgba(6,182,212,0.4)]">
            VOLT CAT
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto">
            Dash across multi-layered synth horizons with razor feline agility. Dodge scanner drones, jump quantum pillars, and ignite Hyper Overdrive.
          </p>
        </div>

        {/* High Score Announcement */}
        {highScore > 0 && (
          <div className="text-xs font-mono text-slate-400">
            <span>Personal Best</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-amber-400 font-semibold tabular-nums">{highScore.toLocaleString()} PTS</span>
          </div>
        )}

        {/* Mechanics & Controls Grid */}
        <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <span className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"><ArrowUp className="w-3.5 h-3.5 inline" /> Space / W</span>
              <span>Jump & Air Surge</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tap for short hop, hold for soaring leap. Tap again in air to double jump!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]"><ArrowDown className="w-3.5 h-3.5 inline" /> Down Arrow</span>
              <span>Slide & Fast Drop</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Slide low under aerial drones. Press in mid-air to dive quickly back to the track.
            </p>
          </div>
        </div>

        {/* Feature Badges (Unboxed) */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Collect Shards for Overdrive
          </span>
          <span className="text-slate-700" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Overdrive Smashes Hazards
          </span>
        </div>

        {/* Start Action */}
        <div className="pt-2">
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer active:scale-98 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-slate-950 transition-transform group-hover:scale-110" />
            <span>Launch Sprint</span>
            <span className="text-[11px] opacity-75 font-mono">(Space / Click)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
