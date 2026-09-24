/**
 * Pixel Art Renderers and Sprite Definitions for Volt Cat
 * All drawn with high-performance integer coordinates for authentic retro crispness.
 */

import { FoxAnimationState, Obstacle, ObstacleType, BiomeTheme } from '../types/game';

// Color Palette Constants
export const PALETTE = {
  // Cat Colors (Authentic Ginger Tabby Cat)
  FUR_MAIN: '#F59E0B',       // Warm ginger / honey-caramel tabby coat
  FUR_DARK: '#B45309',       // Rich warm chestnut tabby stripes
  FUR_HIGHLIGHT: '#FDE68A',  // Sunlit cream fur highlight
  FUR_CREAM: '#FEF3C7',      // Soft cream muzzle & belly
  FUR_WHITE: '#FFFFFF',      // White cheek pads, chest bib & paw socks
  NOSE_PINK: '#F472B6',      // Sweet pink feline nose & inner ear velvet
  EAR_INNER: '#FBCFE8',      // Soft baby pink inner ear
  EYE_GREEN: '#10B981',      // Luminous emerald feline iris
  EYE_CYAN: '#00F0FF',       // Cyber feline cyan visor / eye glow
  EYE_PUPIL: '#0F172A',      // Feline slit pupil
  VISOR_CYAN: '#00F0FF',     // Cyber feline cyan visor / eye glow
  VISOR_CORE: '#FFFFFF',     // Bright white specular gleam
  ARMOR_DARK: '#0F172A',     // Carbon slate collar & plating
  ARMOR_LIGHT: '#334155',    // Trim highlights
  COLLAR_GOLD: '#F59E0B',    // Glowing bell collar
  TAIL_CYAN: '#00F0FF',      // Tail tip plasma
  TAIL_ENERGY: '#38BDF8',    // Energy tail flare
  WHISKER_CYAN: '#E2E8F0',   // Sleek whiskers

  // Obstacle Colors
  SPIKE_PURPLE: '#9333EA',
  SPIKE_HOT: '#F43F5E',
  DRONE_DARK: '#1E293B',
  DRONE_EYE: '#EF4444',
  DRONE_ROTOR: '#94A3B8',
  LASER_CYAN: '#00E5FF',

  // Collectible Shard
  SHARD_CORE: '#67E8F9',
  SHARD_EDGE: '#0284C7',
  SHARD_SPARK: '#FFFFFF',
};

/**
 * Draws the Volt Cat pixel character onto canvas context
 */
export function drawVoltCat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  state: FoxAnimationState,
  animFrame: number,
  overdriveTime: number,
  invincibleFlash: number,
  isGrounded: boolean,
  vy: number
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  // Flashing effect if invincible/hurt
  if (invincibleFlash > 0 && Math.floor(invincibleFlash / 4) % 2 === 1) {
    ctx.globalAlpha = 0.4;
  }

  // Overdrive glowing aura
  if (overdriveTime > 0) {
    ctx.save();
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(-4, -4, width + 8, height + 8);
    ctx.restore();
  }

  // Choose render branch based on feline animation state
  // Prioritize airborne leap/dive when not grounded so mid-air slides or jumps never glitch
  if (state === 'DOUBLE_JUMP') {
    renderCatSpin(ctx, animFrame, overdriveTime > 0);
  } else if (!isGrounded || state === 'JUMP') {
    renderCatJump(ctx, vy, overdriveTime > 0);
  } else if (state === 'SLIDE') {
    renderCatSlide(ctx, animFrame, overdriveTime > 0);
  } else if (state === 'CRASH') {
    renderCatCrash(ctx, animFrame);
  } else {
    // Normal feline running gallop (6 crisp, stutter-free frames)
    renderCatRun(ctx, animFrame, overdriveTime > 0);
  }

  ctx.restore();
}

// Backward-compatible alias
export const drawVoltFox = drawVoltCat;

