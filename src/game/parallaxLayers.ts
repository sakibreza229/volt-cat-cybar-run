/**
 * Multi-layer Parallax Background Renderer
 * Provides deep atmospheric perspective, dynamic biomes, and smooth speed scaling.
 * Perfectly seamless infinite looping with zero discontinuity or jump resets.
 */

import { BiomeTheme } from '../types/game';
import type { StarFallSystem } from './starFall';

export const BIOMES: BiomeTheme[] = [
  {
    name: 'Midnight Cyberway',
    skyTop: '#050814',
    skyBottom: '#0F172A',
    starsColor: '#E2E8F0',
    distantCityColor: '#111827',
    midTowerColor: '#1E293B',
    groundGridColor: '#0284C7',
    groundEdgeGlow: '#00F0FF',
    accentColor: '#38BDF8',
  },
  {
    name: 'Amber Solar Flare',
    skyTop: '#180B04',
    skyBottom: '#291405',
    starsColor: '#FED7AA',
    distantCityColor: '#1C1917',
    midTowerColor: '#451A03',
    groundGridColor: '#D97706',
    groundEdgeGlow: '#F59E0B',
    accentColor: '#FBBF24',
  },
  {
    name: 'Emerald Matrix',
    skyTop: '#021A11',
    skyBottom: '#062B1D',
    starsColor: '#A7F3D0',
    distantCityColor: '#064E3B',
    midTowerColor: '#065F46',
    groundGridColor: '#059669',
    groundEdgeGlow: '#10B981',
    accentColor: '#34D399',
  },
  {
    name: 'Ultraviolet Horizon',
    skyTop: '#1A0626',
    skyBottom: '#2E1065',
    starsColor: '#E9D5FF',
    distantCityColor: '#3B0764',
    midTowerColor: '#581C87',
    groundGridColor: '#9333EA',
    groundEdgeGlow: '#C084FC',
    accentColor: '#E879F9',
  },
];

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
}

interface BackgroundAircraft {
  x: number;
  y: number;
  speed: number;
  dir: 1 | -1; // 1 = flying left-to-right, -1 = flying right-to-left
  size: number;
  contrailLen: number;
  active: boolean;
  cooldownTimer: number;
}

interface SkywayCar {
  x: number;
  laneY: number; // offset relative to skyway deck
  speed: number;
  dir: 1 | -1; // 1 = left to right (from left), -1 = right to left (from right)
  width: number;
  height: number;
  bodyColor: string;
  headlightColor: string;
}

// Fixed pattern repeat widths to ensure 100% seamless mathematical loops
const CITY_PATTERN = [
  { w: 45, h: 140 },
  { w: 30, h: 90 },
  { w: 60, h: 170 },
  { w: 35, h: 110 },
  { w: 50, h: 130 },
  { w: 70, h: 200 },
  { w: 40, h: 100 },
  { w: 55, h: 160 },
  { w: 30, h: 80 },
  { w: 65, h: 145 },
];
// Sum of building widths: 480px
const CITY_PATTERN_WIDTH = CITY_PATTERN.reduce((acc, b) => acc + b.w, 0);

const PIER_SPACING = 220;
const GROUND_TILE_WIDTH = 40;

export class ParallaxSystem {
  private stars: Star[] = [];
  private aircraft: BackgroundAircraft[] = [];
  private skywayCars: SkywayCar[] = [];
  private carSpawnTimer: number = 0;
  private nextCarSpawnTime: number = 1.4;
  private distance: number = 0;
  private lastAircraftMilestone: number = 0;
  private targetTrafficCap: number = 2;
  private trafficCapTimer: number = 0;

  // Celestial Chrome Moon
  private moonX: number = 840; // Initial rise in upper right sky
  private readonly moonSpeed: number = 8.5; // Smooth, slow celestial traversal
  private moonActive: boolean = true;
  private moonPauseTimer: number = 0;
  private width: number = 960;
  private height: number = 420;

  constructor() {
    this.initStars();
    this.initAircraft();
    this.initSkywayCars();
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (width > 960 && this.stars.length < 140) {
      const needed = Math.floor((width - 960) / 10);
      for (let i = 0; i < needed; i++) {
        this.stars.push({
          x: Math.random() * width,
          y: Math.random() * 220,
          size: Math.random() < 0.25 ? 2 : 1,
          brightness: Math.random(),
          twinkleSpeed: 0.02 + Math.random() * 0.04,
        });
      }
    }
  }

  public reset() {
    this.lastAircraftMilestone = 0;
    this.aircraft = [];
    this.targetTrafficCap = 2;
    this.trafficCapTimer = 0;
    this.moonX = this.width - 120;
    this.moonActive = true;
    this.moonPauseTimer = 0;
    this.initSkywayCars();
  }

