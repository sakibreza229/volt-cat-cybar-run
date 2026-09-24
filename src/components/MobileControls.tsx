/**
 * On-Screen Mobile & Tablet Touch Controls
 * Responsive, zero-latency touch targets with haptic feedback.
 */

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onSlideStart: () => void;
  onSlideEnd: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onJumpStart,
  onJumpEnd,
  onSlideStart,
  onSlideEnd,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none md:hidden select-none">
      {/* Slide / Duck Button (Left Thumb) */}
      <button
        aria-label="Slide or Fast Drop"
        className="pointer-events-auto w-20 h-20 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md active:bg-amber-500/30 active:border-amber-400 active:scale-95 flex flex-col items-center justify-center text-slate-300 active:text-amber-300 transition-all touch-none shadow-lg"
        onTouchStart={(e) => {
          e.preventDefault();
          triggerHaptic();
          onSlideStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onSlideEnd();
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          onSlideEnd();
        }}
        onMouseDown={onSlideStart}
        onMouseUp={onSlideEnd}
        onMouseLeave={onSlideEnd}
      >
        <ArrowDown className="w-7 h-7" />
        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold mt-0.5">SLIDE</span>
      </button>

      {/* Jump Button (Right Thumb) */}
      <button
        aria-label="Jump or Double Jump"
        className="pointer-events-auto w-20 h-20 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md active:bg-cyan-500/30 active:border-cyan-400 active:scale-95 flex flex-col items-center justify-center text-slate-300 active:text-cyan-300 transition-all touch-none shadow-lg"
        onTouchStart={(e) => {
          e.preventDefault();
          triggerHaptic();
          onJumpStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onJumpEnd();
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          onJumpEnd();
        }}
        onMouseDown={onJumpStart}
        onMouseUp={onJumpEnd}
        onMouseLeave={onJumpEnd}
      >
        <ArrowUp className="w-7 h-7" />
        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold mt-0.5">JUMP</span>
      </button>
    </div>
  );
};