/**
 * Renders an unmistakable domestic feline face with:
 * - Round skull & chubby jowl cheeks (NO long fox snout!)
 * - Tabby forehead "M" stripes
 * - Classic triangular perked cat ears with pink velvet lining and white tufts
 * - Expressive emerald green/cyan feline eyes with vertical slit pupil & catchlight
 * - Round white whisker pads (:3 mouth) and tiny pink inverted-triangle nose
 * - Fine whiskers springing from cheek cushions
 * - Golden quantum bell collar
 */
function renderCatFace(
  ctx: CanvasRenderingContext2D,
  headX: number,
  headY: number,
  mainFur: string,
  darkFur: string,
  eyeColor: string,
  isOverdrive: boolean,
  earsPose: 'PERKED' | 'AIRPLANE' | 'CRASH' = 'PERKED'
) {
  // 1. ROUND FELINE SKULL (Width 16, Height 12)
  ctx.fillStyle = mainFur;
  ctx.fillRect(headX + 2, headY, 12, 3);        // Rounded top of skull
  ctx.fillRect(headX, headY + 2, 16, 10);       // Main head block
  ctx.fillRect(headX - 1, headY + 5, 18, 6);    // Chubby cheek curve (feline jowls)

  // 2. TABBY FOREHEAD STRIPES ("M" Crown Marking)
  ctx.fillStyle = darkFur;
  ctx.fillRect(headX + 4, headY + 1, 2, 3);     // Left brow stripe
  ctx.fillRect(headX + 7, headY, 2, 4);         // Center brow stripe
  ctx.fillRect(headX + 10, headY + 1, 2, 3);    // Right brow stripe

  // 3. ICONIC TRIANGULAR CAT EARS (Equilateral, wide base, 6px tall, NOT long like a fox!)
  if (earsPose === 'PERKED') {
    // Left ear (perched upright on top-left of rounded skull)
    ctx.fillStyle = darkFur;
    ctx.fillRect(headX + 1, headY - 3, 4, 4);
    ctx.fillRect(headX + 2, headY - 5, 2, 3);
    // Soft pink inner ear velvet
    ctx.fillStyle = isOverdrive ? '#00F0FF' : PALETTE.NOSE_PINK;
    ctx.fillRect(headX + 2, headY - 3, 2, 3);
    // White inner tuft
    ctx.fillStyle = PALETTE.FUR_WHITE;
    ctx.fillRect(headX + 1, headY - 1, 1, 2);

    // Right ear (perched upright on top-right of rounded skull)
    ctx.fillStyle = darkFur;
    ctx.fillRect(headX + 8, headY - 3, 4, 4);
    ctx.fillRect(headX + 9, headY - 5, 2, 3);
    // Soft pink inner ear velvet
    ctx.fillStyle = isOverdrive ? '#00F0FF' : PALETTE.NOSE_PINK;
    ctx.fillRect(headX + 9, headY - 3, 2, 3);
    // White inner tuft
    ctx.fillStyle = PALETTE.FUR_WHITE;
    ctx.fillRect(headX + 8, headY - 1, 1, 2);
  } else if (earsPose === 'AIRPLANE') {
    // Aerodynamic flattened "airplane ears" pinned back for low stalk / slide
    ctx.fillStyle = darkFur;
    ctx.fillRect(headX - 3, headY, 6, 3);
    ctx.fillRect(headX - 5, headY + 1, 3, 2);
    ctx.fillStyle = isOverdrive ? '#00F0FF' : PALETTE.NOSE_PINK;
    ctx.fillRect(headX - 2, headY + 1, 3, 1);

    ctx.fillStyle = darkFur;
    ctx.fillRect(headX + 4, headY, 5, 3);
    ctx.fillStyle = isOverdrive ? '#00F0FF' : PALETTE.NOSE_PINK;
    ctx.fillRect(headX + 5, headY + 1, 3, 1);
  } else {
    // Crash shock / drooped ears
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(headX - 1, headY - 2, 4, 4);
    ctx.fillRect(headX + 9, headY - 2, 4, 4);
  }

  // 4. LARGE EXPRESSIVE FELINE CAT EYES
  ctx.fillStyle = eyeColor;
  ctx.fillRect(headX + 8, headY + 3, 5, 5);
  // Feline vertical slit pupil
  ctx.fillStyle = PALETTE.EYE_PUPIL;
  ctx.fillRect(headX + 10, headY + 3, 2, 5);
  // Specular shiny catchlight
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(headX + 9, headY + 3, 2, 2);

  // 5. SHORT ROUND CAT MUZZLE & CHUBBY WHISKER PADS (:3)
  // Flush with face - NO long fox snout!
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(headX + 11, headY + 6, 5, 5);   // Front whisker cushion
  ctx.fillRect(headX + 9, headY + 7, 3, 4);    // Rear whisker cushion
  ctx.fillRect(headX + 11, headY + 10, 4, 2);  // Chin

  // Tiny pink triangular cat nose (nestled right below the eye line)
  ctx.fillStyle = PALETTE.NOSE_PINK;
  ctx.fillRect(headX + 13, headY + 6, 3, 2);
  ctx.fillRect(headX + 14, headY + 8, 1, 1);

  // Subtle :3 feline mouth line
  ctx.fillStyle = darkFur;
  ctx.fillRect(headX + 12, headY + 9, 2, 1);
  ctx.fillRect(headX + 14, headY + 9, 2, 1);

  // 6. DELICATE CAT WHISKERS (Springing from whisker cushions)
  ctx.fillStyle = isOverdrive ? '#FFFFFF' : PALETTE.WHISKER_CYAN;
  ctx.fillRect(headX + 15, headY + 6, 5, 1);   // Top whisker
  ctx.fillRect(headX + 16, headY + 8, 6, 1);   // Middle whisker
  ctx.fillRect(headX + 15, headY + 10, 5, 1);  // Bottom whisker

  // 7. QUANTUM BELL COLLAR
  ctx.fillStyle = PALETTE.ARMOR_DARK;
  ctx.fillRect(headX - 1, headY + 10, 6, 3);
  ctx.fillStyle = isOverdrive ? '#00F0FF' : PALETTE.COLLAR_GOLD;
  ctx.fillRect(headX, headY + 12, 4, 4);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(headX + 1, headY + 13, 2, 2);
}