  private initStars() {
    this.stars = [];
    const count = Math.max(80, Math.floor(this.width / 12));
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * 220,
        size: Math.random() < 0.25 ? 2 : 1,
        brightness: Math.random(),
        twinkleSpeed: 0.02 + Math.random() * 0.04,
      });
    }
  }

  private initAircraft() {
    // Starts empty: aircraft ONLY appears when hitting 1000-point milestones!
    this.aircraft = [];
    this.lastAircraftMilestone = 0;
  }

  /**
   * Spawns exactly 1 single cyber aircraft when hitting each 1000 points milestone.
   * Approaches head-on from the opposite side of the cat at a smooth, readable speed.
   */
  public launchMilestoneAircraft() {
    this.aircraft = [
      {
        x: this.width + 120, // Enters from the right (opposite side of the cat)
        y: 38 + Math.random() * 45,
        speed: 1.7, // Smooth, calm, readable cruising speed (not too fast)
        dir: -1, // Flying right to left, opposite of the cat's forward path
        size: 0.95,
        contrailLen: 48,
        active: true,
        cooldownTimer: 0,
      },
    ];
  }

  private initSkywayCars() {
    // Start with 2 initial cars on the overbridge in opposite directions with balanced, uniform cruise speeds
    this.skywayCars = [
      {
        x: 320,
        laneY: -7,
        speed: 2.1,
        dir: 1,
        width: 26,
        height: 5,
        bodyColor: '#0F172A',
        headlightColor: '#00F0FF',
      },
      {
        x: 740,
        laneY: -10,
        speed: 2.3, // Brisk and healthy speed for opposite direction
        dir: -1,
        width: 25,
        height: 5,
        bodyColor: '#1E293B',
        headlightColor: '#FDE047',
      },
    ];
  }

  public update(speed: number, delta: number, scorePoints: number = 0) {
    const frameScale = delta * 60;
    this.distance += speed * delta * 60;

    // 0. Celestial Chrome Moon: Moves slowly along a real parabolic arc from the opposite direction of the cat (right to left)
    if (this.moonActive) {
      this.moonX -= this.moonSpeed * delta;
      if (this.moonX < -60) {
        this.moonActive = false;
        this.moonPauseTimer = 16; // Rest below horizon before rising again
      }
    } else {
      this.moonPauseTimer -= delta;
      if (this.moonPauseTimer <= 0) {
        this.moonX = this.width + 60; // Rises from the opposite direction horizon (right side)
        this.moonActive = true;
      }
    }

    // 1. Cyber Aircraft: Only launches 1 aircraft when the user hits each 1000-point milestone!
    // (e.g. 1000, 2000, 3000, etc.)
    if (scorePoints >= 1000) {
      const milestone = Math.floor(scorePoints / 1000);
      if (milestone > this.lastAircraftMilestone) {
        this.lastAircraftMilestone = milestone;
        this.launchMilestoneAircraft();
      }
    }

    // Update active aircraft position
    if (this.aircraft.length > 0) {
      const plane = this.aircraft[0];
      if (plane.active) {
        plane.x += plane.dir * plane.speed * frameScale;

        // When plane completes its pass and leaves the screen, it disappears
        // It will NOT repeat or loop multiple times; it stays hidden until the next 1000-point milestone!
        if (plane.dir === -1 && plane.x < -200) {
          plane.active = false;
        } else if (plane.dir === 1 && plane.x > this.width + 200) {
          plane.active = false;
        }
      }
    }

    // 2. Update overbridge car traffic
    for (let i = this.skywayCars.length - 1; i >= 0; i--) {
      const car = this.skywayCars[i];
      car.x += car.dir * car.speed * frameScale;

      // Remove car when fully off screen
      if ((car.dir === 1 && car.x > this.width + 80) || (car.dir === -1 && car.x < -80)) {
        this.skywayCars.splice(i, 1);
      }
    }

    // 3. Dynamic traffic cap: randomly changes per frame/time interval so the bridge
    // is NOT filled with 5 cars constantly, while strictly capping at MAX 5 cars
    this.trafficCapTimer += delta;
    if (this.trafficCapTimer >= 3.5) {
      this.trafficCapTimer = 0;
      // Dynamically fluctuates: often 1-3 cars, occasionally 4, maximum 5
      const roll = Math.random();
      if (roll < 0.28) {
        this.targetTrafficCap = 1;
      } else if (roll < 0.65) {
        this.targetTrafficCap = 2;
      } else if (roll < 0.88) {
        this.targetTrafficCap = 3;
      } else if (roll < 0.96) {
        this.targetTrafficCap = 4;
      } else {
        this.targetTrafficCap = 5; // Absolute maximum cap
      }
    }

    // 4. Overbridge car spawning with balanced, close speeds & non-overlapping departures
    this.carSpawnTimer += delta;
    if (this.carSpawnTimer >= this.nextCarSpawnTime) {
      this.carSpawnTimer = 0;
      this.nextCarSpawnTime = 1.6 + Math.random() * 2.6;

      const currentMaxAllowed = Math.min(this.targetTrafficCap, 5);

      // Strict check: NEVER exceed 5 cars under any circumstance
      if (this.skywayCars.length < currentMaxAllowed && this.skywayCars.length < 5) {
        // Randomly pick direction (1 = left-to-right, -1 = right-to-left)
        const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
        const laneY = dir === 1 ? -7 : -10; // Dual lanes ensure opposing cars pass cleanly
        const startX = dir === 1 ? -45 : this.width + 45;

        // Ensure cars don't spawn right on top of another car in the same lane
        const hasCarNearby = this.skywayCars.some(
          (c) => c.dir === dir && Math.abs(c.x - startX) < 130
        );

        if (!hasCarNearby) {
          const carWidth = 22 + Math.floor(Math.random() * 8);

          // Close, uniform cruise speed across all cars (no car is very fast or lagging):
          // Forward direction: 2.1 +/- 0.1
          // Opposite direction: 2.3 +/- 0.1 (lively & brisk, not too slow)
          const carSpeed = dir === 1
            ? 2.05 + Math.random() * 0.15
            : 2.25 + Math.random() * 0.15;

          const colors = ['#0F172A', '#1E293B', '#090D1A', '#1E1B4B', '#111827'];
          const lightColors = ['#00F0FF', '#FDE047', '#38BDF8', '#FFFFFF', '#67E8F9'];

          this.skywayCars.push({
            x: startX,
            laneY,
            speed: carSpeed,
            dir,
            width: carWidth,
            height: 5,
            bodyColor: colors[Math.floor(Math.random() * colors.length)],
            headlightColor: lightColors[Math.floor(Math.random() * lightColors.length)],
          });
        }
      }
    }
  }

  /**
   * Only change the color theme after gaining 500++ points!
   * Stays completely solid and unchanged during 0 - 499 points.
   * At 500+, 1000+, 1500+ etc., crossfades smoothly for a brief moment and locks to the new theme.
   */
  public getBiome(scorePoints: number): { current: BiomeTheme; next: BiomeTheme; blend: number } {
    // Stage interval is 500 points
    const STAGE_POINTS = 500;
    const TRANSITION_POINTS = 40; // Brief 40-point smooth transition when crossing milestone

    if (scorePoints < STAGE_POINTS) {
      // Under 500 points: 100% stable initial theme (Midnight Cyberway)
      return {
        current: BIOMES[0],
        next: BIOMES[0],
        blend: 0,
      };
    }

    // Above 500 points: milestone index = 1 for 500-999, 2 for 1000-1499, etc.
    const stage = Math.floor(scorePoints / STAGE_POINTS);
    const prevThemeIdx = (stage - 1) % BIOMES.length;
    const newThemeIdx = stage % BIOMES.length;

    const progressInStage = scorePoints % STAGE_POINTS;

    if (progressInStage < TRANSITION_POINTS) {
      // Smoothly crossfading from previous theme into new theme
      const blend = progressInStage / TRANSITION_POINTS;
      return {
        current: BIOMES[prevThemeIdx],
        next: BIOMES[newThemeIdx],
        blend,
      };
    }

    // Solidly locked on the new theme until the next 500-point milestone!
    return {
      current: BIOMES[newThemeIdx],
      next: BIOMES[newThemeIdx],
      blend: 0,
    };
  }

  public getActiveAccent(scorePoints: number): string {
    return getActiveBiomeAccentColor(scorePoints);
  }

  /**
   * Render all parallax layers with perfect loop wrapping
   */
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    groundY: number,
    animTime: number,
    speed: number,
    scorePoints: number,
    starFall?: StarFallSystem
  ) {
    const { current, next, blend } = this.getBiome(scorePoints);

    // 1. SKY GRADIENT
    this.renderSky(ctx, width, height, current, next, blend);

    // 2. CELESTIAL BODY & STARS (Circular moon with dynamic game accent color and shade)
    this.renderCelestialAndStars(ctx, width, height, animTime, current, next, blend);

    // 2.2 BACKGROUND FALLING STARS (Always at the bottom layer behind all buildings)
    if (starFall) {
      starFall.renderBackground(ctx);
    }

    // 2.5 BACKGROUND HIGH-ALTITUDE AIRCRAFT (Always smoothly cruising in both directions)
    this.renderBackgroundAircraft(ctx, width, current, next, blend);

    // 3. LAYER 1: DISTANT MEGAPOLIS SKYLINE (Speed factor 0.08)
    // Seamless modulo using exact pattern width (480px)
    const distOffset = ((this.distance * 0.08) % CITY_PATTERN_WIDTH + CITY_PATTERN_WIDTH) % CITY_PATTERN_WIDTH;
    this.renderDistantCity(ctx, width, groundY, distOffset, current, next, blend);

    // 4. LAYER 2: MIDGROUND SKYWAY VIADUCT (Speed factor 0.22)
    // Seamless modulo using exact pier spacing (220px)
    // Preserves the overbridge intact, with randomized two-way hover-car traffic
    const midOffset = ((this.distance * 0.22) % PIER_SPACING + PIER_SPACING) % PIER_SPACING;
    this.renderMidgroundSkyway(ctx, width, groundY, midOffset, current, animTime);

    // Note: Foreground poles/sticks removed to keep the runner's main path clear and readable!

    // 5. GROUND TRACK & LEV-RAIL HIGHWAY (Speed factor 1.0)
    // Seamless modulo using exact tile width (40px)
    const groundOffset = ((this.distance * 1.0) % GROUND_TILE_WIDTH + GROUND_TILE_WIDTH) % GROUND_TILE_WIDTH;
    this.renderGroundTrack(ctx, width, height, groundY, groundOffset, current, animTime, speed);
  }

  private renderSky(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    curr: BiomeTheme,
    next: BiomeTheme,
    blend: number
  ) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    if (blend > 0) {
      grad.addColorStop(0, blendColors(curr.skyTop, next.skyTop, blend));
      grad.addColorStop(0.7, blendColors(curr.skyBottom, next.skyBottom, blend));
    } else {
      grad.addColorStop(0, curr.skyTop);
      grad.addColorStop(0.7, curr.skyBottom);
    }
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private renderCelestialAndStars(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    animTime: number,
    currTheme: BiomeTheme,
    nextTheme: BiomeTheme,
    blend: number
  ) {
    const accentColor = blend > 0 ? blendColors(currTheme.accentColor, nextTheme.accentColor, blend) : currTheme.accentColor;
    const skyTop = blend > 0 ? blendColors(currTheme.skyTop, nextTheme.skyTop, blend) : currTheme.skyTop;
    const starsColor = blend > 0 ? blendColors(currTheme.starsColor, nextTheme.starsColor, blend) : currTheme.starsColor;

    // 1. Celestial Circle Moon with Game Accent Color and Shade:
    // Moves slowly in a parabolic arc like a real celestial moon, appearing from the opposite direction of the cat (right to left)
    if (this.moonActive) {
      const minX = -60;
      const maxX = width + 60;
      const u = Math.max(0, Math.min(1, (this.moonX - minX) / (maxX - minX)));

      // Real parabolic trajectory: rises on right horizon, crests at upper sky apex, sets on left horizon
      const horizonY = 165;
      const apexY = 50;
      const arcHeight = horizonY - apexY;
      const moonY = horizonY - 4 * u * (1 - u) * arcHeight;

      // Atmospheric fade near horizon
      let moonAlpha = 1.0;
      if (u > 0.90) {
        moonAlpha = Math.max(0, (1 - u) / 0.10);
      } else if (u < 0.10) {
        moonAlpha = Math.max(0, u / 0.10);
      }

      this.renderCelestialCircleMoon(ctx, this.moonX, moonY, 26, moonAlpha, accentColor, skyTop);
    }

    // Smoothly drifting twinkling stars with positive wrapping
    ctx.fillStyle = starsColor;
    for (const star of this.stars) {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(animTime * star.twinkleSpeed + star.brightness));
      ctx.globalAlpha = alpha;
      const screenX = ((star.x - (this.distance * 0.02)) % width + width) % width;
      ctx.fillRect(screenX, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Circular celestial moon containing a glowing waning crescent inside.
   * Features a lower-contrast, darker shaded minimal gradient style to keep
   * background visuals atmospheric without distracting the player.
   * Includes a small subtle lunar skull silhouette Easter egg embedded on the moon.
   */
  private renderCelestialCircleMoon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    alpha: number,
    accentColor: string,
    skyTop: string
  ) {
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    // 1. Minimal, low-contrast celestial aura (darker, non-distracting)
    const haloRadius = radius * 1.8;
    const glowGrad = ctx.createRadialGradient(0, 0, radius * 0.7, 0, 0, haloRadius);
    glowGrad.addColorStop(0, accentColor + '18');
    glowGrad.addColorStop(0.55, accentColor + '05');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Strict circular clipping ensures mathematically clean circle boundary
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();

    // 3. Dark Earthshine Side of the Circular Moon
    // Minimal soft radial gradient using dark sky tone and deep space shades
    const darkDiskGrad = ctx.createRadialGradient(
      -radius * 0.25,
      -radius * 0.25,
      radius * 0.1,
      0,
      0,
      radius
    );
    darkDiskGrad.addColorStop(0, skyTop);
    darkDiskGrad.addColorStop(0.65, '#060A16');
    darkDiskGrad.addColorStop(1.0, '#03050C');
    ctx.fillStyle = darkDiskGrad;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    // Subtle dark craters on the unlit circular sphere
    ctx.fillStyle = accentColor + '0E';
    const darkCraters = [
      { cx: radius * 0.35, cy: -radius * 0.22, r: radius * 0.18 },
      { cx: radius * 0.28, cy: radius * 0.34, r: radius * 0.20 },
    ];
    for (const c of darkCraters) {
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Waning Crescent INSIDE the circle (drawn first so visible features layer on top)
    // Bounded by outer left circle arc from top (0, -R) to bottom (0, R)
    // and inner terminator curving back to top (0, -R)
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI * 0.5, Math.PI * 0.5, true);
    ctx.bezierCurveTo(
      -radius * 0.38, radius * 0.55,
      -radius * 0.38, -radius * 0.55,
      0, -radius
    );
    ctx.closePath();

    // Very dark, low-contrast minimal gradient for the waning crescent
    // Non-distracting, atmospheric, deep lunar tones
    const crescentGrad = ctx.createLinearGradient(-radius, -radius * 0.7, -radius * 0.2, radius * 0.7);
    crescentGrad.addColorStop(0, accentColor + '24');
    crescentGrad.addColorStop(0.35, accentColor + '38');
    crescentGrad.addColorStop(0.7, accentColor + '28');
    crescentGrad.addColorStop(1.0, accentColor + '18');

    ctx.fillStyle = crescentGrad;
    ctx.shadowBlur = 0;
    ctx.fill();

    // 5. Moon Skulls: Exactly 3 BIG moon skulls and 5 SMALL moon skulls across the moon
    const skullBaseColor = '#020409';
    const skullEyeColor = '#000000';
    const skullRimColor = accentColor + '20';

    // --- 3 BIG MOON SKULLS ---
    // Big Skull 1: Visible illuminated crescent (upper curvature)
    this.drawMoonSkull(ctx, -radius * 0.58, -radius * 0.28, 3.4, skullBaseColor, skullEyeColor, skullRimColor);

    // Big Skull 2: Visible illuminated crescent / lower boundary
    this.drawMoonSkull(ctx, -radius * 0.50, radius * 0.28, 3.2, skullBaseColor, skullEyeColor, skullRimColor);

    // Big Skull 3: Dark lunar mare side (earthshine disk)
    this.drawMoonSkull(ctx, radius * 0.24, -radius * 0.12, 3.3, '#020307', skullEyeColor, accentColor + '12');

    // --- SMALL MOON SKULLS ---
    // Small Skull 1: Near top horn of visible crescent
    this.drawMoonSkull(ctx, -radius * 0.28, -radius * 0.62, 1.8, skullBaseColor, skullEyeColor);

    // Small Skull 2: Mid-left outer flank of visible crescent
    this.drawMoonSkull(ctx, -radius * 0.72, 0, 1.6, skullBaseColor, skullEyeColor);

    // Small Skull 3: Near bottom horn of visible crescent
    this.drawMoonSkull(ctx, -radius * 0.22, radius * 0.64, 1.7, skullBaseColor, skullEyeColor);

    // Small Skull 4: Lower-central earthshine disk
    this.drawMoonSkull(ctx, radius * 0.14, radius * 0.28, 1.9, '#020307', skullEyeColor);

    // Small Skull 5: Far-right edge of earthshine disk
    this.drawMoonSkull(ctx, radius * 0.46, -radius * 0.05, 1.6, '#020307', skullEyeColor);

    // Soft minimal terminator line (very low contrast)
    ctx.strokeStyle = accentColor + '20';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, radius);
    ctx.bezierCurveTo(
      -radius * 0.38, radius * 0.55,
      -radius * 0.38, -radius * 0.55,
      0, -radius
    );
    ctx.stroke();

    ctx.restore(); // Undo circular clip

    // 6. Complete Circular Moon Outer Rim Stroke
    // Very faint, low-contrast outline ensuring the circle disk is softly perceptible
    ctx.strokeStyle = accentColor + '18';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 7. Dark muted crest stroke on the lit crescent limb
    ctx.strokeStyle = accentColor + '45';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI * 0.5, Math.PI * 0.5, true);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Helper to draw a lunar mare skull silhouette on the moon.
   * Scales accurately for both large and small moon skulls.
   */
  private drawMoonSkull(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    baseColor: string,
    eyeColor: string,
    rimColor?: string
  ) {
    ctx.save();
    // 1. Cranium (rounded head)
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(x, y - r * 0.35, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Maxilla / Jaw
    const jawW = r * 1.15;
    const jawH = r * 0.75;
    ctx.fillRect(x - jawW / 2, y + r * 0.3, jawW, jawH);

    // 3. Hollow eye sockets
    ctx.fillStyle = eyeColor;
    const eyeR = r * 0.28;
    const eyeOffset = r * 0.38;
    ctx.beginPath();
    ctx.arc(x - eyeOffset, y - r * 0.25, eyeR, 0, Math.PI * 2);
    ctx.arc(x + eyeOffset, y - r * 0.25, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // 4. Inverted nasal cavity
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.08);
    ctx.lineTo(x - r * 0.16, r * 0.42 + y);
    ctx.lineTo(x + r * 0.16, r * 0.42 + y);
    ctx.closePath();
    ctx.fill();

    // 5. Teeth notches for large skulls
    if (r >= 2.5) {
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.3, y + r * 0.65);
      ctx.lineTo(x - r * 0.3, y + r * 1.05);
      ctx.moveTo(x, y + r * 0.65);
      ctx.lineTo(x, y + r * 1.05);
      ctx.moveTo(x + r * 0.3, y + r * 0.65);
      ctx.lineTo(x + r * 0.3, y + r * 1.05);
      ctx.stroke();
    }

    // 6. Subtle faint cranium rim highlight
    if (rimColor) {
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(x, y - r * 0.35, r, Math.PI * 0.75, Math.PI * 1.55);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Background high-altitude aircraft cruising across the sky.
   * Single fast craft that streaks across the sky and dynamically changes arrival direction.
   */
  private renderBackgroundAircraft(
    ctx: CanvasRenderingContext2D,
    width: number,
    currTheme: BiomeTheme,
    nextTheme: BiomeTheme,
    blend: number
  ) {
    if (this.aircraft.length === 0) return;
    const plane = this.aircraft[0];
    if (!plane.active) return;

    const accentColor = blend > 0 ? blendColors(currTheme.accentColor, nextTheme.accentColor, blend) : currTheme.accentColor;
    const { x, y, size, dir, contrailLen } = plane;

    ctx.save();

      if (dir === -1) {
        // Flying right-to-left (facing left)
        // Ion Engine Contrail Stream trailing to the right
        const contrailStart = x + 24 * size;
        const contrailEnd = x + 24 * size + contrailLen;
        const contrailGrad = ctx.createLinearGradient(contrailStart, y, contrailEnd, y);
        contrailGrad.addColorStop(0, accentColor + '90');
        contrailGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = contrailGrad;
        ctx.fillRect(contrailStart, y + 2 * size, contrailLen, 1.6 * size);

        // Cyber Cruiser Fuselage Silhouette (facing left)
        ctx.fillStyle = '#080D1A';
        ctx.beginPath();
        ctx.moveTo(x, y + 3 * size);
        ctx.lineTo(x + 16 * size, y);
        ctx.lineTo(x + 24 * size, y + 2 * size);
        ctx.lineTo(x + 28 * size, y + 3 * size);
        ctx.lineTo(x + 24 * size, y + 4.5 * size);
        ctx.lineTo(x + 16 * size, y + 6.5 * size);
        ctx.closePath();
        ctx.fill();

        // Cockpit / Avionics Sensor Strip
        ctx.fillStyle = accentColor;
        ctx.fillRect(x + 4 * size, y + 2 * size, 6 * size, 1.8 * size);

        // Hot Ion Thruster Core
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 24 * size, y + 2.5 * size, 2.5 * size, 1.5 * size);
      } else {
        // Flying left-to-right (facing right)
        // Ion Engine Contrail Stream trailing to the left
        const contrailStart = x + 4 * size;
        const contrailEnd = x + 4 * size - contrailLen;
        const contrailGrad = ctx.createLinearGradient(contrailStart, y, contrailEnd, y);
        contrailGrad.addColorStop(0, accentColor + '90');
        contrailGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = contrailGrad;
        ctx.fillRect(contrailEnd, y + 2 * size, contrailLen, 1.6 * size);

        // Cyber Cruiser Fuselage Silhouette (facing right)
        ctx.fillStyle = '#080D1A';
        ctx.beginPath();
        ctx.moveTo(x + 28 * size, y + 3 * size); // Nose tip pointed right
        ctx.lineTo(x + 12 * size, y);
        ctx.lineTo(x + 4 * size, y + 2 * size);
        ctx.lineTo(x, y + 3 * size);
        ctx.lineTo(x + 4 * size, y + 4.5 * size);
        ctx.lineTo(x + 12 * size, y + 6.5 * size);
        ctx.closePath();
        ctx.fill();

        // Cockpit / Avionics Sensor Strip
        ctx.fillStyle = accentColor;
        ctx.fillRect(x + 18 * size, y + 2 * size, 6 * size, 1.8 * size);

        // Hot Ion Thruster Core
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 2 * size, y + 2.5 * size, 2.5 * size, 1.5 * size);
      }

      ctx.restore();
  }

  private renderDistantCity(
    ctx: CanvasRenderingContext2D,
    width: number,
    groundY: number,
    offset: number,
    curr: BiomeTheme,
    next: BiomeTheme,
    blend: number
  ) {
    const color = blend > 0 ? blendColors(curr.distantCityColor, next.distantCityColor, blend) : curr.distantCityColor;
    const accentColor = blend > 0 ? blendColors(curr.accentColor, next.accentColor, blend) : curr.accentColor;
    ctx.fillStyle = color;

    // Start rendering from one pattern block to the left of 0, repeating seamlessly
    const startX = -offset - CITY_PATTERN_WIDTH;

    for (let loopX = startX; loopX < width + CITY_PATTERN_WIDTH; loopX += CITY_PATTERN_WIDTH) {
      let curX = loopX;
      for (let bIdx = 0; bIdx < CITY_PATTERN.length; bIdx++) {
        const b = CITY_PATTERN[bIdx];
        if (curX + b.w > -40 && curX < width + 40) {
          const topY = groundY - b.h;
          ctx.fillRect(curX, topY, b.w - 2, b.h);

          // Render distinct window architecture per building index
          // 100% static, eye-friendly architectural patterns (zero flicker, zero animation except biome colors)
          this.renderBuildingWindows(ctx, curX, topY, b.w, b.h, groundY, bIdx, accentColor);
          ctx.fillStyle = color;
        }
        curX += b.w;
      }
    }
  }

  /**
   * Generates unique architectural window structures for different buildings.
   * Completely static relative to each building (zero scrolling jitter, zero strobe or flicker).
   * Free of eye-straining micro-noise, with calm contrast that adapts cleanly to global biome color shifts.
   */
  private renderBuildingWindows(
    ctx: CanvasRenderingContext2D,
    x: number,
    topY: number,
    w: number,
    h: number,
    groundY: number,
    bIdx: number,
    accentColor: string
  ) {
    switch (bIdx % 10) {
      case 0: {
        // Vertical Glass Louvers: Calm, vertical window bands with uniform spacing
        for (let lx = 6; lx < w - 8; lx += 9) {
          for (let ly = 16; topY + ly < groundY - 14; ly += 24) {
            ctx.fillStyle = accentColor + '45';
            ctx.fillRect(x + lx, topY + ly, 4, 16);
          }
        }
        break;
      }
      case 1: {
        // Clean Office Windows: Orderly rows with calm ambient glow
        for (let ly = 14; topY + ly < groundY - 12; ly += 14) {
          for (let lx = 5; lx < w - 6; lx += 10) {
            ctx.fillStyle = accentColor + '40';
            ctx.fillRect(x + lx, topY + ly, 6, 6);
          }
        }
        break;
      }
      case 2: {
        // Panoramic Ribbon Windows: Sleek horizontal bands with structured dividers
        for (let ly = 18; topY + ly < groundY - 16; ly += 18) {
          ctx.fillStyle = accentColor + '50';
          ctx.fillRect(x + 5, topY + ly, w - 12, 4);
          ctx.fillStyle = 'rgba(8, 13, 26, 0.8)';
          for (let lx = 14; lx < w - 14; lx += 12) {
            ctx.fillRect(x + lx, topY + ly, 2, 4);
          }
        }
        break;
      }
      case 3: {
        // Corner Balcony Pods: Architectural corner accents
        for (let ly = 14; topY + ly < groundY - 14; ly += 18) {
          ctx.fillStyle = accentColor + '55';
          ctx.fillRect(x + 4, topY + ly, 6, 6);
          ctx.fillRect(x + w - 12, topY + ly, 6, 6);
        }
        break;
      }
      case 4: {
        // Twin Central Glass Atrium Shafts with sky-bridges
        const midX = x + w / 2;
        ctx.fillStyle = accentColor + '50';
        ctx.fillRect(midX - 7, topY + 12, 5, h - 26);
        ctx.fillRect(midX + 2, topY + 12, 5, h - 26);
        ctx.fillStyle = accentColor + '70';
        for (let ly = 28; topY + ly < groundY - 24; ly += 28) {
          ctx.fillRect(midX - 9, topY + ly, 18, 3);
        }
        break;
      }
      case 5: {
        // Big Megatower (70px wide, 200px tall):
        // Redesigned with calm, eye-friendly architectural bays (no strobing micro-dots)
        // Elegant top crown
        ctx.fillStyle = accentColor + '65';
        ctx.fillRect(x + 8, topY + 8, w - 18, 3);

        // Three clean, serene vertical window banks with wide spacing
        const cols = [x + 9, x + 27, x + 45];
        for (let ly = 22; topY + ly < groundY - 18; ly += 16) {
          for (const colX of cols) {
            ctx.fillStyle = accentColor + '40';
            ctx.fillRect(colX, topY + ly, 13, 8);
            // Subtle internal mullion
            ctx.fillStyle = 'rgba(8, 13, 26, 0.6)';
            ctx.fillRect(colX + 6, topY + ly, 1, 8);
          }
        }
        break;
      }
      case 6: {
        // Structural Floor Slabs with central column
        for (let ly = 16; topY + ly < groundY - 16; ly += 20) {
          ctx.fillStyle = accentColor + '40';
          ctx.fillRect(x + 5, topY + ly, w - 12, 3);
          ctx.fillStyle = accentColor + '60';
          ctx.fillRect(x + w / 2 - 3, topY + ly + 4, 6, 6);
        }
        break;
      }
      case 7: {
        // High-Rise Terraces: Clean alternating floor spans
        let alt = false;
        for (let ly = 18; topY + ly < groundY - 16; ly += 22) {
          ctx.fillStyle = accentColor + '50';
          if (alt) {
            ctx.fillRect(x + 5, topY + ly, 18, 6);
          } else {
            ctx.fillRect(x + w - 25, topY + ly, 18, 6);
          }
          alt = !alt;
        }
        break;
      }
      case 8: {
        // Minimalist Monolith: Clean dual data channels
        for (let lx = 8; lx < w - 8; lx += 10) {
          ctx.fillStyle = accentColor + '50';
          ctx.fillRect(x + lx, topY + 14, 3, h - 28);
        }
        break;
      }
      case 9: {
        // Stepped Horizontal Terraces
        for (let ly = 16; topY + ly < groundY - 18; ly += 16) {
          ctx.fillStyle = accentColor + '55';
          ctx.fillRect(x + 6, topY + ly, w - 14, 2);
          ctx.fillStyle = accentColor + '30';
          ctx.fillRect(x + 8, topY + ly + 3, w - 18, 4);
        }
        break;
      }
    }
  }

  private renderMidgroundSkyway(
    ctx: CanvasRenderingContext2D,
    width: number,
    groundY: number,
    offset: number,
    theme: BiomeTheme,
    animTime: number
  ) {
    ctx.fillStyle = theme.midTowerColor;
    const skywayY = groundY - 55;
    const skywayH = 10;

    // 1. Continuous Midground Transit Deck (Overbridge kept intact!)
    ctx.fillRect(0, skywayY, width, skywayH);

    // Subtle edge glow on the skyway
    ctx.fillStyle = theme.groundEdgeGlow + '55';
    ctx.fillRect(0, skywayY, width, 2);
    ctx.fillStyle = theme.midTowerColor;

    // 2. Low-profile Support Buttresses (Seamless loop with PIER_SPACING)
    const startX = -offset - PIER_SPACING;

    for (let x = startX; x < width + PIER_SPACING; x += PIER_SPACING) {
      if (x + 40 < -20 || x > width + 20) continue;

      // Clean vertical column
      ctx.fillRect(x + 12, skywayY + skywayH, 18, groundY - (skywayY + skywayH));

      // Modern beveled capital at top
      ctx.beginPath();
      ctx.moveTo(x + 6, skywayY + skywayH);
      ctx.lineTo(x + 36, skywayY + skywayH);
      ctx.lineTo(x + 30, skywayY + skywayH + 8);
      ctx.lineTo(x + 12, skywayY + skywayH + 8);
      ctx.closePath();
      ctx.fill();

      // Subtle status accent dot
      ctx.fillStyle = theme.accentColor + '88';
      ctx.fillRect(x + 18, skywayY + 4, 6, 2);
      ctx.fillStyle = theme.midTowerColor;
    }

    // 3. Dynamic Two-Way Random Hover-Car Traffic on the Overbridge
    // Cars come from both sides randomly (not sequential) on dual lanes
    for (const car of this.skywayCars) {
      const carY = skywayY + car.laneY;

      // Car Main Body
      ctx.fillStyle = car.bodyColor;
      ctx.fillRect(car.x, carY, car.width, car.height);

      // Cabin / Cockpit Roof Visor
      ctx.fillStyle = '#334155';
      ctx.fillRect(car.x + 4, carY - 2, car.width - 8, 2);

      if (car.dir === 1) {
        // Moving Left-to-Right:
        // Forward Headlights on Right
        ctx.fillStyle = car.headlightColor;
        ctx.fillRect(car.x + car.width - 3, carY + 1, 3, car.height - 2);

        // Forward Projecting Headlight Beam
        ctx.fillStyle = car.headlightColor + '30';
        ctx.fillRect(car.x + car.width, carY + 1, 16, car.height - 2);

        // Red Taillight on Left
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(car.x, carY + 1, 2, car.height - 2);

        // Hover-jet Deck Glow Underneath
        ctx.fillStyle = theme.accentColor + '65';
        ctx.fillRect(car.x + 3, carY + car.height, car.width - 6, 1.5);
      } else {
        // Moving Right-to-Left:
        // Forward Headlights on Left
        ctx.fillStyle = car.headlightColor;
        ctx.fillRect(car.x, carY + 1, 3, car.height - 2);

        // Forward Projecting Headlight Beam
        ctx.fillStyle = car.headlightColor + '30';
        ctx.fillRect(car.x - 16, carY + 1, 16, car.height - 2);

        // Red Taillight on Right
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(car.x + car.width - 2, carY + 1, 2, car.height - 2);

        // Hover-jet Deck Glow Underneath
        ctx.fillStyle = theme.accentColor + '65';
        ctx.fillRect(car.x + 3, carY + car.height, car.width - 6, 1.5);
      }
    }
  }

  private renderGroundTrack(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    groundY: number,
    offset: number,
    theme: BiomeTheme,
    animTime: number,
    speed: number
  ) {
    // 1. Top Lev-Rail Glow Edge Line
    ctx.save();
    ctx.shadowColor = theme.groundEdgeGlow;
    ctx.shadowBlur = 10;
    ctx.fillStyle = theme.groundEdgeGlow;
    ctx.fillRect(0, groundY, width, 3);
    ctx.restore();

    // 2. Secondary Sub-rail Strip
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, groundY + 3, width, 1);

    // 3. Ground Understructure Fill
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
    groundGrad.addColorStop(0, '#090D1A');
    groundGrad.addColorStop(1, '#02040A');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY + 4, width, height - groundY);

    // 4. Animated Speed Chevrons / Magnetic Track Grid (Seamless modulo on GROUND_TILE_WIDTH)
    const tileW = GROUND_TILE_WIDTH;
    const startX = -offset - tileW;

    ctx.fillStyle = theme.groundGridColor + '40';
    for (let x = startX; x < width + tileW * 2; x += tileW) {
      // Perspective angled stripe
      ctx.beginPath();
      ctx.moveTo(x + 14, groundY + 4);
      ctx.lineTo(x + 24, groundY + 4);
      ctx.lineTo(x + 12, groundY + 28);
      ctx.lineTo(x + 2, groundY + 28);
      ctx.closePath();
      ctx.fill();

      // Lower road grid tick
      ctx.fillRect(x + 4, groundY + 34, 16, 2);
    }

    // 5. High-speed roadside particles / speed lines when running fast
    if (speed > 8) {
      const lineCount = Math.floor(speed * 1.2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < lineCount; i++) {
        const lx = ((animTime * 1.5 + i * 137) % width);
        const ly = groundY + 6 + (i * 7) % 32;
        ctx.fillRect(lx, ly, 18 + (i % 3) * 10, 1);
      }
    }
  }
}

