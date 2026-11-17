/**
 * Canvas 2D Graphic Renderer for ¡Caos Gelatina! (Expanded with Team Action & Paint War)
 */

import {
  PlayerState,
  Particle,
  HexTile,
  Hazard,
  DonutItem,
  CrownItem,
  BallItem,
  CoinItem,
  PlatformItem,
  TargetZone,
  PaintCell,
  CakeGremlin,
  GameModeId,
} from '../types/game';

export class GameRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    players: PlayerState[],
    particles: Particle[],
    mode: GameModeId,
    screenShake: number,
    hexTiles?: HexTile[],
    hazards?: Hazard[],
    donut?: DonutItem,
    crown?: CrownItem,
    ball?: BallItem,
    coins?: CoinItem[],
    platforms?: PlatformItem[],
    targetZones?: TargetZone[],
    honeyLevel?: number,
    paintCells?: PaintCell[],
    gremlins?: CakeGremlin[],
    cakeHealth?: number,
    bombTimer?: number,
    roundTimeRemaining?: number,
    conveyorSpeed?: number
  ) {
    ctx.save();

    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake;
      const shakeY = (Math.random() - 0.5) * screenShake;
      ctx.translate(shakeX, shakeY);
    }

    this.drawBackground(ctx, width, height, mode);

    // 1. Paint War Turf Grid
    if (mode === 'paint-war' && paintCells) {
      this.drawPaintGrid(ctx, paintCells);
    }

    // 2. Cake Defense: Central Cake & Health
    if (mode === 'cake-defense') {
      this.drawCentralCake(ctx, width, height, cakeHealth ?? 100);
      if (gremlins) this.drawCakeGremlins(ctx, gremlins);
    }

    // 3. Hex Crumble
    if (mode === 'hex-crumble' && hexTiles) {
      this.drawHexGrid(ctx, hexTiles);
    }

    // 4. Honey Lava & Biscuit Platforms
    if (mode === 'honey-lava') {
      if (platforms) this.drawPlatforms(ctx, platforms);
      if (honeyLevel !== undefined) this.drawHoneyLava(ctx, width, height, honeyLevel);
    }

    // 5. Conveyor Dash
    if (mode === 'conveyor-dash') {
      this.drawConveyorBelts(ctx, width, height, conveyorSpeed ?? 150);
    }

    // 6. Bullseye Targets
    if (mode === 'target-bullseye' && targetZones) {
      this.drawTargetZones(ctx, targetZones);
    }

    // 7. Jelly Soccer
    if (mode === 'jelly-soccer') {
      this.drawSoccerPitch(ctx, width, height);
      if (ball) this.drawSoccerBall(ctx, ball);
    }

    // 8. Jelly King Hill
    if (mode === 'jelly-king') {
      this.drawJellyHill(ctx, width, height);
    }

    // 9. Donut Tug / Candy Siege
    if (mode === 'donut-tug' || mode === 'candy-siege') {
      this.drawTugField(ctx, width, height);
    }

    if (hazards) {
      this.drawHazards(ctx, hazards);
    }

    // Coins
    if (coins) {
      for (const c of coins) {
        if (!c.collected) this.drawCoin(ctx, c);
      }
    }

    // Free items
    if (donut && donut.carrierId === null) {
      this.drawDonut(ctx, donut.x, donut.y + Math.sin(donut.bouncePhase) * 6, donut.radius);
    }
    if (crown && crown.carrierId === null) {
      this.drawCrown(ctx, crown.x, crown.y + Math.sin(crown.floatOffset) * 8, crown.radius);
    }

    // Characters
    for (const player of players) {
      if (player.isAlive) {
        this.drawPlayer(ctx, player, mode, bombTimer);
      }
    }

    // Particles
    this.drawParticles(ctx, particles);

    ctx.restore();
  }

  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mode: GameModeId
  ) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (mode === 'paint-war') {
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
    } else if (mode === 'cake-defense') {
      bgGrad.addColorStop(0, '#2e1065');
      bgGrad.addColorStop(0.6, '#3b0764');
      bgGrad.addColorStop(1, '#581c87');
    } else if (mode === 'hot-bomb' || mode === 'meteor-shower') {
      bgGrad.addColorStop(0, '#1c1917');
      bgGrad.addColorStop(0.5, '#292524');
      bgGrad.addColorStop(1, '#441d1d');
    } else if (mode === 'donut-heist' || mode === 'donut-tug') {
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.6, '#312e81');
      bgGrad.addColorStop(1, '#431407');
    } else if (mode === 'hex-crumble') {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.7, '#1e293b');
      bgGrad.addColorStop(1, '#78350f');
    } else if (mode === 'jelly-soccer') {
      bgGrad.addColorStop(0, '#064e3b');
      bgGrad.addColorStop(0.5, '#065f46');
      bgGrad.addColorStop(1, '#047857');
    } else if (mode === 'whisk-dodge') {
      bgGrad.addColorStop(0, '#082f49');
      bgGrad.addColorStop(0.6, '#0c4a6e');
      bgGrad.addColorStop(1, '#164e63');
    } else if (mode === 'egg-splat') {
      bgGrad.addColorStop(0, '#134e4a');
      bgGrad.addColorStop(0.6, '#115e59');
      bgGrad.addColorStop(1, '#042f2e');
    } else if (mode === 'coin-frenzy') {
      bgGrad.addColorStop(0, '#422006');
      bgGrad.addColorStop(0.6, '#713f12');
      bgGrad.addColorStop(1, '#854d0e');
    } else {
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.6, '#2e1065');
      bgGrad.addColorStop(1, '#3b0764');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 48;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (mode === 'donut-heist') {
      const floorY = height - 65;
      const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
      floorGrad.addColorStop(0, '#f59e0b');
      floorGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, floorY, width, 65);
    }
  }

  /**
   * Draw Paint War Turf Cells
   */
  private static drawPaintGrid(ctx: CanvasRenderingContext2D, cells: PaintCell[]) {
    ctx.save();
    for (const c of cells) {
      ctx.fillStyle = c.color;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(c.x + 1, c.y + 1, c.width - 2, c.height - 2);

      // Splat texture in cell
      ctx.fillStyle = c.team === 'red' ? '#fda4af' : '#93c5fd';
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Draw Central Birthday Cake for Cake Defense
   */
  private static drawCentralCake(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    health: number
  ) {
    const cx = width * 0.5;
    const cy = height * 0.55;

    ctx.save();
    ctx.translate(cx, cy);

    // Cake Base
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.roundRect(-55, -20, 110, 50, 10);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#db2777';
    ctx.stroke();

    // Chocolate Frosting Layer
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-45, -45, 90, 30, 8);
    ctx.fill();

    // Top Strawberry Layer
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(-35, -65, 70, 24, 6);
    ctx.fill();

    // Burning Birthday Candle
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-3, -80, 6, 16);
    // Candle Flame
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, -84 + Math.sin(Date.now() * 0.02) * 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cake Health Bar above
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(-50, -100, 100, 12, 4);
    ctx.fill();

    const hpWidth = Math.max(0, (health / 100) * 96);
    ctx.fillStyle = health > 40 ? '#10b981' : '#ef4444';
    ctx.fillRect(-48, -98, hpWidth, 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PASTEL: ${Math.round(health)}%`, 0, -104);

    ctx.restore();
  }

  /**
   * Draw Hungry Sugar Gremlins
   */
  private static drawCakeGremlins(ctx: CanvasRenderingContext2D, gremlins: CakeGremlin[]) {
    for (const g of gremlins) {
      if (g.hp <= 0) continue;
      ctx.save();
      ctx.translate(g.x, g.y);

      // Squishy purple body
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#581c87';
      ctx.stroke();

      // Hungry glowing eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5, -3, 4, 0, Math.PI * 2);
      ctx.arc(5, -3, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-4, -3, 2, 0, Math.PI * 2);
      ctx.arc(6, -3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Tiny antennae
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, -g.radius);
      ctx.lineTo(-9, -g.radius - 6);
      ctx.moveTo(5, -g.radius);
      ctx.lineTo(9, -g.radius - 6);
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * Draw Tug of War Field
   */
  private static drawTugField(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    // Center dividing line
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 70);
    ctx.lineTo(width / 2, height - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Red scoring line (left)
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(180, 70);
    ctx.lineTo(180, height - 30);
    ctx.stroke();

    // Blue scoring line (right)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width - 180, 70);
    ctx.lineTo(width - 180, height - 30);
    ctx.stroke();

    ctx.restore();
  }

  private static drawSoccerPitch(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;

    ctx.strokeRect(50, 70, width - 100, height - 120);

    ctx.beginPath();
    ctx.moveTo(width / 2, 70);
    ctx.lineTo(width / 2, height - 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width / 2, (height + 20) / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

    const goalTop = height * 0.4;
    const goalHeight = height * 0.3;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.fillRect(15, goalTop, 35, goalHeight);
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(15, goalTop, 35, goalHeight);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.fillRect(width - 50, goalTop, 35, goalHeight);
    ctx.strokeStyle = '#3b82f6';
    ctx.strokeRect(width - 50, goalTop, 35, goalHeight);

    ctx.restore();
  }

  private static drawSoccerBall(ctx: CanvasRenderingContext2D, ball: BallItem) {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);

    const grad = ctx.createRadialGradient(-ball.radius * 0.3, -ball.radius * 0.3, 3, 0, 0, ball.radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#f43f5e');
    grad.addColorStop(0.85, '#be123c');
    grad.addColorStop(1, '#881337');

    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#4c0519';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const px = Math.cos(angle) * (ball.radius * 0.55);
      const py = Math.sin(angle) * (ball.radius * 0.55);
      ctx.beginPath();
      ctx.arc(px, py, ball.radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private static drawHoneyLava(ctx: CanvasRenderingContext2D, width: number, height: number, level: number) {
    ctx.save();
    const honeyGrad = ctx.createLinearGradient(0, level, 0, height);
    honeyGrad.addColorStop(0, '#f59e0b');
    honeyGrad.addColorStop(0.4, '#d97706');
    honeyGrad.addColorStop(1, '#92400e');

    ctx.fillStyle = honeyGrad;
    ctx.beginPath();
    ctx.moveTo(0, level);
    for (let x = 0; x <= width; x += 30) {
      const waveY = level + Math.sin(Date.now() * 0.005 + x * 0.05) * 5;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Hot bubbling foam
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    for (let i = 0; i < 6; i++) {
      const bx = (width * 0.18 * i + (Date.now() * 0.04) % 150) % width;
      const by = level + 12 + Math.sin(i * 3) * 8;
      ctx.beginPath();
      ctx.arc(bx, by, 5 + (i % 3) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private static drawPlatforms(ctx: CanvasRenderingContext2D, platforms: PlatformItem[]) {
    for (const plat of platforms) {
      ctx.save();
      ctx.translate(plat.x, plat.y);
      ctx.fillStyle = plat.color || '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(-plat.width / 2, -plat.height / 2, plat.width, plat.height, 8);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#b45309';
      ctx.stroke();

      // Biscuit texture
      ctx.fillStyle = '#92400e';
      for (let x = -plat.width / 2 + 15; x < plat.width / 2 - 10; x += 18) {
        ctx.beginPath();
        ctx.arc(x, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private static drawConveyorBelts(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    conveyorSpeed: number
  ) {
    const beltLeft = 130;
    const beltRight = width - 70;
    const beltWidth = beltRight - beltLeft;
    const beltFloorY = height - 95;
    const beltHeight = 36;

    ctx.save();

    // Bottom danger pit / shredder abyss under the conveyor
    const pitGrad = ctx.createLinearGradient(0, height - 45, 0, height);
    pitGrad.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
    pitGrad.addColorStop(1, 'rgba(185, 28, 28, 0.85)');
    ctx.fillStyle = pitGrad;
    ctx.fillRect(0, height - 45, width, 45);

    // Left drop-off danger zone warning
    ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
    ctx.fillRect(0, 70, beltLeft, height - 70);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(beltLeft, 75);
    ctx.lineTo(beltLeft, height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡CAÍDA!', beltLeft / 2, beltFloorY - 25);
    ctx.fillText('ELIMINACIÓN', beltLeft / 2, beltFloorY - 10);

    // Support pillars under conveyor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(beltLeft + 45, beltFloorY + beltHeight, 26, height - (beltFloorY + beltHeight));
    ctx.fillRect(beltRight - 75, beltFloorY + beltHeight, 26, height - (beltFloorY + beltHeight));

    // Main Conveyor Belt Track
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(beltLeft, beltFloorY, beltWidth, beltHeight, 18);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Animated leftward moving treads / chevrons on belt
    const speedFactor = conveyorSpeed / 140;
    const offset = ((Date.now() * 0.16 * speedFactor) % 40 + 40) % 40;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 3;
    for (let x = beltLeft + 24 + (40 - offset); x < beltRight - 24; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x + 8, beltFloorY + 8);
      ctx.lineTo(x - 4, beltFloorY + beltHeight / 2);
      ctx.lineTo(x + 8, beltFloorY + beltHeight - 8);
      ctx.stroke();
    }

    // Rotating End Rollers (Gears)
    const rollerAngle = -(Date.now() * 0.006 * speedFactor);
    [beltLeft + 18, beltRight - 18].forEach(rx => {
      ctx.save();
      ctx.translate(rx, beltFloorY + beltHeight / 2);
      ctx.rotate(rollerAngle);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 10);
      ctx.stroke();
      ctx.restore();
    });

    // Speed multiplier readout on belt
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `⚡ VELOCIDAD DE CINTA: ${speedFactor.toFixed(1)}x  —  ¡CORRE A LA DERECHA Y SALTA LOS POSTES!`,
      beltLeft + beltWidth / 2,
      beltFloorY + beltHeight + 22
    );

    ctx.restore();
  }

  private static drawTargetZones(ctx: CanvasRenderingContext2D, zones: TargetZone[]) {
    ctx.save();
    zones.forEach(z => {
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
      ctx.fillStyle = z.color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 3;
      ctx.strokeStyle = z.color;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(z.label, z.x, z.y - z.radius + 18);
    });
    ctx.restore();
  }

  private static drawCoin(ctx: CanvasRenderingContext2D, coin: CoinItem) {
    ctx.save();
    const floatY = coin.y + Math.sin(Date.now() * 0.006 + coin.floatPhase) * 4;
    ctx.translate(coin.x, floatY);

    const grad = ctx.createRadialGradient(-coin.radius * 0.3, -coin.radius * 0.3, 1, 0, 0, coin.radius);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(1, '#a16207');

    ctx.beginPath();
    ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#713f12';
    ctx.stroke();

    ctx.fillStyle = '#713f12';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 0.5);

    ctx.restore();
  }

  private static drawHexGrid(ctx: CanvasRenderingContext2D, tiles: HexTile[]) {
    for (const tile of tiles) {
      if (tile.state === 'fallen') continue;

      ctx.save();
      ctx.translate(tile.x + tile.wobbleOffset, tile.y);

      let fill = '#f59e0b';
      let stroke = '#d97706';
      if (tile.state === 'warning') {
        fill = '#fbbf24';
        stroke = '#b45309';
      } else if (tile.state === 'cracking') {
        fill = '#ef4444';
        stroke = '#991b1b';
      }

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = Math.cos(angle) * tile.radius;
        const hy = Math.sin(angle) * tile.radius * 0.7;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();

      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = stroke;
      ctx.stroke();

      ctx.restore();
    }
  }

  private static drawJellyHill(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const cx = width * 0.5;
    const cy = height * 0.58;
    const rx = width * 0.38;
    const ry = height * 0.28;

    const hillGrad = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, rx);
    hillGrad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    hillGrad.addColorStop(0.7, 'rgba(126, 34, 206, 0.25)');
    hillGrad.addColorStop(1, 'rgba(88, 28, 135, 0)');

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = hillGrad;
    ctx.fill();
    ctx.restore();
  }

  private static drawHazards(ctx: CanvasRenderingContext2D, hazards: Hazard[]) {
    for (const h of hazards) {
      if (h.type === 'rolling-pin') {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(-h.width / 2, -h.height / 2, h.width, h.height, 8);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#92400e';
        ctx.stroke();
        ctx.restore();
      } else if (h.type === 'whisk-blade') {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rotation || 0);

        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(-h.width / 2, -h.height / 2, h.width, h.height, 6);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#64748b';
        ctx.stroke();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (h.type === 'meteor') {
        ctx.save();
        if (h.targetX !== undefined && h.targetY !== undefined) {
          ctx.beginPath();
          ctx.arc(h.targetX, h.targetY, 28, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ef4444';
          ctx.stroke();
        }

        ctx.translate(h.x, h.y);
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#ea580c');
        grad.addColorStop(1, '#7c2d12');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (h.type === 'cream-geyser') {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        if (h.active) {
          const creamGrad = ctx.createLinearGradient(0, 0, 0, -h.height);
          creamGrad.addColorStop(0, '#ffffff');
          creamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
          ctx.fillStyle = creamGrad;
          ctx.beginPath();
          ctx.moveTo(-18, 0);
          ctx.quadraticCurveTo(-24, -h.height * 0.5, -12, -h.height);
          ctx.lineTo(12, -h.height);
          ctx.quadraticCurveTo(24, -h.height * 0.5, 18, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      } else if (h.type === 'conveyor-post') {
        ctx.save();
        ctx.translate(h.x, h.y);

        // Post column (standing up from h.height/2 to -h.height/2)
        const postGrad = ctx.createLinearGradient(-h.width / 2, 0, h.width / 2, 0);
        postGrad.addColorStop(0, '#dc2626');
        postGrad.addColorStop(0.5, '#f87171');
        postGrad.addColorStop(1, '#991b1b');

        ctx.fillStyle = postGrad;
        ctx.beginPath();
        ctx.roundRect(-h.width / 2, -h.height / 2, h.width, h.height, 6);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#fef08a';
        ctx.stroke();

        // Hazard warning stripes on post
        ctx.fillStyle = '#fef08a';
        for (let sy = -h.height / 2 + 10; sy < h.height / 2 - 10; sy += 18) {
          ctx.fillRect(-h.width / 2 + 2, sy, h.width - 4, 6);
        }

        // Glowing top bulb
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -h.height / 2 - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Base flange on belt
        ctx.fillStyle = '#475569';
        ctx.fillRect(-h.width / 2 - 5, h.height / 2 - 6, h.width + 10, 6);

        ctx.restore();
      }
    }
  }

  public static drawPlayer(
    ctx: CanvasRenderingContext2D,
    p: PlayerState,
    mode: GameModeId,
    bombTimer?: number
  ) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(p.scaleX, p.scaleY);

    // Team Halo Ring if team game
    const isTeamMode = mode === 'paint-war' || mode === 'cake-defense' || mode === 'jelly-soccer' || mode === 'donut-tug';
    if (isTeamMode) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, p.radius * 0.9, p.radius * 0.95, p.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.team === 'red' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)';
      ctx.fill();
      ctx.restore();
    }

    if (p.hasBomb) {
      ctx.save();
      const auraPulse = 1 + Math.sin(Date.now() * 0.02) * 0.25;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 1.55 * auraPulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fill();
      ctx.restore();
    }

    const r = p.radius;
    const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.25, p.accentColor);
    bodyGrad.addColorStop(0.85, p.color);
    bodyGrad.addColorStop(1, '#0f172a');

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.bezierCurveTo(r * 1.05, -r * 0.9, r * 1.15, r * 0.8, 0, r);
    ctx.bezierCurveTo(-r * 1.15, r * 0.8, -r * 1.05, -r * 0.9, 0, -r);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = p.color;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.32, r * 0.18, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();

    this.drawFace(ctx, p);

    if (p.isSlapping) {
      this.drawSlapHand(ctx, p);
    }

    this.drawHat(ctx, p);

    if (p.hasCrown) {
      this.drawCrown(ctx, 0, -r - 14, 18);
    }
    if (p.hasDonut) {
      this.drawDonut(ctx, 0, -r - 10, 20);
    }

    ctx.restore();

    this.drawPlayerTag(ctx, p, bombTimer, isTeamMode);
  }

  private static drawFace(ctx: CanvasRenderingContext2D, p: PlayerState) {
    const eyeSpacing = 11;
    const eyeY = -p.radius * 0.15;
    const eyeRadius = 6.5;

    [-eyeSpacing, eyeSpacing].forEach(offsetX => {
      ctx.save();
      ctx.translate(offsetX + p.eyeOffset.x * 0.4, eyeY + p.eyeOffset.y * 0.4);

      if (p.isBlinking) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-eyeRadius, 0);
        ctx.lineTo(eyeRadius, 0);
        ctx.stroke();
      } else {
        ctx.beginPath();
        const eyeSquish = p.hasBomb ? 1.25 : 1.0;
        ctx.arc(0, 0, eyeRadius * eyeSquish, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        const pupilRadius = 3.2;
        const pupilX = Math.max(-3, Math.min(3, p.eyeOffset.x * 0.7));
        const pupilY = Math.max(-3, Math.min(3, p.eyeOffset.y * 0.7));
        ctx.beginPath();
        ctx.arc(pupilX, pupilY, pupilRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#090d16';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pupilX - 1, pupilY - 1, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      ctx.restore();
    });

    ctx.save();
    ctx.translate(p.eyeOffset.x * 0.3, eyeY + 12);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    if (p.hasBomb || p.stunTimer > 0) {
      ctx.ellipse(0, 0, 4.5, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#7f1d1d';
      ctx.fill();
      ctx.stroke();
    } else if (p.hasCrown || p.hasDonut || p.score > 0) {
      ctx.arc(0, -2, 7, 0.2, Math.PI - 0.2, false);
      ctx.stroke();
    } else {
      ctx.arc(0, -1, 5, 0.2, Math.PI - 0.2, false);
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawSlapHand(ctx: CanvasRenderingContext2D, p: PlayerState) {
    ctx.save();
    const slapX = p.facing * (p.radius + 18);
    ctx.translate(slapX, 0);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.facing * 8, 0, 18, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    ctx.restore();
  }

  private static drawHat(ctx: CanvasRenderingContext2D, p: PlayerState) {
    const topY = -p.radius * 0.85;
    ctx.save();
    ctx.translate(0, topY);

    if (p.hat === 'propeller') {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, 0, 14, Math.PI, 0);
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      const propSpin = Math.sin(Date.now() * 0.02) * 16;
      ctx.beginPath();
      ctx.moveTo(-propSpin, -6);
      ctx.lineTo(propSpin, -6);
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -6, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.hat === 'chef') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -8, 12, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-10, 0, 20, 6);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (p.hat === 'ninja') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, -3, 32, 6);
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-26, 6 + Math.sin(Date.now() * 0.01) * 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  public static drawCrown(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.save();
    ctx.translate(x, y);

    const grad = ctx.createLinearGradient(0, -radius, 0, radius);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#b45309');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-radius, radius * 0.5);
    ctx.lineTo(-radius * 0.9, -radius * 0.4);
    ctx.lineTo(-radius * 0.4, 0);
    ctx.lineTo(0, -radius * 0.8);
    ctx.lineTo(radius * 0.4, 0);
    ctx.lineTo(radius * 0.9, -radius * 0.4);
    ctx.lineTo(radius, radius * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#78350f';
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public static drawDonut(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
    ctx.arc(0, 0, radius * 0.38, 0, Math.PI * 2, true);
    ctx.fill();

    const sprinkles = [
      { x: -radius * 0.5, y: -radius * 0.3, c: '#38bdf8' },
      { x: radius * 0.4, y: -radius * 0.4, c: '#a855f7' },
      { x: -radius * 0.2, y: radius * 0.5, c: '#facc15' },
      { x: radius * 0.5, y: radius * 0.2, c: '#4ade80' },
    ];
    for (const s of sprinkles) {
      ctx.fillStyle = s.c;
      ctx.fillRect(s.x, s.y, 4, 8);
    }

    ctx.restore();
  }

  private static drawPlayerTag(
    ctx: CanvasRenderingContext2D,
    p: PlayerState,
    bombTimer?: number,
    isTeamMode?: boolean
  ) {
    ctx.save();
    ctx.translate(p.x, p.y - p.radius - 22);

    if (p.hasBomb) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-28, -26, 56, 22, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const timeLeft = bombTimer !== undefined ? Math.ceil(bombTimer) : 10;
      ctx.fillText(`💣 ${timeLeft}s`, 0, -15);
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(-24, -10, 48, 16, 4);
      ctx.fill();

      ctx.fillStyle = isTeamMode
        ? p.team === 'red'
          ? '#fda4af'
          : '#93c5fd'
        : p.accentColor;
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tagText = isTeamMode ? (p.team === 'red' ? `[R] ${p.name.slice(0, 4)}` : `[A] ${p.name.slice(0, 4)}`) : p.name;
      ctx.fillText(tagText, 0, -2);
    }

    ctx.restore();
  }

  private static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const p of particles) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(p.x, p.y);
      if (p.rotation !== undefined) ctx.rotate(p.rotation);

      ctx.fillStyle = p.color;

      if (p.type === 'confetti') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 'paint') {
        // Paint splatter droplet
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (1 - (p.life / p.maxLife) * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