/**
 * 6-Frame Feline Running Gallop Animation
 * Faithful feline anatomy: compact rounded head, pointed ears, whiskers, S-tail, and paw socks
 */
function renderCatRun(ctx: CanvasRenderingContext2D, frame: number, isOverdrive: boolean) {
  const f = (Math.floor(frame) % 6 + 6) % 6;

  const mainFur = isOverdrive ? '#38BDF8' : PALETTE.FUR_MAIN;
  const darkFur = isOverdrive ? '#0284C7' : PALETTE.FUR_DARK;
  const eyeColor = isOverdrive ? '#FFFFFF' : PALETTE.EYE_GREEN;

  // Natural 1px subtle spine and head movement
  const headY = [4, 5, 5, 4, 4, 4][f];
  const spineY = [10, 11, 10, 9, 10, 10][f];

  // 1. FELINE S-CURVE TAIL (Curved high with flickering plasma tip)
  const tailSways = [
    { x: -6, y: -4, tipY: -9 },
    { x: -7, y: -2, tipY: -7 },
    { x: -6, y: -1, tipY: -5 },
    { x: -5, y: -3, tipY: -8 },
    { x: -6, y: -5, tipY: -10 },
    { x: -7, y: -6, tipY: -11 },
  ][f];

  ctx.fillStyle = mainFur;
  ctx.fillRect(-2, spineY + 4, 6, 5);
  ctx.fillRect(tailSways.x + 2, spineY + 1, 4, 6);
  ctx.fillStyle = darkFur;
  ctx.fillRect(tailSways.x, tailSways.y + 4, 4, 6);
  // Plasma tail tip
  ctx.fillStyle = PALETTE.TAIL_CYAN;
  ctx.fillRect(tailSways.x + 1, tailSways.tipY, 4, 5);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(tailSways.x + 2, tailSways.tipY + 1, 2, 3);

  // 2. REAR LEGS & WHITE PAW SOCKS
  // f4 & f5: solidly planted on ground (y=34..38)
  // f0, f1, f2, f3: lifted, swinging, or tucked in air
  const rearLegs = [
    { x1: 0,  y1: 22, h1: 8,  footY1: 30, x2: 6,  y2: 24, h2: 8,  footY2: 32 }, // f0: extension in air
    { x1: 4,  y1: 22, h1: 6,  footY1: 28, x2: 10, y2: 20, h2: 7,  footY2: 27 }, // f1: forward swing in air
    { x1: 8,  y1: 20, h1: 6,  footY1: 26, x2: 14, y2: 20, h2: 6,  footY2: 26 }, // f2: tucked compactly under belly
    { x1: 10, y1: 22, h1: 9,  footY1: 31, x2: 16, y2: 24, h2: 9,  footY2: 33 }, // f3: descending
    { x1: 6,  y1: 22, h1: 12, footY1: 34, x2: 14, y2: 22, h2: 12, footY2: 34 }, // f4: planted on ground! (y=38)
    { x1: 2,  y1: 24, h1: 10, footY1: 34, x2: 10, y2: 22, h2: 12, footY2: 34 }, // f5: thrusting off ground! (y=38)
  ][f];

  ctx.fillStyle = darkFur;
  ctx.fillRect(rearLegs.x1, rearLegs.y1, 5, rearLegs.h1);
  ctx.fillRect(rearLegs.x2, rearLegs.y2, 5, rearLegs.h2);

  // White rear sock booties
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(rearLegs.x1, rearLegs.footY1, 5, 4);
  ctx.fillRect(rearLegs.x2, rearLegs.footY2, 5, 4);

  // Pink paw pads
  ctx.fillStyle = PALETTE.NOSE_PINK;
  ctx.fillRect(rearLegs.x1 + 1, rearLegs.footY1 + 3, 3, 1);
  ctx.fillRect(rearLegs.x2 + 1, rearLegs.footY2 + 3, 3, 1);

  // 3. ARCHED CAT TORSO
  ctx.fillStyle = mainFur;
  ctx.fillRect(2, spineY + 2, 28, 13);
  ctx.fillRect(4, spineY, 24, 3);
  // Tabby tiger markings on back
  ctx.fillStyle = darkFur;
  ctx.fillRect(8, spineY + 1, 3, 6);
  ctx.fillRect(15, spineY + 1, 3, 6);
  ctx.fillRect(22, spineY + 2, 3, 5);

  // Soft white chest bib & belly
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(16, spineY + 6, 12, 8);

  // 4. FRONT LEGS & WHITE PAW SOCKS
  // f1 & f2: planted on ground (footY=34, bottom=38)
  // f3, f4, f5, f0: cycling through forward reach in air
  const frontLegs = [
    { x1: 28, y1: 22, h1: 7,  footY1: 29, x2: 36, y2: 20, h2: 8,  footY2: 28 }, // f0: reaching forward in air
    { x1: 26, y1: 22, h1: 12, footY1: 34, x2: 32, y2: 24, h2: 10, footY2: 34 }, // f1: planted on ground! (y=38)
    { x1: 24, y1: 22, h1: 12, footY1: 34, x2: 30, y2: 22, h2: 12, footY2: 34 }, // f2: planted on ground! (y=38)
    { x1: 20, y1: 24, h1: 7,  footY1: 31, x2: 26, y2: 22, h2: 7,  footY2: 29 }, // f3: pushing off in air
    { x1: 24, y1: 22, h1: 6,  footY1: 28, x2: 32, y2: 20, h2: 6,  footY2: 26 }, // f4: swinging forward in air
    { x1: 28, y1: 20, h1: 7,  footY1: 27, x2: 36, y2: 22, h2: 8,  footY2: 30 }, // f5: extending forward in air
  ][f];

  ctx.fillStyle = mainFur;
  ctx.fillRect(frontLegs.x1, frontLegs.y1, 5, frontLegs.h1);
  ctx.fillRect(frontLegs.x2, frontLegs.y2, 5, frontLegs.h2);

  // White front sock booties
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(frontLegs.x1, frontLegs.footY1, 5, 4);
  ctx.fillRect(frontLegs.x2, frontLegs.footY2, 5, 4);

  // Pink paw pads
  ctx.fillStyle = PALETTE.NOSE_PINK;
  ctx.fillRect(frontLegs.x1 + 1, frontLegs.footY1 + 3, 3, 1);
  ctx.fillRect(frontLegs.x2 + 1, frontLegs.footY2 + 3, 3, 1);

  // 5. UNMISTAKABLE CAT HEAD & FACE
  renderCatFace(ctx, 24, headY, mainFur, darkFur, eyeColor, isOverdrive, 'PERKED');

}

