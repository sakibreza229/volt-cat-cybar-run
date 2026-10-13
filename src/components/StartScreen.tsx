/**
 * Title & Start Screen for Volt Fox
 * Clean cyberpunk start menu with difficulty mode selector, Help guide, and Scores history.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, ChevronDown, Check, HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { ShardIcon } from './ShardIcon';
import { GameMode } from '../types/game';
import { GAME_MODES } from '../game/modeConfig';
import { HelpModal } from './HelpModal';
import { ScoresModal } from './ScoresModal';

interface StartScreenProps {
  highScore: number;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStart: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  selectedMode,
  onSelectMode,
  onStart,
  onModalStateChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isScoresOpen, setIsScoresOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentModeConfig = GAME_MODES[selectedMode] || GAME_MODES.intermediate;

  // Inform parent when a modal is open so global spacebar doesn't start the game underneath
  useEffect(() => {
    const hasModal = isHelpOpen || isScoresOpen;
    onModalStateChange?.(hasModal);
  }, [isHelpOpen, isScoresOpen, onModalStateChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  const handleModeSelect = (mode: GameMode) => {
    onSelectMode(mode);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xs p-6 select-none"
      onClick={(e) => {
        // Prevent background canvas click from launching sprint while interacting with start menu
        e.stopPropagation();
      }}
    >
      <div className="max-w-md w-full text-center space-y-5">
        {/* Title Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <span>Cyber Feline Runner</span>
            <span aria-hidden="true">·</span>
            <span>Fluid Pixel Engine</span>
          </div>
          <h1 className="font-tech text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_24px_rgba(6,182,212,0.4)]">
            VOLT CAT
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto">
            Dash across synth horizons with razor agility. Dodge scanner drones, jump quantum pillars, and ignite Hyper Overdrive.
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

        {/* Difficulty Mode Dropdown */}
        <div className="relative text-left w-full max-w-sm mx-auto" ref={dropdownRef}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5 px-0.5">
            <span className="uppercase tracking-wider">Select Mode</span>
            <span
              className="font-bold text-[11px] px-1.5 py-0.2 rounded"
              style={{
                color: currentModeConfig.accentHex,
                backgroundColor: `${currentModeConfig.accentHex}15`,
              }}
            >
              {currentModeConfig.scoreMultiplier}x Score
            </span>
          </div>

          {/* Dropdown trigger button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 hover:border-cyan-500/60 transition-all duration-150 cursor-pointer text-left shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: currentModeConfig.accentHex }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{currentModeConfig.name}</span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                    style={{
                      color: currentModeConfig.accentHex,
                      backgroundColor: `${currentModeConfig.accentHex}20`,
                      border: `1px solid ${currentModeConfig.accentHex}40`,
                    }}
                  >
                    {currentModeConfig.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {currentModeConfig.tagline}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                isDropdownOpen ? 'rotate-180 text-cyan-400' : ''
              }`}
            />
          </button>

          {/* Dropdown options popover */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-slate-900/98 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-md">
              {(['beginner', 'intermediate', 'advanced', 'expert'] as GameMode[]).map((modeKey) => {
                const cfg = GAME_MODES[modeKey];
                const isSelected = selectedMode === modeKey;
                return (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() => handleModeSelect(modeKey)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border border-slate-600/60'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cfg.accentHex }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{cfg.name}</span>
                          <span
                            className="font-mono text-[9px] px-1 py-0.2 rounded font-bold"
                            style={{
                              color: cfg.accentHex,
                              backgroundColor: `${cfg.accentHex}20`,
                            }}
                          >
                            {cfg.scoreMultiplier}x
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {cfg.tagline}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Feature Badges (Unboxed) */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-0.5">
          <span className="flex items-center gap-1.5">
            <ShardIcon className="w-3.5 h-3.5" /> Collect 6 Shards for Overdrive
          </span>
          <span className="text-slate-700" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" /> Shatter Hazards
          </span>
        </div>

        {/* Start Action */}
        <div className="pt-1 space-y-3">
          <button
            onClick={onStart}
            className="group w-full max-w-sm mx-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer active:scale-98 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-slate-950 transition-transform group-hover:scale-110" />
            <span>Launch Sprint</span>
            <span className="text-[11px] opacity-75 font-mono">(Space / Click)</span>
          </button>

          {/* Modal Launchers Row: Help & Scores */}
          <div className="flex items-center justify-center gap-2.5 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Help & Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScoresOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Player Scores</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Scores Modal */}
      <ScoresModal
        isOpen={isScoresOpen}
        onClose={() => setIsScoresOpen(false)}
        currentHighScore={highScore}
      />
    </div>
  );
};
