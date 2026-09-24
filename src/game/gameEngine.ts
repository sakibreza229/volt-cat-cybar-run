/**
 * Game Engine for Volt Fox
 * Handles physics, input buffering, collision detection, obstacle spawning,
 * particle systems, and the 60fps game loop.
 */

import {
  GameState,
  Fox,
  Obstacle,
  Collectible,
  Particle,
  GameScore,
} from '../types/game';
import { drawVoltCat, drawObstacle, drawCollectibleShard } from './pixelSprites';
import { ParallaxSystem } from './parallaxLayers';
import { StarFallSystem } from './starFall';
import { soundSynth } from '../audio/synthAudio';

// Physics Configuration
const GRAVITY = 0.76;
const FAST_DROP_GRAVITY = 1.95;
const JUMP_VELOCITY = -13.2;
const DOUBLE_JUMP_VELOCITY = -11.0;
const VARIABLE_JUMP_DAMPING = 0.45;
const BASE_SPEED = 6.8;
const MAX_SPEED = 14.5;
const DEFAULT_GROUND_Y = 330;

export class GameEngine {
  public state: GameState = 'MENU';
  public score: GameScore = {
    distance: 0,
    shards: 0,
    score: 0,
    highScore: 0,
    speed: BASE_SPEED,
  };

  public virtualWidth: number = 960;
  public virtualHeight: number = 420;
  public groundY: number = DEFAULT_GROUND_Y;

  private fox: Fox = {
    x: 90,
    y: DEFAULT_GROUND_Y - 38,
    width: 48,
    height: 38,
    vy: 0,
    isGrounded: true,
    canDoubleJump: true,
    isSliding: false,
    slideCooldown: 0,
    coyoteTime: 0,
    jumpBufferTime: 0,
    animState: 'RUN',
    animFrame: 0,
    animTimer: 0,
    overdriveTime: 0,
    invincibleFlashTimer: 0,
    tailPhysics: [],
  };

  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private particles: Particle[] = [];
  private parallax: ParallaxSystem;
  private starFall: StarFallSystem;
  private previousRecord: number = 0;
  private recordBrokenTriggered: boolean = false;

  private isJumpPressed: boolean = false;
  private isSlidePressed: boolean = false;
  private lastObstacleSpawnDistance: number = 0;
  private nextObstacleMinDistance: number = 240;
  private animTime: number = 0;
  private lastTime: number = 0;
  private lastMilestoneTriggered: number = 0;
  private scoreUpdateTimer: number = 0;

  // Secret Immortality System
  public isImmortal: boolean = false;

  // Callback to update UI React state
  public onScoreUpdate?: (score: GameScore) => void;
  public onStateChange?: (state: GameState) => void;

  constructor() {
    this.parallax = new ParallaxSystem();
    this.starFall = new StarFallSystem();
    const savedHighScore = localStorage.getItem('voltfox_highscore');
    if (savedHighScore) {
      this.score.highScore = parseInt(savedHighScore, 10) || 0;
    }
  }

  public setDimensions(pixelWidth: number, pixelHeight: number) {
    if (!pixelWidth || !pixelHeight) return;
    const aspect = pixelWidth / pixelHeight;

    if (aspect >= 1.2) {
      // Landscape: Lock vertical height to 420 for 100% faithful physics & jump arcs;
      // dynamically scale horizontal virtualWidth to match the window's exact aspect ratio!
      this.virtualHeight = 420;
      this.virtualWidth = Math.max(640, Math.round(420 * aspect));
      this.groundY = 330;
    } else {
      // Portrait / Narrow screens:
      this.virtualWidth = 600;
      this.virtualHeight = Math.max(420, Math.round(600 / aspect));
      this.groundY = this.virtualHeight - 90;
    }

    this.parallax.setDimensions(this.virtualWidth, this.virtualHeight);
    this.starFall.setDimensions(this.virtualWidth);

    if (this.fox.isGrounded && !this.fox.isSliding) {
      this.fox.y = this.groundY - 38;
    }
  }

