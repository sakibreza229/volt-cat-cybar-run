/**
 * GameCanvas: Canvas host, HiDPI scaling, and input orchestration
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../game/gameEngine';
import { GameState, GameScore } from '../types/game';
import { HUD } from './HUD';
import { StartScreen } from './StartScreen';
import { GameOverModal } from './GameOverModal';
import { PauseModal } from './PauseModal';
import { MobileControls } from './MobileControls';
import { soundSynth } from '../audio/synthAudio';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState<GameScore>({
    distance: 0,
    shards: 0,
    score: 0,
    highScore: 0,
    speed: 6.8,
  });
  const [isMuted, setIsMuted] = useState<boolean>(soundSynth.getMuted());

  // Initialize engine once
  useEffect(() => {
    const engine = new GameEngine();
    engine.onStateChange = (newState) => setGameState(newState);
    engine.onScoreUpdate = (newScore) => setScore(newScore);
    engineRef.current = engine;

    // Load initial high score
    const saved = localStorage.getItem('voltfox_highscore');
    if (saved) {
      setScore((prev) => ({ ...prev, highScore: parseInt(saved, 10) || 0 }));
    }
  }, []);

  // Main 60fps RequestAnimationFrame Loop
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      const engine = engineRef.current;
      const canvas = canvasRef.current;
      if (engine && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          engine.update(timestamp);
          engine.render(ctx);
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Canvas Responsive Resize Handling to fully fill the window without borders or bars
  useEffect(() => {
    const updateCanvasScale = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const pixelWidth = Math.max(320, Math.floor(rect.width || window.innerWidth));
      const pixelHeight = Math.max(240, Math.floor(rect.height || window.innerHeight));

      // Dynamically notify engine of exact window dimensions
      engineRef.current?.setDimensions(pixelWidth, pixelHeight);

      const { width: vW, height: vH } = engineRef.current?.getVirtualDimensions() || {
        width: 960,
        height: 420,
      };

      // Set internal coordinate space matching the window's exact aspect ratio
      if (canvas.width !== vW || canvas.height !== vH) {
        canvas.width = vW;
        canvas.height = vH;
      }

      // Crisp pixel rendering
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
      }
    };

    updateCanvasScale();
    window.addEventListener('resize', updateCanvasScale);
    return () => window.removeEventListener('resize', updateCanvasScale);
  }, []);

  // Global Keyboard Controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        engine.handleJumpDown();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        engine.handleSlideDown();
      } else if (e.code === 'KeyI' || e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        // Secret system: 'I' activates/toggles cat immortality (god mode)
        engine.toggleImmortality();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        engine.pauseGame();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        if (engine.state === 'GAME_OVER' || engine.state === 'PAUSED') {
          engine.restartGame();
        }
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        const nextMute = soundSynth.toggleMute();
        setIsMuted(nextMute);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        engine.handleJumpUp();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        engine.handleSlideUp();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Gesture Recognition on Game Container
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    // Detect fast swipe gestures
    if (diff < -30) {
      // Swipe Up -> Jump
      engineRef.current?.handleJumpDown();
      touchStartY.current = null;
    } else if (diff > 30) {
      // Swipe Down -> Slide
      engineRef.current?.handleSlideDown();
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const handleToggleMute = useCallback(() => {
    const nextMute = soundSynth.toggleMute();
    setIsMuted(nextMute);
  }, []);

  const handleTogglePause = useCallback(() => {
    engineRef.current?.pauseGame();
  }, []);

  const handleStart = useCallback(() => {
    engineRef.current?.startGame();
  }, []);

  const handleRestart = useCallback(() => {
    engineRef.current?.restartGame();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-Window Viewport - 100% edge-to-edge canvas with zero blank spaces */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
        <canvas
          ref={canvasRef}
          className="w-full h-full block pixelated select-none"
          style={{
            imageRendering: 'pixelated',
          }}
          onClick={() => {
            if (gameState === 'MENU' || gameState === 'GAME_OVER') {
              handleStart();
            }
          }}
        />

        {/* In-Viewport Top HUD: Stats & Sound/Pause Controls (Only shown during gameplay, pause, and game over) */}
        {gameState !== 'MENU' && (
          <HUD
            score={score}
            isPaused={gameState === 'PAUSED'}
            isMuted={isMuted}
            onTogglePause={handleTogglePause}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* State Modals */}
        {gameState === 'MENU' && (
          <StartScreen highScore={score.highScore} onStart={handleStart} />
        )}

        {gameState === 'PAUSED' && (
          <PauseModal onResume={handleTogglePause} onRestart={handleRestart} />
        )}

        {gameState === 'GAME_OVER' && (
          <GameOverModal score={score} onRestart={handleRestart} />
        )}

        {/* Desktop Keyboard Controls Legend inside Game Viewport at bottom */}
        <footer className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400/80 bg-slate-950/70 backdrop-blur-xs px-3.5 py-1 rounded-full border border-slate-800/60 tracking-wide select-none shadow-sm">
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300">W</kbd> Jump</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300">Down</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300">S</kbd> Slide</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300">P</kbd> Pause</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300">M</kbd> Mute</span>
        </footer>
      </div>

      {/* On-Screen Mobile Touch Buttons */}
      {gameState === 'PLAYING' && (
        <MobileControls
          onJumpStart={() => engineRef.current?.handleJumpDown()}
          onJumpEnd={() => engineRef.current?.handleJumpUp()}
          onSlideStart={() => engineRef.current?.handleSlideDown()}
          onSlideEnd={() => engineRef.current?.handleSlideUp()}
        />
      )}
    </div>
  );
};