/**
 * Feline Jumping / Airborne Arc
 * Smooth leap posture with tucked hind legs, extended forepaws, perked ears
 */
function renderCatJump(ctx: CanvasRenderingContext2D, vy: number, isOverdrive: boolean) {
  const tilt = Math.max(-0.25, Math.min(0.28, vy * 0.022));
  ctx.rotate(tilt);

  const mainFur = isOverdrive ? '#38BDF8' : PALETTE.FUR_MAIN;
  const darkFur = isOverdrive ? '#0284C7' : PALETTE.FUR_DARK;
  const eyeColor = isOverdrive ? '#FFFFFF' : PALETTE.EYE_GREEN;

  // 1. Tail streaming back aerodynamically
  ctx.fillStyle = mainFur;
  ctx.fillRect(-10, 16, 12, 5);
  ctx.fillStyle = PALETTE.TAIL_CYAN;
  ctx.fillRect(-20, 12, 12, 5);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-22, 11, 3, 3);

  // 2. Rear legs swept back in jump extension
  ctx.fillStyle = darkFur;
  ctx.fillRect(2, 18, 8, 7);
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(-2, 22, 6, 6);
  ctx.fillStyle = PALETTE.NOSE_PINK;
  ctx.fillRect(0, 26, 3, 2);

  // Paw Thruster Jets (Cyber cat rocket booster pads)
  ctx.fillStyle = '#00F0FF';
  ctx.fillRect(-2, 28, 4, 4);

  // 3. Elegant arched feline leap body
  ctx.fillStyle = mainFur;
  ctx.fillRect(4, 8, 28, 14);
  ctx.fillRect(6, 6, 24, 3);
  // Tabby stripes
  ctx.fillStyle = darkFur;
  ctx.fillRect(10, 7, 3, 8);
  ctx.fillRect(17, 7, 3, 8);
  ctx.fillRect(24, 7, 3, 7);

  // White chest & belly
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(16, 13, 14, 8);

  // 4. Forepaws extended forward in majestic leap
  ctx.fillStyle = mainFur;
  ctx.fillRect(28, 16, 10, 6);
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(36, 16, 6, 6);
  ctx.fillStyle = PALETTE.NOSE_PINK;
  ctx.fillRect(39, 20, 3, 2);

  // 5. Authentic cat face looking ahead
  renderCatFace(ctx, 24, 2, mainFur, darkFur, eyeColor, isOverdrive, 'PERKED');
}

