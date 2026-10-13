/**
 * Help & Game Guide Modal
 * Fullscreen blurry modal displaying game mechanics, controls,
 * hazard guides, and overdrive system matching AboutModal & ScoresModal styling.
 */

import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles, ArrowUp, ArrowDown, Zap, Eye, Pause } from 'lucide-react';
import { GAME_MODES } from '../game/modeConfig';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
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
      {/* Pinned Top Header (Clean text style matching AboutModal & ScoresModal) */}
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

      {/* Main Center Guide Section */}
      <div className="relative max-w-2xl sm:max-w-3xl w-full mx-auto my-auto space-y-6 py-6 text-left">
        {/* Ambient Cyber Neon Backglow */}
        <div
          className="absolute -inset-x-8 -inset-y-6 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-cyan-500/20 blur-3xl rounded-full pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Title Lockup */}
        <div className="text-center space-y-2">
          <h2 className="font-tech text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_24px_rgba(6,182,212,0.4)]">
            HOW TO <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">PLAY</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-lg mx-auto">
            Controls, core mechanics, hazards & overdrive tactical briefing.
          </p>
        </div>

        {/* Primary Directive */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-1.5">
          <div className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            Primary Directive
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
            Sprint across procedural synthwave horizons with feline agility. Avoid collision with security drones and quantum barriers, collect luminous shards, trigger Hyper Overdrive, and set high-score records.
          </p>
        </div>

        {/* Controls Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Core Controls
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                  <ArrowUp className="w-4 h-4" /> Jump & Surge
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/80">
                  Space / W / Tap
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tap for a low hop; hold longer for a maximum leap. Tap again while airborne to perform a double jump surge!
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                  <ArrowDown className="w-4 h-4" /> Slide & Fast Drop
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/80">
                  Down / S / Swipe
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Slide low along the track to dodge flying drones. Press while in mid-air to immediately dive safely back down.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                  <Pause className="w-3.5 h-3.5" /> Pause Sprint
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/80">
                  P / Esc
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Freezes the runner simulation anytime to take a breather or inspect your track progress.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                  <Eye className="w-3.5 h-3.5" /> Toggle Clean UI
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/80">
                  H Key
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hides HUD score telemetry and bottom keyboard hints for an uncluttered cinematic experience.
              </p>
            </div>
          </div>
        </div>

        {/* Shards & Overdrive */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/80 border border-cyan-800/40 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>Hyper Overdrive System</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
            Collect <strong className="text-cyan-400">Data Shards</strong> along your path for +75 points each. Gathering <strong className="text-cyan-300">6 Shards</strong> activates <strong className="text-cyan-200">Hyper Overdrive</strong>:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc marker:text-cyan-400">
            <li>4.2 seconds of complete invulnerability with blazing dash speed.</li>
            <li>Colliding with hazards during Overdrive instantly <span className="text-emerald-400 font-semibold">shatters them</span> into particles!</li>
            <li>Grants <span className="text-cyan-300 font-semibold">+250 bonus points</span> per obstacle destroyed.</li>
          </ul>
        </div>

        {/* Hazards Guide */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Hazard Field Identification
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md flex flex-col gap-1">
              <span className="font-semibold text-rose-400">Scanner Drone (Flying)</span>
              <span className="text-slate-400">Hovers overhead with a tracking laser beam. Must <strong>slide low</strong> underneath!</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md flex flex-col gap-1">
              <span className="font-semibold text-amber-400">Spike Cluster (Ground)</span>
              <span className="text-slate-400">Sharp energy spikes on track surface. Use a standard <strong>jump</strong> to clear.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md flex flex-col gap-1">
              <span className="font-semibold text-cyan-400">Quantum Pillar (Tall)</span>
              <span className="text-slate-400">High vertical energy pillar. Requires a well-timed <strong>high jump</strong> or double jump.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md flex flex-col gap-1">
              <span className="font-semibold text-indigo-400">Floating Mag Rail (Platform)</span>
              <span className="text-slate-400">Solid elevated mag-lev beam. You can <strong>hop on top</strong> to collect high shard rows!</span>
            </div>
          </div>
        </div>

        {/* Difficulty Modes */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Difficulty Modes
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.values(GAME_MODES).map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: m.accentHex }}
                    />
                    {m.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {m.description.replace(/\s*\b\d+(\.\d+)?x score( bonus)?\.?/gi, '').replace(/\s*\(\+?\d+% score\)/gi, '')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note Card (Matching AboutModal & ScoresModal bottom card) */}
        <div className="p-4 rounded-xl text-center text-xs text-slate-400 font-mono leading-relaxed space-y-1">
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-300">
            <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[11px]">I</kbd> in-game for god mode</span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-cyan-400 font-semibold">Field Manual</span>
          </div>
        </div>
      </div>
    </div>
  );
};
