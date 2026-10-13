/**
 * Pause Screen Modal
 * Clean cyberpunk pause interface featuring:
 * - 3-column icon-only action grid: Resume | Restart Sprint | Back to Home
 * - Text links at bottom for Help and Scores
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { HelpModal } from './HelpModal';
import { ScoresModal } from './ScoresModal';
import { AboutModal } from './AboutModal';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  highScore?: number;
  onModalStateChange?: (isOpen: boolean) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  highScore = 0,
  onModalStateChange,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isScoresOpen, setIsScoresOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Notify parent if Help or Scores or About modal is active so global key listeners don't clash
  useEffect(() => {
    const hasActiveSubModal = isHelpOpen || isScoresOpen || isAboutOpen;
    onModalStateChange?.(hasActiveSubModal);
  }, [isHelpOpen, isScoresOpen, isAboutOpen, onModalStateChange]);

  const isSubModalOpen = isHelpOpen || isScoresOpen || isAboutOpen;

  return (
    <>
      {!isSubModalOpen && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-xs p-6 select-none animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="max-w-xs w-full p-6 text-center space-y-5 shadow-2xl">
          {/* Header */}
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-500">
              Sprint Interrupted
            </div>
            <h2 className="font-tech text-2xl font-bold text-white tracking-wide">
              GAME PAUSED
            </h2>
          </div>

          {/* 3-Column Icon-Only Grid: Resume | Restart | Back to Home */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={onResume}
              title="Resume (P)"
              aria-label="Resume sprint"
              className="group flex items-center justify-center h-13 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-5 h-5 fill-slate-950 translate-x-0.5 transition-transform group-hover:scale-110" />
            </button>

            <button
              type="button"
              onClick={onRestart}
              title="Restart Sprint (R)"
              aria-label="Restart sprint"
              className="group flex items-center justify-center h-13 bg-slate-800 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 hover:border-slate-500 text-slate-200 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-45" />
            </button>

            <button
              type="button"
              onClick={onHome}
              title="Back to Home"
              aria-label="Back to Home"
              className="group flex items-center justify-center h-13 bg-slate-800 hover:bg-slate-700/90 active:scale-95 border border-slate-700/60 hover:border-slate-500 text-cyan-400 hover:text-cyan-300 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* Bottom Text Links (styled as clean text, not buttons) */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-3.5 text-xs font-mono text-slate-400">
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer tracking-wider decoration-slate-700 hover:decoration-cyan-400"
            >
              Help
            </button>
            <span className="text-slate-600 select-none" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsScoresOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer tracking-wider decoration-slate-700 hover:decoration-cyan-400"
            >
              Scores
            </button>
            <span className="text-slate-600 select-none" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer tracking-wider decoration-slate-700 hover:decoration-cyan-400"
            >
              About
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Sub-modals */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      <ScoresModal
        isOpen={isScoresOpen}
        onClose={() => setIsScoresOpen(false)}
        currentHighScore={highScore}
      />
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </>
  );
};