/**
 * Double Jump / Feline Acrobat Spin
 */
function renderCatSpin(ctx: CanvasRenderingContext2D, frame: number, isOverdrive: boolean) {
  const angle = (frame * 0.45) % (Math.PI * 2);
  ctx.translate(22, 16);
  ctx.rotate(angle);

  // Glowing energy ring around cat righting-reflex spin
  ctx.save();
  ctx.strokeStyle = isOverdrive ? '#FDE047' : '#00F0FF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Tucked cat acrobat ball with cute curled paws and perked ears
  ctx.fillStyle = isOverdrive ? '#38BDF8' : PALETTE.FUR_MAIN;
  ctx.fillRect(-12, -12, 24, 24);
  ctx.fillStyle = PALETTE.FUR_DARK;
  ctx.fillRect(-9, -9, 18, 18);
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(-4, -4, 8, 8);
  // Pink nose / paws in center of curled ball
  ctx.fillStyle = PALETTE.NOSE_PINK;
  ctx.fillRect(-2, -2, 4, 4);
  ctx.fillStyle = PALETTE.VISOR_CYAN;
  ctx.fillRect(-6, -6, 4, 4);
}

/**
 * Slide / Low-Stalk Pounce Pose (Zero-offset, precise ground alignment)
 * Height is 20px, so y=20 represents the exact ground line.
 */
