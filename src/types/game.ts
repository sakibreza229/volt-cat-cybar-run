/**
 * Type definitions for Volt Fox Parallax Runner
 */

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type FoxAnimationState = 'RUN' | 'JUMP' | 'DOUBLE_JUMP' | 'SLIDE' | 'CRASH' | 'IDLE';

export interface Fox {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  isGrounded: boolean;
  canDoubleJump: boolean;
  isSliding: boolean;
  slideCooldown: number;
  coyoteTime: number; // ms remaining after leaving ground
  jumpBufferTime: number; // ms remaining for pre-touchdown jump press
  animState: FoxAnimationState;
  animFrame: number;
  animTimer: number;
  overdriveTime: number; // ms remaining of hyper overdrive
  invincibleFlashTimer: number;
  tailPhysics: { x: number; y: number }[];
}

export type ObstacleType =
  | 'SPIKE_CLUSTER'      // Low ground hazard (jump over)
  | 'QUANTUM_PILLAR'     // Tall ground obstacle (high jump over)
  | 'SCANNER_DRONE'      // Mid/overhead flying sentinel with laser sweep (duck under)
  | 'LASER_BARRIER'      // Hovering horizontal beam (duck under or high jump over)
  | 'FLOATING_MAG_RAIL';  // Platform that can be hopped on top of

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  hitbox: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };
  hasPlatformTop?: boolean;
  passed: boolean;
  glowPhase: number;
  destroyed?: boolean;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  baseY: number;
  size: number;
  collected: boolean;
  floatPhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'pixel' | 'spark' | 'ring' | 'glow';
}

export interface ParallaxLayer {
  speedMultiplier: number;
  offset: number;
  render: (ctx: CanvasRenderingContext2D, width: number, height: number, offset: number, theme: BiomeTheme) => void;
}

export interface BiomeTheme {
  name: string;
  skyTop: string;
  skyBottom: string;
  starsColor: string;
  distantCityColor: string;
  midTowerColor: string;
  groundGridColor: string;
  groundEdgeGlow: string;
  accentColor: string;
}

export interface GameScore {
  distance: number;
  shards: number;
  score: number;
  highScore: number;
  speed: number;
  mode?: GameMode;
  crashReason?: string;
}

export type GameMode = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface GameModeConfig {
  id: GameMode;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  baseSpeed: number;
  maxSpeed: number;
  minGapFactor: number;
  scoreMultiplier: number;
  color: string;
  accentHex: string;
}

export interface ScoreHistoryItem {
  id: string;
  timestamp: number;
  score: number;
  distance: number;
  shards: number;
  mode: GameMode;
}

export interface CareerStats {
  totalRuns: number;
  totalDistance: number;
  totalShards: number;
  bestScoreOverall: number;
  bestScoresByMode: Record<GameMode, number>;
}
