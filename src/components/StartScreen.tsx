/**
 * Title & Start Screen for Volt Fox
 * Clean cyberpunk start menu with slider mode selector, Help guide, Scores history, and About.
 */

import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameMode } from '../types/game';
import { GAME_MODES, MODE_ORDER } from '../game/modeConfig';
import { HelpModal } from './HelpModal';
import { ScoresModal } from './ScoresModal';
import { AboutModal } from './AboutModal';
import { TrophyIcon } from './TrophyIcon';

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
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isScoresOpen, setIsScoresOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const currentModeConfig = GAME_MODES[selectedMode] || GAME_MODES.intermediate;

  const currentIndex = Math.max(0, MODE_ORDER.indexOf(selectedMode));
  const isFirstMode = currentIndex <= 0;
  const isLastMode = currentIndex >= MODE_ORDER.length - 1;

  // Inform parent when a modal is open so global spacebar doesn't start the game underneath
  useEffect(() => {
    const hasModal = isHelpOpen || isScoresOpen || isAboutOpen;
    onModalStateChange?.(hasModal);
  }, [isHelpOpen, isScoresOpen, isAboutOpen, onModalStateChange]);

  const handlePrevMode = () => {
    if (currentIndex > 0) {
      onSelectMode(MODE_ORDER[currentIndex - 1]);
    }
  };

  const handleNextMode = () => {
    if (currentIndex < MODE_ORDER.length - 1) {
      onSelectMode(MODE_ORDER[currentIndex + 1]);
    }
  };

  // Keyboard navigation for slider: Left / Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHelpOpen || isScoresOpen || isAboutOpen) return;
      if (e.key === 'ArrowLeft' && !isFirstMode) {
        e.preventDefault();
        handlePrevMode();
      } else if (e.key === 'ArrowRight' && !isLastMode) {
        e.preventDefault();
        handleNextMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFirstMode, isLastMode, isHelpOpen, isScoresOpen, isAboutOpen]);

  const isOtherModalOpen = isHelpOpen || isScoresOpen || isAboutOpen;

  return (
    <>
      {!isOtherModalOpen && (
        <div
          className="absolute inset-0 z-30 flex flex-col justify-between bg-slate-950/85 backdrop-blur-xs p-6 md:p-8 select-none"
          onClick={(e) => {
            // Prevent background canvas click from launching sprint while interacting with start menu
            e.stopPropagation();
          }}
        >
          {/* Top Header: Pinned to top of the window with flex justify-between (Clean text style) */}
          <header className="w-full flex items-center justify-between text-xs font-mono select-none">
        {/* Personal Best on top left (clean text style with filled trophy icon) */}
        <div className="flex items-center gap-2 text-slate-400">
          <TrophyIcon className="w-4 h-4 text-amber-400" glow={true} />
          <span className="text-slate-500 uppercase tracking-wider text-[11px]">Best:</span>
          <span className="text-amber-400 font-semibold tabular-nums">
            {highScore > 0 ? `${highScore.toLocaleString()} PTS` : '--'}
          </span>
        </div>

        {/* Action Links on top right: Help · Scores · About (clean text style) */}
        <div className="flex items-center gap-3 text-slate-400">
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="hover:text-cyan-400 transition-colors cursor-pointer tracking-wide"
          >
            Help
          </button>

          <span className="text-slate-700 select-none" aria-hidden="true">·</span>

          <button
            type="button"
            onClick={() => setIsScoresOpen(true)}
            className="hover:text-cyan-400 transition-colors cursor-pointer tracking-wide"
          >
            Scores
          </button>

          <span className="text-slate-700 select-none" aria-hidden="true">·</span>

          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className="hover:text-cyan-400 transition-colors cursor-pointer tracking-wide"
          >
            About
          </button>
        </div>
      </header>

      {/* Main Center Menu Container */}
      <div className="max-w-md w-full mx-auto text-center space-y-6 my-auto">
        {/* Game Title Logo Lockup */}
        <div className="relative select-none py-1">
          {/* Ambient Cyber Neon Backglow */}
          <div
            className="absolute -inset-x-6 -inset-y-3 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-400/20 blur-2xl rounded-full pointer-events-none animate-ambient-glow -z-10"
            aria-hidden="true"
          />

          <div className="relative inline-flex flex-col items-center text-center">
            {/* Main Title: VOLT CAT */}
            <h1 className="font-tech text-5xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] drop-shadow-[0_0_24px_rgba(6,182,212,0.55)]">
              <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent animate-shimmer inline-block">
                VOLT CAT
              </span>
            </h1>

            {/* Subtitle Bar: CYBER RUN */}
            <div className="flex items-center justify-center gap-2.5 w-full">
              <div className="h-[2px] flex-1 max-w-[36px] bg-gradient-to-r from-transparent via-cyan-400/70 to-cyan-300 rounded-full" />
              <div className="flex items-center gap-1.5">
                <span className="font-tech text-2xl sm:text-3xl font-extrabold tracking-[0.25em] md:tracking-[0.3em] uppercase bg-gradient-to-r from-cyan-200 via-white to-cyan-100 bg-clip-text text-transparent animate-shimmer filter drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                  CYBERUN
                </span>
              </div>
              <div className="h-[2px] flex-1 max-w-[36px] bg-gradient-to-l from-transparent via-cyan-400/70 to-cyan-300 rounded-full" />
            </div>
          </div>
        </div>

        {/* Mode Slide Layout: prev  active-mode  next */}
        <div className="w-full max-w-xs mx-auto">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl">
            {isFirstMode ? (
              <div className="w-8 h-8" aria-hidden="true" />
            ) : (
              <button
                type="button"
                onClick={handlePrevMode}
                className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                aria-label="Previous mode"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="font-tech text-lg md:text-xl font-bold tracking-wider uppercase select-none text-white">
              {currentModeConfig.name}
            </div>
            {isLastMode ? (
              <div className="w-8 h-8" aria-hidden="true" />
            ) : (
              <button
                type="button"
                onClick={handleNextMode}
                className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                aria-label="Next mode"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Start Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStart}
            className="group w-full max-w-xs mx-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 font-tech font-bold text-sm tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-95 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-cyan-400 text-cyan-400 transition-transform group-hover:scale-110" />
            <span>LAUNCH SPRINT</span>
          </button>
        </div>
      </div>

      <p className="text-xs md:text-sm text-slate-400 text-center">
            Dash across synth horizons with razor agility. Dodge scanner drones, jump quantum pillars, and ignite Hyper Overdrive.
          </p>
        </div>
      )}

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Scores Modal */}
      <ScoresModal
        isOpen={isScoresOpen}
        onClose={() => setIsScoresOpen(false)}
        currentHighScore={highScore}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </>
  );
};