function renderCatSlide(ctx: CanvasRenderingContext2D, frame: number, isOverdrive: boolean) {
  const f = Math.floor(frame) % 4;
  const mainFur = isOverdrive ? '#38BDF8' : PALETTE.FUR_MAIN;
  const darkFur = isOverdrive ? '#0284C7' : PALETTE.FUR_DARK;
  const eyeColor = isOverdrive ? '#FFFFFF' : PALETTE.EYE_GREEN;

  // 1. Sleek streaming tail trailed horizontally behind
  ctx.fillStyle = mainFur;
  ctx.fillRect(-12, 10, 14, 4);
  ctx.fillStyle = PALETTE.TAIL_CYAN;
  ctx.fillRect(-22, 9, 11, 4);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-24, 10, 3, 2);

  // 2. Low-profile feline body stretched horizontally
  ctx.fillStyle = mainFur;
  ctx.fillRect(2, 6, 36, 10);
  ctx.fillRect(6, 4, 28, 3);
  // Tabby stripes
  ctx.fillStyle = darkFur;
  ctx.fillRect(10, 5, 3, 8);
  ctx.fillRect(18, 5, 3, 8);
  ctx.fillRect(26, 5, 3, 8);

  // White underbelly
  ctx.fillStyle = PALETTE.FUR_WHITE;
  ctx.fillRect(14, 12, 18, 5);

  // 3. Paws stretched forward and backward gliding smoothly on the ground line (y = 15..20)
  ctx.fillStyle = PALETTE.FUR_WHITE;
  // Rear paws tucked and trailing on ground
  ctx.fillRect(-2, 15, 12, 5);
  // Forepaws stretched flat forward on ground
  ctx.fillRect(34, 15, 14, 5);
  // Pink paw pads touching ground (y = 19..20)
  ctx.fillStyle = PALETTE.NOSE_PINK;
  ctx.fillRect(2, 19, 6, 1);
  ctx.fillRect(38, 19, 8, 1);

  // 4. Authentic Cat Face in stalking airplane-ears pose
  renderCatFace(ctx, 26, 3, mainFur, darkFur, eyeColor, isOverdrive, 'AIRPLANE');

  // 5. Ground friction sparks along the ground contact (y = 18..20)
  ctx.fillStyle = f % 2 === 0 ? '#00F0FF' : '#FDE047';
  ctx.fillRect(-6, 18, 4, 2);
  ctx.fillRect(12, 18, 4, 2);
  ctx.fillRect(32, 18, 5, 2);
}

/**
 * Crash / Stumble Glitch Pose
 */
function renderCatCrash(ctx: CanvasRenderingContext2D, frame: number) {
  const shake = (frame % 3) * 2 - 2;

  ctx.fillStyle = '#EF4444'; // Red error outline
  ctx.fillRect(4 + shake, 8, 30, 16);
  ctx.fillStyle = PALETTE.ARMOR_DARK;
  ctx.fillRect(24 + shake, 2, 18, 16);

  // Shocked cat ears
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(25 + shake, -3, 4, 5);
  ctx.fillRect(33 + shake, -3, 4, 5);

  // Startled wide cat eyes (O.O)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(28 + shake, 4, 5, 5);
  ctx.fillRect(35 + shake, 4, 5, 5);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(30 + shake, 5, 2, 3);
  ctx.fillRect(37 + shake, 5, 2, 3);

  // Pink nose & whiskers
  ctx.fillStyle = PALETTE.NOSE_PINK;
  ctx.fillRect(33 + shake, 9, 3, 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(36 + shake, 9, 5, 1);
  ctx.fillRect(36 + shake, 11, 4, 1);

  // Static glitch bars
  ctx.fillStyle = '#00F0FF';
  ctx.fillRect(0, 14, 48, 2);
  ctx.fillRect(8, 22, 36, 2);
}

/**
 * Draws Obstacles (Spike clusters, Quantum pillars, Flying scanner drones, Laser gates)
 */
export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, animTime: number) {
  ctx.save();
  ctx.translate(Math.round(obs.x), Math.round(obs.y));

  switch (obs.type) {
    case 'SPIKE_CLUSTER':
      drawSpikeCluster(ctx, obs.width, obs.height, animTime);
      break;
    case 'QUANTUM_PILLAR':
      drawQuantumPillar(ctx, obs.width, obs.height, animTime);
      break;
    case 'SCANNER_DRONE':
      drawScannerDrone(ctx, obs.width, obs.height, animTime);
      break;
    case 'LASER_BARRIER':
      drawLaserBarrier(ctx, obs.width, obs.height, animTime);
      break;
    case 'FLOATING_MAG_RAIL':
      drawFloatingMagRail(ctx, obs.width, obs.height, animTime);
      break;
  }

  ctx.restore();
}