  public getVirtualDimensions() {
    return { width: this.virtualWidth, height: this.virtualHeight, groundY: this.groundY };
  }

  public startGame() {
    this.state = 'PLAYING';
    this.score.distance = 0;
    this.score.shards = 0;
    this.score.score = 0;
    this.score.speed = BASE_SPEED;

    this.fox.y = this.groundY - 38;
    this.fox.vy = 0;
    this.fox.isGrounded = true;
    this.fox.canDoubleJump = true;
    this.fox.isSliding = false;
    this.fox.overdriveTime = 0;
    this.fox.invincibleFlashTimer = 0;
    this.fox.animState = 'RUN';

    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.lastObstacleSpawnDistance = 0;
    this.nextObstacleMinDistance = 240;
    this.lastMilestoneTriggered = 0;

    // Snapshot existing record to beat for this run
    this.previousRecord = this.score.highScore;
    this.recordBrokenTriggered = false;
    this.starFall.reset();
    this.parallax.reset();

    soundSynth.startAmbientPulse(1.0);
    this.onStateChange?.(this.state);
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      soundSynth.stopAmbientPulse();
      this.onStateChange?.(this.state);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      soundSynth.startAmbientPulse(this.score.speed / BASE_SPEED);
      this.onStateChange?.(this.state);
    }
  }

  public restartGame() {
    this.startGame();
  }

  // --- INPUT HANDLERS ---

  public handleJumpDown() {
    if (this.state !== 'PLAYING') {
      if (this.state === 'MENU' || this.state === 'GAME_OVER') {
        this.startGame();
      }
      return;
    }

    this.isJumpPressed = true;
    this.fox.jumpBufferTime = 160; // 160ms input buffer

    // If currently sliding, cancel slide immediately and leap smoothly!
    if (this.fox.isSliding) {
      this.fox.isSliding = false;
      this.isSlidePressed = false;
      this.fox.height = 38;
      this.fox.y = this.groundY - 38;
      this.executeJump(false);
      return;
    }

    // Normal Jump or Coyote Jump
    if (this.fox.isGrounded || this.fox.coyoteTime > 0) {
      this.executeJump(false);
    }
    // Double Jump in mid-air
    else if (this.fox.canDoubleJump) {
      this.executeDoubleJump();
    }
  }

  public handleJumpUp() {
    this.isJumpPressed = false;
    // Variable jump: release early to cut jump height
    if (this.fox.vy < 0 && !this.fox.isGrounded) {
      this.fox.vy *= VARIABLE_JUMP_DAMPING;
    }
  }

  public handleSlideDown() {
    if (this.state !== 'PLAYING') return;
    this.isSlidePressed = true;

    // Aerodynamic pounce dive if airborne
    if (!this.fox.isGrounded) {
      // Smooth downward pounce trajectory, avoiding abrupt teleportation
      if (this.fox.vy < 5) {
        this.fox.vy = 5;
      }
      this.spawnSlideSparks(this.fox.x + 24, this.fox.y + 20, 2);
    } else {
      this.executeSlide();
    }
  }

  public handleSlideUp() {
    this.isSlidePressed = false;
    if (this.fox.isGrounded && this.fox.isSliding) {
      this.fox.isSliding = false;
      this.fox.height = 38;
      this.fox.y = this.groundY - 38;
      this.fox.animState = 'RUN';
    }
  }

  /**
   * Secret System: Toggles immortality mode.
   * When active, the cat cannot die, all obstacles shatter on contact,
   * the game never enters GAME_OVER, and the run continues indefinitely.
   */
  public toggleImmortality(): boolean {
    this.isImmortal = !this.isImmortal;
    if (this.isImmortal) {
      soundSynth.playShard(1);
      this.spawnExplosion(this.fox.x + 24, this.fox.y + 16, '#00F0FF', 14);
    }
    return this.isImmortal;
  }

  private executeJump(isDouble: boolean) {
    this.fox.vy = isDouble ? DOUBLE_JUMP_VELOCITY : JUMP_VELOCITY;
    this.fox.isGrounded = false;
    this.fox.coyoteTime = 0;
    this.fox.jumpBufferTime = 0;
    this.fox.isSliding = false;
    this.isSlidePressed = false; // Reset slide press so fast drop gravity doesn't crush the leap!
    this.fox.height = 38;
    this.fox.animState = isDouble ? 'DOUBLE_JUMP' : 'JUMP';

    if (!isDouble) {
      soundSynth.playJump();
      // Jump dust cloud
      this.spawnDustPuff(this.fox.x + 12, this.groundY, 8);
    }
  }

  private executeDoubleJump() {
    this.fox.canDoubleJump = false;
    this.executeJump(true);
    soundSynth.playDoubleJump();

    // Shockwave ring particle
    this.particles.push({
      x: this.fox.x + 24,
      y: this.fox.y + 20,
      vx: 0,
      vy: 0,
      size: 16,
      color: '#00F0FF',
      alpha: 1,
      life: 0,
      maxLife: 16,
      shape: 'ring',
    });

    // Jet sparks
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: this.fox.x + 24,
        y: this.fox.y + 28,
        vx: (Math.random() - 0.5) * 6 - 2,
        vy: Math.random() * 4 + 2,
        size: Math.random() * 3 + 1,
        color: '#38BDF8',
        alpha: 1,
        life: 0,
        maxLife: 20,
        shape: 'spark',
      });
    }
  }

  private executeSlide() {
    if (!this.fox.isSliding) {
      this.fox.isSliding = true;
      this.fox.height = 20; // Halved height to slide under hazards
      this.fox.y = this.groundY - 20;
      this.fox.animState = 'SLIDE';
      soundSynth.playSlide();
      this.spawnSlideSparks(this.fox.x + 10, this.groundY, 6);
    }
  }

  // --- MAIN LOOP UPDATE ---

  public update(time: number) {
    if (this.lastTime === 0) {
      this.lastTime = time;
    }
    const delta = Math.min((time - this.lastTime) / 1000, 0.05); // Cap to 50ms to prevent spiral
    this.lastTime = time;
    this.animTime += delta * 1000;

    // Ambient background speed during menus or full runner speed during play
    const activeSpeed = this.state === 'PLAYING' ? this.score.speed : BASE_SPEED * 0.4;
    this.parallax.update(activeSpeed, delta, this.score.score);
    this.starFall.update(delta);

    if (this.state !== 'PLAYING') {
      // In MENU, keep cat animated so it looks alive and responsive on the title screen
      this.fox.animTimer += delta * 10;
      this.fox.animFrame = this.fox.animTimer;
      return;
    }

    // 1. Dynamic Speed Progression (Increases gradually with distance)
    const speedRatio = Math.min(this.score.distance / 2500, 1);
    this.score.speed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * speedRatio;

    // 2. Fox Physics & Animation
    this.updateFox(delta);

    // 4. Overdrive Timer
    if (this.fox.overdriveTime > 0) {
      this.fox.overdriveTime -= delta * 1000;
      if (this.fox.overdriveTime <= 0) {
        this.fox.overdriveTime = 0;
      }
    }

    if (this.fox.invincibleFlashTimer > 0) {
      this.fox.invincibleFlashTimer -= delta * 1000;
    }

    // 5. Obstacles & Collectibles
    this.updateObstacles(delta);
    this.updateCollectibles(delta);
    this.spawnEntities();

    // 6. Particle Physics
    this.updateParticles(delta);

    // 7. Score Calculation
    this.score.distance += this.score.speed * delta * 2.5;
    const basePts = Math.floor(this.score.distance);
    const shardPts = this.score.shards * 75;
    this.score.score = basePts + shardPts;

    // Check if player broke their old high score record!
    // If player had a saved record (> 0), triggers when exceeding it.
    // If fresh run with 0 record, triggers upon achieving first notable milestone (>= 300 points).
    const targetToBeat = this.previousRecord > 0 ? this.previousRecord : 300;
    if (this.score.score > targetToBeat && !this.recordBrokenTriggered) {
      this.recordBrokenTriggered = true;
      this.starFall.trigger(this.score.score);
    }

    if (this.score.score > this.score.highScore) {
      this.score.highScore = this.score.score;
      localStorage.setItem('voltfox_highscore', String(this.score.highScore));
    }

    // Milestone fanfare when gaining 500++ points
    const currentMilestone = Math.floor(this.score.score / 500);
    if (currentMilestone > this.lastMilestoneTriggered && currentMilestone > 0) {
      this.lastMilestoneTriggered = currentMilestone;
      soundSynth.playMilestone();
    }

    // Throttle React state update to ~12fps (prevents 60fps component thrashing and eliminats stutter)
    this.scoreUpdateTimer += delta;
    if (this.scoreUpdateTimer >= 0.08) {
      this.scoreUpdateTimer = 0;
      this.onScoreUpdate?.({ ...this.score });
    }
  }

  private updateFox(delta: number) {
    const frameScale = delta * 60;

    // Jump Buffering timer countdown
    if (this.fox.jumpBufferTime > 0) {
      this.fox.jumpBufferTime -= delta * 1000;
    }

    // Coyote time countdown
    if (!this.fox.isGrounded && this.fox.coyoteTime > 0) {
      this.fox.coyoteTime -= delta * 1000;
    }

    // Gravity calculation (Faster if holding slide in air)
    const currentGravity = this.isSlidePressed && !this.fox.isGrounded ? FAST_DROP_GRAVITY : GRAVITY;
    this.fox.vy += currentGravity * frameScale;
    this.fox.y += this.fox.vy * frameScale;

    // Check collision with floating platforms
    let landedOnPlatform = false;
    for (const obs of this.obstacles) {
      if (obs.type === 'FLOATING_MAG_RAIL' && !obs.destroyed) {
        const platTop = obs.y;
        const foxBottom = this.fox.y + this.fox.height;
        const foxPrevBottom = foxBottom - this.fox.vy * frameScale;

        // Fox is within platform X bounds
        if (
          this.fox.x + this.fox.width > obs.x + 8 &&
          this.fox.x < obs.x + obs.width - 8 &&
          foxPrevBottom <= platTop + 8 &&
          foxBottom >= platTop &&
          this.fox.vy >= 0
        ) {
          this.fox.y = platTop - this.fox.height;
          this.fox.vy = 0;
          landedOnPlatform = true;
          this.handleTouchdown();
          break;
        }
      }
    }

    // Check Ground Collision
    const currentGround = this.groundY;
    if (!landedOnPlatform && this.fox.y + this.fox.height >= currentGround) {
      this.fox.y = currentGround - this.fox.height;
      this.fox.vy = 0;
      this.handleTouchdown();
    } else if (!landedOnPlatform && this.fox.isGrounded) {
      // Fox walked off an edge/platform: start coyote time
      this.fox.isGrounded = false;
      this.fox.coyoteTime = 120; // 120ms coyote window
    }

    // Handle Sliding state
    if (this.isSlidePressed && this.fox.isGrounded) {
      this.executeSlide();
      // Slide sparks
      if (Math.random() < 0.6) {
        this.spawnSlideSparks(this.fox.x + 8, currentGround, 2);
      }
    } else if (!this.isSlidePressed && this.fox.isSliding) {
      this.fox.isSliding = false;
      this.fox.height = 38;
      this.fox.y = currentGround - 38;
      this.fox.animState = 'RUN';
    }

    // Running foot dust
    if (this.fox.isGrounded && !this.fox.isSliding && Math.random() < 0.3) {
      this.spawnDustPuff(this.fox.x + 4, currentGround, 1);
    }

    // Running Animation frames (Speed adjusted)
    this.fox.animTimer += delta * 15 * (this.score.speed / BASE_SPEED);
    this.fox.animFrame = this.fox.animTimer;
  }

  private handleTouchdown() {
    if (!this.fox.isGrounded) {
      this.fox.isGrounded = true;
      this.fox.canDoubleJump = true;
      this.fox.coyoteTime = 0;

      // Executed buffered jump immediately!
      if (this.fox.jumpBufferTime > 0 || this.isJumpPressed) {
        this.executeJump(false);
      } else if (this.isSlidePressed) {
        this.executeSlide();
        this.spawnDustPuff(this.fox.x + 20, this.groundY, 6);
      } else {
        this.fox.isSliding = false;
        this.fox.height = 38;
        this.fox.y = this.groundY - 38;
        this.fox.animState = 'RUN';
        this.spawnDustPuff(this.fox.x + 20, this.groundY, 6);
      }
    }
  }

  private updateObstacles(delta: number) {
    const frameScale = delta * 60;
    const moveDist = this.score.speed * frameScale;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= moveDist;

      // Check Fox Collision
      if (!obs.passed && !obs.destroyed) {
        if (this.checkCollision(obs)) {
          if (this.isImmortal) {
            // Secret Immortality: Destroy obstacle on contact, never die, game continues indefinitely!
            obs.destroyed = true;
            soundSynth.playShatter();
            this.spawnExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#38BDF8', 16);
            this.score.score += 250;
            continue;
          } else if (this.fox.overdriveTime > 0) {
            // Shatter obstacle in Overdrive!
            obs.destroyed = true;
            soundSynth.playShatter();
            this.spawnExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#38BDF8', 16);
            this.score.score += 250;
          } else {
            // Player Crash!
            this.handleCrash();
            return;
          }
        }

        // Passed successfully
        if (obs.x + obs.width < this.fox.x) {
          obs.passed = true;
        }
      }

      // Despawn offscreen
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private updateCollectibles(delta: number) {
    const frameScale = delta * 60;
    const moveDist = this.score.speed * frameScale;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      c.x -= moveDist;

      // Collection Check (Circle-box proximity)
      const foxCenterX = this.fox.x + this.fox.width / 2;
      const foxCenterY = this.fox.y + this.fox.height / 2;
      const dist = Math.hypot(foxCenterX - c.x, foxCenterY - c.y);

      if (dist < c.size + 24 && !c.collected) {
        c.collected = true;
        this.score.shards++;
        soundSynth.playShard(this.score.shards);
        this.spawnCollectSparkle(c.x, c.y);

        // Every 6 shards activates Overdrive!
        if (this.score.shards % 6 === 0) {
          this.fox.overdriveTime = 4200; // 4.2 seconds of invincibility & dash
          soundSynth.playOverdrive();
          this.spawnExplosion(this.fox.x + 24, this.fox.y + 18, '#FDE047', 24);
        }

        this.collectibles.splice(i, 1);
        continue;
      }

      if (c.x < -40) {
        this.collectibles.splice(i, 1);
      }
    }
  }

  private spawnEntities() {
    // Distance-based generation with minimum safe gaps
    const currentDist = this.score.distance;
    if (currentDist - this.lastObstacleSpawnDistance < this.nextObstacleMinDistance) {
      return;
    }

    this.lastObstacleSpawnDistance = currentDist;
    // Vary gap based on speed to ensure reactable intervals
    this.nextObstacleMinDistance = 280 + Math.random() * 220 + (this.score.speed * 12);

    const rand = Math.random();
    const spawnX = this.virtualWidth + 60;

    // 1. SCANNER DRONE (Aerial hazard: Must slide under!)
    if (rand < 0.28) {
      const droneW = 44;
      const droneH = 26;
      // Hovering at height where a standing fox hits it, but sliding fox glides underneath!
      const droneY = this.groundY - 58;

      this.obstacles.push({
        id: Date.now() + Math.random(),
        type: 'SCANNER_DRONE',
        x: spawnX,
        y: droneY,
        width: droneW,
        height: droneH,
        hitbox: {
          offsetX: 4,
          offsetY: 4,
          width: droneW - 8,
          height: droneH - 4,
        },
        passed: false,
        glowPhase: Math.random() * Math.PI,
      });

      // Spawn a low data shard under the drone to reward clean slides!
      this.collectibles.push({
        id: Date.now() + Math.random(),
        x: spawnX + 22,
        y: this.groundY - 14,
        baseY: this.groundY - 14,
        size: 8,
        collected: false,
        floatPhase: 0,
      });
    }
    // 2. TALL QUANTUM PILLAR (Requires clean leap)
    else if (rand < 0.50) {
      const w = 28;
      const h = 54;
      this.obstacles.push({
        id: Date.now() + Math.random(),
        type: 'QUANTUM_PILLAR',
        x: spawnX,
        y: this.groundY - h,
        width: w,
        height: h,
        hitbox: {
          offsetX: 4,
          offsetY: 2,
          width: w - 8,
          height: h - 4,
        },
        passed: false,
        glowPhase: 0,
      });

      // Airborne shard above the pillar
      this.collectibles.push({
        id: Date.now() + Math.random(),
        x: spawnX + 14,
        y: this.groundY - h - 42,
        baseY: this.groundY - h - 42,
        size: 9,
        collected: false,
        floatPhase: 0,
      });
    }
    // 3. FLOATING MAG RAIL (Platform to leap on)
    else if (rand < 0.72) {
      const platW = 120;
      const platH = 14;
      const platY = this.groundY - 74;

      this.obstacles.push({
        id: Date.now() + Math.random(),
        type: 'FLOATING_MAG_RAIL',
        x: spawnX,
        y: platY,
        width: platW,
        height: platH,
        hitbox: {
          offsetX: 0,
          offsetY: 0,
          width: 0,
          height: 0, // No lethal collision, only landable top
        },
        hasPlatformTop: true,
        passed: false,
        glowPhase: 0,
      });

      // Place a cluster of ground spikes underneath the rail!
      this.obstacles.push({
        id: Date.now() + Math.random() + 1,
        type: 'SPIKE_CLUSTER',
        x: spawnX + 30,
        y: this.groundY - 32,
        width: 44,
        height: 32,
        hitbox: {
          offsetX: 6,
          offsetY: 6,
          width: 32,
          height: 26,
        },
        passed: false,
        glowPhase: 0,
      });

      // Shard line across the elevated platform
      for (let s = 0; s < 3; s++) {
        this.collectibles.push({
          id: Date.now() + Math.random() + s,
          x: spawnX + 24 + s * 36,
          y: platY - 22,
          baseY: platY - 22,
          size: 8,
          collected: false,
          floatPhase: s * 0.8,
        });
      }
    }
    // 4. SPIKE CLUSTER (Ground spikes)
    else {
      const w = 48;
      const h = 34;
      this.obstacles.push({
        id: Date.now() + Math.random(),
        type: 'SPIKE_CLUSTER',
        x: spawnX,
        y: this.groundY - h,
        width: w,
        height: h,
        hitbox: {
          offsetX: 6,
          offsetY: 6,
          width: w - 12,
          height: h - 8,
        },
        passed: false,
        glowPhase: 0,
      });

      // Jump reward shard
      this.collectibles.push({
        id: Date.now() + Math.random(),
        x: spawnX + 24,
        y: this.groundY - h - 34,
        baseY: this.groundY - h - 34,
        size: 9,
        collected: false,
        floatPhase: 0,
      });
    }
  }

  private checkCollision(obs: Obstacle): boolean {
    if (obs.type === 'FLOATING_MAG_RAIL') return false;

    // Forgiving inner hitboxes for smooth game feel
    const foxBox = {
      x: this.fox.x + 8,
      y: this.fox.y + 4,
      width: this.fox.width - 16,
      height: this.fox.height - 6,
    };

    const obsBox = {
      x: obs.x + obs.hitbox.offsetX,
      y: obs.y + obs.hitbox.offsetY,
      width: obs.hitbox.width,
      height: obs.hitbox.height,
    };

    return (
      foxBox.x < obsBox.x + obsBox.width &&
      foxBox.x + foxBox.width > obsBox.x &&
      foxBox.y < obsBox.y + obsBox.height &&
      foxBox.y + foxBox.height > obsBox.y
    );
  }

  private handleCrash() {
    if (this.isImmortal) return;
    this.state = 'GAME_OVER';
    this.fox.animState = 'CRASH';
    soundSynth.stopAmbientPulse();
    soundSynth.playCrash();

    // Stumble crash particles
    this.spawnExplosion(this.fox.x + 24, this.fox.y + 18, '#EF4444', 30);
    this.onScoreUpdate?.({ ...this.score });
    this.onStateChange?.(this.state);
  }

  // --- PARTICLE HELPERS ---

  private updateParticles(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta * 60;
      p.y += p.vy * delta * 60;
      p.life += delta * 60;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.shape === 'ring') {
        p.size += delta * 120;
      }

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnDustPuff(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y - 2 + Math.random() * 4,
        vx: -this.score.speed * 0.4 - Math.random() * 2,
        vy: -Math.random() * 1.5 - 0.2,
        size: Math.random() * 3 + 2,
        color: '#64748B',
        alpha: 0.6,
        life: 0,
        maxLife: 14 + Math.random() * 8,
        shape: 'pixel',
      });
    }
  }

  private spawnSlideSparks(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y - 2,
        vx: -this.score.speed * 0.8 - Math.random() * 4,
        vy: -Math.random() * 3 - 0.5,
        size: Math.random() * 3 + 1,
        color: Math.random() < 0.5 ? '#FBBF24' : '#F97316',
        alpha: 1,
        life: 0,
        maxLife: 10 + Math.random() * 8,
        shape: 'spark',
      });
    }
  }

  private spawnCollectSparkle(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: '#00F0FF',
        alpha: 1,
        life: 0,
        maxLife: 18,
        shape: 'spark',
      });
    }
  }

  private spawnExplosion(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: 24,
        shape: 'pixel',
      });
    }
  }

  // --- RENDER PIPELINE ---

  public render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

    // 1. Multi-Layer Parallax Background (Colors scale with 500+ score milestones)
    // Star fall is rendered inside parallax behind all buildings
    this.parallax.render(ctx, this.virtualWidth, this.virtualHeight, this.groundY, this.animTime, this.score.speed, this.score.score, this.starFall);

    // 2. Obstacles
    for (const obs of this.obstacles) {
      if (!obs.destroyed) {
        drawObstacle(ctx, obs, this.animTime);
      }
    }

    // 3. Collectibles
    for (const c of this.collectibles) {
      if (!c.collected) {
        drawCollectibleShard(ctx, c, this.animTime);
      }
    }

    // 4. Volt Cat Pixel Character
    drawVoltCat(
      ctx,
      this.fox.x,
      this.fox.y,
      this.fox.width,
      this.fox.height,
      this.fox.animState,
      this.fox.animFrame,
      this.fox.overdriveTime,
      this.fox.invincibleFlashTimer,
      this.fox.isGrounded,
      this.fox.vy
    );

    // 5. Particle Effects
    this.renderParticles(ctx);

    // 6. Simplified Celebratory Text: only "NEW RECORD", dynamically matching active game color cycle
    const activeAccent = this.parallax.getActiveAccent(this.score.score);
    this.starFall.renderText(ctx, this.virtualWidth, activeAccent);
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.restore();
    }
  }
}
