/**
 * Star Fall Animation System
 * Triggers a delicate starlight shooting star shower in the deep background sky
 * when the player breaks their previous high score record.
 * Star sizes match the normal blinking sky stars (1-2px), rendered behind all buildings.
 */

interface FallingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface StardustPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class StarFallSystem {
  private isActive: boolean = false;
  private timer: number = 0;
  private duration: number = 4.5; // Duration of celestial star fall
  private stars: FallingStar[] = [];
  private stardust: StardustPoint[] = [];
  private nextStarSpawn: number = 0;
  private width: number = 960;

  public setDimensions(width: number) {
    this.width = width;
  }

  public trigger(_score?: number) {
    this.isActive = true;
    this.timer = 0;
    this.stars = [];
    this.stardust = [];
    this.nextStarSpawn = 0;

    // Initial small batch of subtle background falling stars
    for (let i = 0; i < 4; i++) {
      this.spawnFallingStar(true);
    }
  }

  public reset() {
    this.isActive = false;
    this.timer = 0;
    this.stars = [];
    this.stardust = [];
  }

  public update(delta: number) {
    if (!this.isActive && this.stars.length === 0 && this.stardust.length === 0) {
      return;
    }

    if (this.isActive) {
      this.timer += delta;
      if (this.timer >= this.duration) {
        this.isActive = false;
      }

      // Rhythmic spawn of delicate background shooting stars
      this.nextStarSpawn -= delta;
      if (this.nextStarSpawn <= 0 && this.timer < this.duration - 0.8) {
        const count = Math.random() < 0.6 ? 1 : 2;
        for (let i = 0; i < count; i++) {
          this.spawnFallingStar(false);
        }
        this.nextStarSpawn = 0.25 + Math.random() * 0.35;
      }
    }

    // Update Falling Stars
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      s.life += delta;
      s.x += s.vx * delta;
      s.y += s.vy * delta;

      // Occasionally emit tiny 1px stardust point matching normal star size
      if (Math.random() < 0.3) {
        this.stardust.push({
          x: s.x - (s.vx / 30) * Math.random(),
          y: s.y - (s.vy / 30) * Math.random(),
          vx: (Math.random() - 0.5) * 8,
          vy: 12 + Math.random() * 15,
          size: 1,
          alpha: 0.8,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.4,
        });
      }

      // Fade envelope
      const progress = s.life / s.maxLife;
      if (progress < 0.15) {
        s.alpha = progress / 0.15;
      } else if (progress > 0.7) {
        s.alpha = Math.max(0, 1 - (progress - 0.7) / 0.3);
      } else {
        s.alpha = 1;
      }

      if (s.life >= s.maxLife || s.y > 450 || s.x < -60) {
        this.stars.splice(i, 1);
      }
    }

    // Update Tiny Stardust Points
    for (let i = this.stardust.length - 1; i >= 0; i--) {
      const p = this.stardust[i];
      p.life += delta;
      p.x += p.vx * delta;
      p.y += p.vy * delta;

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      if (p.life >= p.maxLife || p.y > 400) {
        this.stardust.splice(i, 1);
      }
    }
  }

  private spawnFallingStar(initial: boolean) {
    // Gentle diagonal trajectory across upper night sky
    const angle = (30 + Math.random() * 10) * (Math.PI / 180);
    const speed = 260 + Math.random() * 140;

    const vx = -Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    let startX: number;
    let startY: number;

    if (initial) {
      startX = Math.random() * 700 + 200;
      startY = Math.random() * 140 - 20;
    } else {
      if (Math.random() < 0.6) {
        startX = Math.random() * 650 + 250;
        startY = -20 - Math.random() * 30;
      } else {
        startX = this.width + 10 + Math.random() * 40;
        startY = Math.random() * 120 - 10;
      }
    }

    // Matches the normal blinking sky stars: size 1px or 2px
    const size = Math.random() < 0.3 ? 2 : 1;

    this.stars.push({
      x: startX,
      y: startY,
      vx,
      vy,
      length: 22 + Math.random() * 16, // Slender, delicate tail
      size,
      alpha: 0,
      life: 0,
      maxLife: 1.1 + Math.random() * 0.5,
    });
  }

  /**
   * Renders the falling stars in the sky background.
   * Rendered BEFORE the buildings are drawn so it is always occluded
   * by the city skyline at the bottom layer behind the buildings.
   */
  public renderBackground(ctx: CanvasRenderingContext2D) {
    if (!this.isActive && this.stars.length === 0 && this.stardust.length === 0) {
      return;
    }

    ctx.save();

    // 1. Tiny 1px drifting stardust
    for (const p of this.stardust) {
      if (p.alpha <= 0.02) continue;
      ctx.globalAlpha = p.alpha * 0.75;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }

    // 2. Slender, delicate shooting stars (pure natural starlight, normal star size)
    for (const s of this.stars) {
      if (s.alpha <= 0.02) continue;

      ctx.save();
      ctx.globalAlpha = s.alpha;

      const vMag = Math.hypot(s.vx, s.vy);
      if (vMag > 0.001) {
        const uVx = s.vx / vMag;
        const uVy = s.vy / vMag;

        const tailX = s.x - uVx * s.length;
        const tailY = s.y - uVy * s.length;

        // Subtle slender tail gradient (soft starlight white to transparent)
        const tailGrad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        tailGrad.addColorStop(0, 'transparent');
        tailGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
        tailGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Star head - identical size to normal blinking stars (1px or 2px)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(
          Math.round(s.x - s.size / 2),
          Math.round(s.y - s.size / 2),
          s.size,
          s.size
        );
      }

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Simplified celebratory text: only "NEW RECORD", floating cleanly
   * and dynamically matching the active game color cycle!
   */
  public renderText(ctx: CanvasRenderingContext2D, width: number, accentColor: string = '#38BDF8') {
    if (!this.isActive || this.timer >= this.duration) return;

    // Smooth fade in & fade out envelope
    let textAlpha = 1;
    if (this.timer < 0.35) {
      textAlpha = this.timer / 0.35;
    } else if (this.timer > this.duration - 0.7) {
      textAlpha = Math.max(0, (this.duration - this.timer) / 0.7);
    }

    if (textAlpha <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = textAlpha;

    const cx = width / 2;
    // Gentle floating vertical drift
    const cy = 85 + Math.sin(this.timer * 2.8) * 3;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glowing starlight glow dynamically matching the active game color cycle!
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.font = '700 13px "Press Start 2P", monospace';
    ctx.fillStyle = accentColor;
    ctx.fillText('NEW RECORD', cx, cy);

    ctx.restore();
  }
}