/**
 * Spike Cluster: Jagged crystalline plasma hazards on track
 */
function drawSpikeCluster(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const pulse = Math.sin(time * 0.01) * 0.3 + 0.7;

  // Base mount
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(2, h - 8, w - 4, 8);
  ctx.fillStyle = '#334155';
  ctx.fillRect(4, h - 10, w - 8, 3);

  // Crystal 1 (Left)
  ctx.fillStyle = '#A855F7';
  ctx.beginPath();
  ctx.moveTo(4, h - 8);
  ctx.lineTo(14, 8);
  ctx.lineTo(24, h - 8);
  ctx.fill();

  // Crystal 2 (Center - Tallest)
  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.moveTo(18, h - 8);
  ctx.lineTo(w / 2, 2);
  ctx.lineTo(w - 18, h - 8);
  ctx.fill();

  // Crystal 3 (Right)
  ctx.fillStyle = '#9333EA';
  ctx.beginPath();
  ctx.moveTo(w - 24, h - 8);
  ctx.lineTo(w - 12, 10);
  ctx.lineTo(w - 4, h - 8);
  ctx.fill();

  // Energized core lines
  ctx.strokeStyle = `rgba(244, 114, 182, ${pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2, 6);
  ctx.lineTo(w / 2, h - 8);
  ctx.stroke();

  // Warning light
  ctx.fillStyle = pulse > 0.8 ? '#F43F5E' : '#FDA4AF';
  ctx.fillRect(w / 2 - 2, h - 6, 4, 4);
}

/**
 * Quantum Pillar: Tall ground obelisk
 */
function drawQuantumPillar(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Main monolith body
  ctx.fillStyle = '#1E1B4B';
  ctx.fillRect(4, 0, w - 8, h);

  // Dark obsidian bevel
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(8, 2, w - 16, h - 4);

  // Glowing vertical data conduits
  const glow = Math.abs(Math.sin(time * 0.006));
  ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + glow * 0.6})`;
  ctx.fillRect(w / 2 - 2, 6, 4, h - 12);

  // Horizontal status rungs
  ctx.fillStyle = '#38BDF8';
  for (let y = 14; y < h - 14; y += 18) {
    ctx.fillRect(10, y, w - 20, 2);
  }

  // Top emitter cap
  ctx.fillStyle = '#6366F1';
  ctx.fillRect(2, 0, w - 4, 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(w / 2 - 3, 2, 6, 3);
}

/**
 * Scanner Drone: Aerial flying sentinel with search laser (Must slide under!)
 */
function drawScannerDrone(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const bob = Math.sin(time * 0.008) * 3;
  const rotor = Math.sin(time * 0.04) * 10;

  ctx.translate(0, bob);

  // Sweeping warning laser beam pointing down to ground
  ctx.save();
  const grad = ctx.createLinearGradient(w / 2, 20, w / 2, 90);
  grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
  grad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 4, 22);
  ctx.lineTo(w / 2 + 4, 22);
  ctx.lineTo(w / 2 + 24, 90);
  ctx.lineTo(w / 2 - 24, 90);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Rotor Blades (Spinning at top)
  ctx.fillStyle = PALETTE.DRONE_ROTOR;
  ctx.fillRect(w / 2 - 22 + rotor * 0.4, 2, 44, 2);
  ctx.fillStyle = '#475569';
  ctx.fillRect(w / 2 - 2, 2, 4, 6);

  // Drone Chassis
  ctx.fillStyle = PALETTE.DRONE_DARK;
  ctx.fillRect(8, 8, w - 16, 14);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(12, 10, w - 24, 10);

  // Side thruster pods
  ctx.fillStyle = '#334155';
  ctx.fillRect(2, 10, 6, 8);
  ctx.fillRect(w - 8, 10, 6, 8);
  ctx.fillStyle = '#00F0FF';
  ctx.fillRect(3, 17, 4, 2);
  ctx.fillRect(w - 7, 17, 4, 2);

  // Red Cyclops Scanner Eye
  ctx.fillStyle = PALETTE.DRONE_EYE;
  ctx.fillRect(w / 2 - 6, 12, 12, 5);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(w / 2 - 2, 13, 4, 2);
}