/**
 * Computes the active biome accent color for any given score,
 * accurately matching the game's dynamic 500-point color cycle.
 */
export function getActiveBiomeAccentColor(scorePoints: number): string {
  const STAGE_POINTS = 500;
  const TRANSITION_POINTS = 40;

  if (scorePoints < STAGE_POINTS) {
    return BIOMES[0].accentColor;
  }

  const stage = Math.floor(scorePoints / STAGE_POINTS);
  const prevThemeIdx = (stage - 1) % BIOMES.length;
  const newThemeIdx = stage % BIOMES.length;
  const progressInStage = scorePoints % STAGE_POINTS;

  if (progressInStage < TRANSITION_POINTS) {
    const blend = progressInStage / TRANSITION_POINTS;
    return blendColors(BIOMES[prevThemeIdx].accentColor, BIOMES[newThemeIdx].accentColor, blend);
  }

  return BIOMES[newThemeIdx].accentColor;
}

/**
 * Utility to blend two hex color strings smoothly
 */
export function blendColors(c1: string, c2: string, ratio: number): string {
  const r1 = parseInt(c1.substring(1, 3), 16);
  const g1 = parseInt(c1.substring(3, 5), 16);
  const b1 = parseInt(c1.substring(5, 7), 16);

  const r2 = parseInt(c2.substring(1, 3), 16);
  const g2 = parseInt(c2.substring(3, 5), 16);
  const b2 = parseInt(c2.substring(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
