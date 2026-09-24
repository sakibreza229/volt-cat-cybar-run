/**
 * Pause Screen Modal
 */

import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-xs p-6 select-none animate-in fade-in duration-150">
      <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-5 shadow-2xl">
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500">
            Sprint Interrupted
          </div>
          <h2 className="font-tech text-2xl font-bold text-white tracking-wide">
            GAME PAUSED
          </h2>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume</span>
            <span className="text-xs opacity-75 font-mono">(P)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Sprint</span>
          </button>
        </div>
      </div>
    </div>
  );
};