/**
 * Laser Barrier: Overhead horizontal beam
 */
function drawLaserBarrier(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Left post
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, 6, h);
  // Right post
  ctx.fillRect(w - 6, 0, 6, h);

  // Pulsing laser ribbon
  const flicker = Math.sin(time * 0.02) * 2;
  const beamY = h / 2 - 2 + flicker;

  ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.fillRect(6, beamY - 4, w - 12, 12);
  ctx.fillStyle = '#00F0FF';
  ctx.fillRect(6, beamY, w - 12, 4);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(6, beamY + 1, w - 12, 2);
}

/**
 * Floating Mag-Rail (Hop on top to bypass ground spikes)
 */
function drawFloatingMagRail(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Metallic platform body
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(2, 4, w - 4, h - 6);

  // Upper illuminated track strip (Landing surface)
  ctx.fillStyle = '#10B981';
  ctx.fillRect(0, 0, w, 3);
  ctx.fillStyle = '#6EE7B7';
  ctx.fillRect(0, 0, w, 1);

  // Underside anti-grav emitters
  const pulse = Math.abs(Math.sin(time * 0.008));
  ctx.fillStyle = `rgba(52, 211, 153, ${0.4 + pulse * 0.5})`;
  ctx.fillRect(8, h - 3, 14, 3);
  ctx.fillRect(w - 22, h - 3, 14, 3);
}

/**
 * Draws Collectible Data Shards (Rotating 3D-like crystal)
 */
export function drawCollectibleShard(ctx: CanvasRenderingContext2D, shard: { x: number; y: number; size: number; floatPhase: number }, time: number) {
  ctx.save();
  const floatY = Math.sin(time * 0.006 + shard.floatPhase) * 6;
  ctx.translate(Math.round(shard.x), Math.round(shard.y + floatY));

  const rot = (time * 0.004 + shard.floatPhase) % (Math.PI * 2);
  const widthScale = Math.cos(rot); // Creates 3D rotation effect
  const s = shard.size;

  // Outer glow aura
  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.beginPath();
  ctx.arc(0, 0, s * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Diamond shape
  ctx.save();
  ctx.scale(Math.abs(widthScale) < 0.15 ? 0.15 : widthScale, 1);

  // Facet 1 (Left shade)
  ctx.fillStyle = widthScale > 0 ? PALETTE.SHARD_EDGE : PALETTE.SHARD_CORE;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(-s, 0);
  ctx.lineTo(0, s);
  ctx.closePath();
  ctx.fill();

  // Facet 2 (Right highlight)
  ctx.fillStyle = widthScale > 0 ? PALETTE.SHARD_CORE : PALETTE.SHARD_EDGE;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s, 0);
  ctx.lineTo(0, s);
  ctx.closePath();
  ctx.fill();

  // Core white sparkle
  ctx.fillStyle = PALETTE.SHARD_SPARK;
  ctx.fillRect(-2, -3, 4, 6);

  ctx.restore();
  ctx.restore();
}
