/**
 * Help & Game Guide Modal
 * Displays comprehensive game mechanics, controls, hazard guides, and mode descriptions.
 */

import React, { useEffect } from 'react';
import { X, Sparkles, Shield, ArrowUp, ArrowDown, Zap, Eye, Volume2, Pause, Compass } from 'lucide-react';
import { ShardIcon } from './ShardIcon';
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
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-tech text-lg md:text-xl font-bold text-white tracking-wide">
                OPERATIONAL FIELD GUIDE
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Volt Cat Mechanics, Controls & Hazards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Guide (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-slate-300">
          {/* Mission Objective */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Primary Directive
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Sprint across procedural synthwave horizons with feline agility. Avoid collision with security drones and quantum barriers, collect luminous shards, trigger Hyper Overdrive, and set high-score records.
            </p>
          </div>

          {/* Controls Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Core Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                  <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                    <ArrowUp className="w-4 h-4" /> Jump & Surge
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Space / W / Tap
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Tap for a low hop; hold longer for a maximum leap. Tap again while airborne to perform a double jump surge!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <ArrowDown className="w-4 h-4" /> Slide & Fast Drop
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Down / S / Swipe
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Slide low along the track to dodge flying drones. Press while in mid-air to immediately dive safely back down.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                  <span className="flex items-center gap-1.5 font-semibold text-purple-400">
                    <Pause className="w-3.5 h-3.5" /> Pause Sprint
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    P / Esc
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Freezes the runner simulation anytime to take a breather or inspect your track progress.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <Eye className="w-3.5 h-3.5" /> Toggle Clean UI
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    H Key
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Hides HUD score telemetry and bottom keyboard hints for an uncluttered cinematic experience.
                </p>
              </div>
            </div>
          </div>

          {/* Shards & Overdrive */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Hyper Overdrive System</span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Collect <strong className="text-cyan-400">Data Shards</strong> along your path for +75 points each. Gathering <strong className="text-amber-300">6 Shards</strong> activates <strong className="text-yellow-400">Hyper Overdrive</strong>:
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc marker:text-cyan-400">
              <li>4.2 seconds of complete invulnerability with blazing dash speed.</li>
              <li>Colliding with hazards during Overdrive instantly <span className="text-emerald-400 font-semibold">shatters them</span> into particles!</li>
              <li>Grants <span className="text-amber-300 font-semibold">+250 bonus points</span> per obstacle destroyed.</li>
            </ul>
          </div>

          {/* Hazards Guide */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Hazard Field Identification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col gap-1">
                <span className="font-semibold text-rose-400">Scanner Drone (Flying)</span>
                <span className="text-slate-400">Hovers overhead with a tracking laser beam. Must <strong>slide low</strong> underneath!</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col gap-1">
                <span className="font-semibold text-amber-400">Spike Cluster (Ground)</span>
                <span className="text-slate-400">Sharp energy spikes on track surface. Use a standard <strong>jump</strong> to clear.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col gap-1">
                <span className="font-semibold text-cyan-400">Quantum Pillar (Tall)</span>
                <span className="text-slate-400">High vertical energy pillar. Requires a well-timed <strong>high jump</strong> or double jump.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col gap-1">
                <span className="font-semibold text-indigo-400">Floating Mag Rail (Platform)</span>
                <span className="text-slate-400">Solid elevated mag-lev beam. You can <strong>hop on top</strong> to collect high shard rows!</span>
              </div>
            </div>
          </div>

          {/* Difficulty Modes */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Difficulty Modes & Multipliers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.values(GAME_MODES).map((m) => (
                <div key={m.id} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: m.accentHex }}
                      />
                      {m.name}
                    </span>
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{
                        backgroundColor: `${m.accentHex}20`,
                        color: m.accentHex,
                        border: `1px solid ${m.accentHex}40`,
                      }}
                    >
                      {m.scoreMultiplier}x SCORE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-500">
            Tip: Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">I</kbd> in-game for god mode easter egg
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            Ready to Sprint
          </button>
        </div>
      </div>
    </div>
  );
};
