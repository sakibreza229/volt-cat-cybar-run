/**
 * About Modal
 * Fullscreen blurry modal displaying game story, creator context,
 * and noting that it is a personal AI hobby project.
 */

import React, { useEffect } from 'react';
import { Heart, Terminal, Code2, ArrowLeft } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
      {/* Pinned Top Header (Clean text style matching StartScreen) */}
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

      {/* Main Center Story & Context Section */}
      <div className="relative max-w-2xl w-full mx-auto my-auto space-y-6 py-6 text-left">
        {/* Ambient Cyber Neon Backglow */}
        <div
          className="absolute -inset-x-8 -inset-y-6 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 blur-3xl rounded-full pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Title Lockup */}
        <div className="text-center space-y-3">
          <h2 className="font-tech text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_24px_rgba(6,182,212,0.4)]">
            THE STORY OF <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">VOLT CAT</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-lg mx-auto">
            A retro synthwave endless sprint sculpted with code, sound & cybernetic imagination.
          </p>
        </div>

        {/* Story & Behind the Code Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: The Universe */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-tech font-bold text-sm tracking-wide">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>THE UNIVERSE</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
              Volt Cat is set in a neon-drenched synthwave metropolis where an agile cybernetic feline dashes across infinite holographic rooftops. Leaping over quantum pillars, sliding beneath scanning drones, and harvesting resonant plasma shards to ignite Hyper Overdrive.
            </p>
          </div>

          {/* Card 2: Behind the Code */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-tech font-bold text-sm tracking-wide">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>BEHIND THE CODE</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
              This game is a personal AI hobby exploration built with love, curiosity, and rapid experimentation. Designed to push fluid 60FPS retro arcade physics, procedural synth audio generation, and responsive pixel art within a modern browser canvas.
            </p>
          </div>
        </div>

        {/* Credits, Version & Copyright */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/70 text-center text-xs text-slate-400 font-mono leading-relaxed space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-300">
            <span>Made with <Heart className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 inline-block align-middle mx-0.5 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" /> for retro arcade enthusiasts</span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-cyan-400 font-semibold">v1.2</span>
          </div>
          <div className="text-slate-500 text-[11px] flex flex-wrap items-center justify-center gap-2">
            <span>© 2026 Sakib Reza</span>
            <span className="text-slate-700 select-none" aria-hidden="true">·</span>
            <span>All rights reserved</span>
            <span className="text-slate-700 select-none" aria-hidden="true">·</span>
            <span className="text-slate-400">Personal AI Project</span>
          </div>
        </div>
      </div>
    </div>
  );
};
