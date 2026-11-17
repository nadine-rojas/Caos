/**
 * Physics, Character Dynamics, and Smart Bot AI for ¡Caos Gelatina!
 * Enhanced with intelligent Honey Lava navigation, Team Action & Paint War.
 */

import {
  PlayerState,
  Particle,
  PhysicsParams,
  GameModeId,
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
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';

export const DEFAULT_PHYSICS: PhysicsParams = {
  gravity: 980,
  friction: 0.88,
  bounciness: 0.75,
  slapForce: 650,
  squashDamping: 14,
  moveSpeed: 380,
};

export class GamePhysicsWorld {
  public particles: Particle[] = [];
  public screenShake: number = 0;
  public hitstopTimer: number = 0;
  public params: PhysicsParams = { ...DEFAULT_PHYSICS };

  public spawnBurst(
    x: number,
    y: number,
    color: string,
    count = 8,
    type: Particle['type'] = 'slime'
  ) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 100 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.35,
        size: type === 'confetti' ? 6 + Math.random() * 4 : 4 + Math.random() * 5,
        color:
          type === 'confetti'
            ? ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'][
                Math.floor(Math.random() * 5)
              ]
            : color,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12,
      });
    }
  }

  public updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 400 * dt;
      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed * dt;
      }
    }
  }

  public updateEffects(dt: number): boolean {
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return true;
    }
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }
    return false;
  }

  public triggerHitstop(duration = 0.05, shakeAmount = 8) {
    this.hitstopTimer = duration;
    this.screenShake = Math.max(this.screenShake, shakeAmount);
  }

  /**
   * Update Player dynamics across all 16 modes
   */
  public updatePlayer(
    player: PlayerState,
    dt: number,
    arenaWidth: number,
    arenaHeight: number,
    input: { dx: number; dy: number; slap: boolean },
    activeMode: GameModeId,
    hexTiles?: HexTile[],
    platforms?: PlatformItem[],
    honeyLevel?: number,
    conveyorSpeed?: number
  ) {
    if (!player.isAlive) return;

    if (player.slapCooldown > 0) player.slapCooldown -= dt;
    if (player.stunTimer > 0) {
      player.stunTimer -= dt;
      input = { dx: 0, dy: 0, slap: false };
    }
    if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt;

    // Slap execution
    if (input.slap && player.slapCooldown <= 0 && player.stunTimer <= 0) {
      player.isSlapping = true;
      player.slapCooldown = 0.5;
      soundEngine.playSlap();

      const dashImpulse = 280;
      player.vx += player.facing * dashImpulse;
      player.scaleX = 1.35;
      player.scaleY = 0.75;

      this.spawnBurst(
        player.x + player.facing * player.radius,
        player.y,
        player.accentColor,
        6,
        'star'
      );

      setTimeout(() => {
        player.isSlapping = false;
      }, 180);
    }

    const isTopDown = [
      'hot-bomb',
      'jelly-king',
      'whisk-dodge',
      'meteor-shower',
      'jelly-soccer',
      'target-bullseye',
      'egg-splat',
      'coin-frenzy',
      'paint-war',
      'cake-defense',
      'candy-siege',
      'donut-tug',
    ].includes(activeMode);

    const speed =
      this.params.moveSpeed *
      (player.hasBomb ? 1.15 : player.hasDonut ? 0.8 : activeMode === 'conveyor-dash' ? 1.18 : 1.0);

    const effectiveFriction =
      activeMode === 'egg-splat' ? 0.985 : this.params.friction;

    if (input.dx !== 0) {
      player.vx += input.dx * speed * 3.5 * dt;
      player.facing = input.dx > 0 ? 1 : -1;
    }

    if (isTopDown) {
      if (input.dy !== 0) {
        player.vy += input.dy * speed * 3.5 * dt;
      }
      player.vx *= Math.pow(effectiveFriction, dt * 60);
      player.vy *= Math.pow(effectiveFriction, dt * 60);
    } else {
      // Platformer with Gravity (honey-lava, hex-crumble, donut-heist, conveyor-dash)
      if (input.dy < 0 && player.isGrounded) {
        player.vy = activeMode === 'conveyor-dash' ? -640 : -620;
        player.isGrounded = false;
        player.scaleX = 0.75;
        player.scaleY = 1.35;
        soundEngine.playBoing(1.2);
        this.spawnBurst(player.x, player.y + player.radius, '#ffffff', 4, 'smoke');
      }
      player.vy += this.params.gravity * dt;
      player.vx *= Math.pow(effectiveFriction, dt * 60);
    }

    // Apply conveyor belt leftward pull in conveyor-dash
    if (activeMode === 'conveyor-dash' && conveyorSpeed !== undefined) {
      const beltPull = player.isGrounded ? conveyorSpeed : conveyorSpeed * 0.35;
      player.x -= beltPull * dt;
    }

    // Speed Clamps
    const maxSpeed = 700;
    const currentSpeed = Math.hypot(player.vx, player.vy);
    if (currentSpeed > maxSpeed) {
      player.vx = (player.vx / currentSpeed) * maxSpeed;
      player.vy = (player.vy / currentSpeed) * maxSpeed;
    }

    // Integrate
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Harmonic squash & stretch oscillation
    const damp = this.params.squashDamping;
    player.scaleX += (1.0 - player.scaleX) * damp * dt;
    player.scaleY += (1.0 - player.scaleY) * damp * dt;
    player.rotation = (player.vx / 800) * 0.25;

    // Eye tracking
    const lookAngle = Math.atan2(player.vy, player.vx);
    const speedRatio = Math.min(1, currentSpeed / 300);
    player.eyeOffset.x = Math.cos(lookAngle) * 5 * speedRatio + player.facing * 3;
    player.eyeOffset.y = Math.sin(lookAngle) * 4 * speedRatio;

    // Blink timer
    player.blinkTimer -= dt;
    if (player.blinkTimer <= 0) {
      player.isBlinking = !player.isBlinking;
      player.blinkTimer = player.isBlinking ? 0.12 : 2.0 + Math.random() * 2.5;
    }

    // Platform collisions in Honey Lava
    if (activeMode === 'honey-lava' && platforms) {
      player.isGrounded = false;
      for (const plat of platforms) {
        const platLeft = plat.x - plat.width / 2;
        const platRight = plat.x + plat.width / 2;
        const platTop = plat.y - plat.height / 2;

        if (
          player.x >= platLeft - 8 &&
          player.x <= platRight + 8 &&
          player.y + player.radius >= platTop - 8 &&
          player.y + player.radius <= platTop + 22 &&
          player.vy >= 0
        ) {
          player.y = platTop - player.radius;
          player.vy = 0;
          player.isGrounded = true;
          break;
        }
      }

      // Check honey lava depth
      if (honeyLevel !== undefined && player.y + player.radius >= honeyLevel - 5) {
        player.isAlive = false;
        soundEngine.playExplosion();
        this.spawnBurst(player.x, honeyLevel, '#d97706', 20, 'slime');
        this.triggerHitstop(0.08, 14);
      }
    }

    // Hex crumble collisions
    if (activeMode === 'hex-crumble') {
      player.isGrounded = false;
      if (hexTiles) {
        for (const tile of hexTiles) {
          if (tile.state === 'fallen') continue;
          const dist = Math.hypot(player.x - tile.x, player.y - tile.y);
          if (dist < tile.radius + player.radius * 0.7) {
            if (player.y + player.radius >= tile.y - 10 && player.vy >= 0) {
              player.y = tile.y - player.radius;
              player.vy = 0;
              player.isGrounded = true;
              if (tile.state === 'stable') {
                tile.state = 'warning';
                tile.steppedTimer = 0;
              }
            }
          }
        }
      }
      if (player.y > arenaHeight + 80) {
        player.isAlive = false;
        soundEngine.playExplosion();
        this.spawnBurst(player.x, arenaHeight - 10, player.color, 16, 'slime');
        this.triggerHitstop(0.08, 12);
      }
    }

    // Conveyor-dash belt surface & fall-off pit
    if (activeMode === 'conveyor-dash') {
      const beltLeft = 130;
      const beltRight = arenaWidth - 70;
      const beltFloorY = arenaHeight - 95;

      player.isGrounded = false;
      if (
        player.x >= beltLeft - 6 &&
        player.x <= beltRight + 10 &&
        player.y + player.radius >= beltFloorY - 8 &&
        player.y + player.radius <= beltFloorY + 28 &&
        player.vy >= 0
      ) {
        player.y = beltFloorY - player.radius;
        if (player.vy > 140) {
          player.scaleX = 1.35;
          player.scaleY = 0.7;
          soundEngine.playBoing(1.0);
        }
        player.vy = 0;
        player.isGrounded = true;
      }

      // Prevent running past right spawn wall, but allow falling off the left edge!
      if (player.x > beltRight - player.radius) {
        player.x = beltRight - player.radius;
        player.vx = 0;
      }

      // Eliminated when falling into the bottom pit!
      if (player.y > arenaHeight + 55) {
        player.isAlive = false;
        soundEngine.playExplosion();
        this.spawnBurst(Math.max(60, player.x), arenaHeight - 15, player.color, 22, 'slime');
        this.spawnBurst(Math.max(60, player.x), arenaHeight - 15, '#fbbf24', 12, 'star');
        this.triggerHitstop(0.09, 15);
      }
      return;
    }

    // Arena Boundary Clamps
    const margin = player.radius;
    if (isTopDown) {
      if (player.x < margin) {
        player.x = margin;
        player.vx = Math.abs(player.vx) * this.params.bounciness;
        player.scaleX = 0.75; player.scaleY = 1.3;
        soundEngine.playBoing(0.9);
      } else if (player.x > arenaWidth - margin) {
        player.x = arenaWidth - margin;
        player.vx = -Math.abs(player.vx) * this.params.bounciness;
        player.scaleX = 0.75; player.scaleY = 1.3;
        soundEngine.playBoing(0.9);
      }

      const topLimit = margin + 55;
      if (player.y < topLimit) {
        player.y = topLimit;
        player.vy = Math.abs(player.vy) * this.params.bounciness;
        player.scaleX = 1.3; player.scaleY = 0.75;
      } else if (player.y > arenaHeight - margin) {
        player.y = arenaHeight - margin;
        player.vy = -Math.abs(player.vy) * this.params.bounciness;
        player.scaleX = 1.3; player.scaleY = 0.75;
      }
    } else {
      // Platformer walls
      if (player.x < margin) {
        player.x = margin;
        player.vx = Math.abs(player.vx) * 0.8;
      } else if (player.x > arenaWidth - margin) {
        player.x = arenaWidth - margin;
        player.vx = -Math.abs(player.vx) * 0.8;
      }

      if (activeMode === 'donut-heist') {
        const floorY = arenaHeight - 65;
        if (player.y + player.radius >= floorY) {
          player.y = floorY - player.radius;
          if (player.vy > 120) {
            player.scaleX = 1.4; player.scaleY = 0.65;
            soundEngine.playBoing(1.0);
            this.spawnBurst(player.x, floorY, '#e2e8f0', 3, 'smoke');
          }
          player.vy = 0;
          player.isGrounded = true;
        }
      }
    }
  }

  /**
   * Handle Inter-Player Collision & Slap
   */
  public resolvePlayerInteractions(
    p1: PlayerState,
    p2: PlayerState,
    activeMode: GameModeId,
    coins?: CoinItem[],
    paintCells?: PaintCell[]
  ) {
    if (!p1.isAlive || !p2.isAlive) return;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);
    const minDist = p1.radius + p2.radius;

    // Slap checks
    if (p1.isSlapping && dist < minDist + 35) {
      const slapDir = p1.facing;
      if ((slapDir > 0 && dx > -10) || (slapDir < 0 && dx < 10)) {
        this.applySlapImpact(p1, p2, activeMode, coins, paintCells);
      }
    }
    if (p2.isSlapping && dist < minDist + 35) {
      const slapDir = p2.facing;
      if ((slapDir > 0 && -dx > -10) || (slapDir < 0 && -dx < 10)) {
        this.applySlapImpact(p2, p1, activeMode, coins, paintCells);
      }
    }

    // Elastic Collision
    if (dist < minDist && dist > 0.001) {
      const overlap = (minDist - dist) * 0.5;
      const nx = dx / dist;
      const ny = dy / dist;

      p1.x -= nx * overlap;
      p1.y -= ny * overlap;
      p2.x += nx * overlap;
      p2.y += ny * overlap;

      const kx = p1.vx - p2.vx;
      const ky = p1.vy - p2.vy;
      const p = 2 * (nx * kx + ny * ky) / 2;

      p1.vx -= p * nx * this.params.bounciness;
      p1.vy -= p * ny * this.params.bounciness;
      p2.vx += p * nx * this.params.bounciness;
      p2.vy += p * ny * this.params.bounciness;

      p1.scaleX = 1.25; p1.scaleY = 0.8;
      p2.scaleX = 1.25; p2.scaleY = 0.8;

      // Transfer bomb on touch
      if (p1.hasBomb && !p2.hasBomb && p2.invulnerableTimer <= 0) {
        p1.hasBomb = false;
        p2.hasBomb = true;
        p1.invulnerableTimer = 1.0;
        soundEngine.playBombTick(0.9);
        this.spawnBurst((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, '#ef4444', 10, 'star');
      } else if (p2.hasBomb && !p1.hasBomb && p1.invulnerableTimer <= 0) {
        p2.hasBomb = false;
        p1.hasBomb = true;
        p2.invulnerableTimer = 1.0;
        soundEngine.playBombTick(0.9);
        this.spawnBurst((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, '#ef4444', 10, 'star');
      }
    }
  }

  private applySlapImpact(
    attacker: PlayerState,
    victim: PlayerState,
    activeMode: GameModeId,
    coins?: CoinItem[],
    paintCells?: PaintCell[]
  ) {
    if (victim.invulnerableTimer > 0) return;

    soundEngine.playSlap();
    this.triggerHitstop(0.06, 10);

    const slapDir = attacker.facing;
    victim.vx = slapDir * this.params.slapForce;
    victim.vy = -220;
    victim.stunTimer = 0.45;
    victim.invulnerableTimer = 0.3;
    victim.scaleX = 0.6;
    victim.scaleY = 1.4;

    this.spawnBurst(victim.x, victim.y, attacker.accentColor, 10, 'star');

    // Transfer crown or donut
    if (victim.hasCrown) {
      victim.hasCrown = false;
      attacker.hasCrown = true;
      attacker.invulnerableTimer = 0.5;
      soundEngine.playPickup();
      this.spawnBurst(attacker.x, attacker.y - 30, '#fbbf24', 8, 'star');
    }
    if (victim.hasDonut) {
      victim.hasDonut = false;
      attacker.hasDonut = true;
      attacker.invulnerableTimer = 0.5;
      soundEngine.playPickup();
      this.spawnBurst(attacker.x, attacker.y, '#f472b6', 8, 'star');
    }

    // In Paint War: Mega Paint Burst of attacker's team color!
    if (activeMode === 'paint-war' && paintCells) {
      const paintColor = attacker.team === 'red' ? '#e11d48' : '#2563eb';
      this.spawnBurst(victim.x, victim.y, paintColor, 16, 'paint');
      for (const cell of paintCells) {
        if (Math.hypot(cell.x + cell.width / 2 - victim.x, cell.y + cell.height / 2 - victim.y) < 110) {
          cell.team = attacker.team;
          cell.color = paintColor;
        }
      }
    }

    // In Coin Frenzy: victim drops coins!
    if (activeMode === 'coin-frenzy' && victim.score > 0) {
      const dropCount = Math.ceil(victim.score / 2);
      victim.score -= dropCount;
      attacker.score += dropCount;
      soundEngine.playPickup();
      this.spawnBurst(victim.x, victim.y, '#eab308', 8, 'star');
    }
  }

  /**
   * Handle Giant Soccer Ball Physics
   */
  public updateSoccerBall(
    ball: BallItem,
    players: PlayerState[],
    dt: number,
    width: number,
    height: number
  ): 'p1_goal' | 'p2_goal' | null {
    ball.vx *= Math.pow(0.98, dt * 60);
    ball.vy *= Math.pow(0.98, dt * 60);
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.rotation += (ball.vx / 300) * dt * 5;

    const margin = ball.radius;
    const goalTop = height * 0.4;
    const goalBottom = height * 0.7;

    if (ball.x < margin + 15 && ball.y > goalTop && ball.y < goalBottom) {
      return 'p2_goal';
    }
    if (ball.x > width - margin - 15 && ball.y > goalTop && ball.y < goalBottom) {
      return 'p1_goal';
    }

    if (ball.x < margin) {
      ball.x = margin;
      ball.vx = Math.abs(ball.vx) * 0.85;
      soundEngine.playBoing(0.8);
    } else if (ball.x > width - margin) {
      ball.x = width - margin;
      ball.vx = -Math.abs(ball.vx) * 0.85;
      soundEngine.playBoing(0.8);
    }

    if (ball.y < margin + 55) {
      ball.y = margin + 55;
      ball.vy = Math.abs(ball.vy) * 0.85;
    } else if (ball.y > height - margin) {
      ball.y = height - margin;
      ball.vy = -Math.abs(ball.vy) * 0.85;
    }

    for (const p of players) {
      if (!p.isAlive) continue;
      const dx = ball.x - p.x;
      const dy = ball.y - p.y;
      const dist = Math.hypot(dx, dy);
      const minDist = ball.radius + p.radius;

      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const slapBonus = p.isSlapping ? 2.2 : 1.0;

        ball.vx = nx * (420 * slapBonus + Math.abs(p.vx) * 0.5);
        ball.vy = ny * (420 * slapBonus + Math.abs(p.vy) * 0.5);

        soundEngine.playBoing(p.isSlapping ? 1.4 : 1.0);
        this.triggerHitstop(0.04, 6);
        this.spawnBurst(ball.x, ball.y, '#ef4444', 6, 'star');
      }
    }

    return null;
  }

  /**
   * Smart Bot AI Controller supporting all minigames with solid Honey Lava navigation
   */
  public computeBotInput(
    bot: PlayerState,
    allPlayers: PlayerState[],
    mode: GameModeId,
    donut?: DonutItem,
    crown?: CrownItem,
    hexTiles?: HexTile[],
    ball?: BallItem,
    coins?: CoinItem[],
    hazards?: Hazard[],
    platforms?: PlatformItem[],
    honeyLevel?: number,
    gremlins?: CakeGremlin[],
    paintCells?: PaintCell[]
  ): { dx: number; dy: number; slap: boolean } {
    let dx = 0;
    let dy = 0;
    let slap = false;

    // 1. HONEY LAVA BOT LOGIC (SOLVES: "los bots no funcionan en el juego el suelo es miel hirviente")
    if (mode === 'honey-lava' && platforms && honeyLevel !== undefined) {
      const dangerLevel = honeyLevel - 50; // Safety threshold

      // Identify currently occupied platform
      const currentPlat = platforms.find(
        p =>
          bot.x >= p.x - p.width / 2 - 10 &&
          bot.x <= p.x + p.width / 2 + 10 &&
          bot.y >= p.y - 35 &&
          bot.y <= p.y + 15
      );

      // Find all platforms strictly above the rising honey level
      const safePlatforms = platforms.filter(p => p.y < dangerLevel);
      // Sort safe platforms by vertical safety (highest / most secure first)
      safePlatforms.sort((a, b) => a.y - b.y);

      // If bot is on a platform that is about to be submerged or is grounded on a safe platform
      if (currentPlat) {
        const isPlatSinking = currentPlat.y >= dangerLevel - 20;

        // Check if any rival is on the same platform to slap them off!
        const rivalOnPlat = allPlayers.find(
          p =>
            p.id !== bot.id &&
            p.isAlive &&
            p.x >= currentPlat.x - currentPlat.width / 2 &&
            p.x <= currentPlat.x + currentPlat.width / 2 &&
            Math.abs(p.y - bot.y) < 30
        );

        if (rivalOnPlat && Math.abs(rivalOnPlat.x - bot.x) < 55) {
          dx = Math.sign(rivalOnPlat.x - bot.x);
          slap = true;
        }

        if (isPlatSinking) {
          // Urgent: jump to a higher safe platform!
          const higherPlat = safePlatforms.find(p => p.y < currentPlat.y);
          if (higherPlat) {
            dx = Math.sign(higherPlat.x - bot.x);
            if (bot.isGrounded) dy = -1; // JUMP!
          }
        } else {
          // Stay centered safely on current platform
          const centerDist = currentPlat.x - bot.x;
          if (Math.abs(centerDist) > 35) {
            dx = Math.sign(centerDist);
          } else {
            // Check if there is an even higher summit platform within reach
            const summitPlat = safePlatforms[0];
            if (summitPlat && summitPlat.y < currentPlat.y - 40 && Math.abs(summitPlat.x - bot.x) < 180) {
              dx = Math.sign(summitPlat.x - bot.x);
              if (bot.isGrounded) dy = -1; // Jump towards summit!
            }
          }
        }
      } else {
        // In mid-air or falling: steer aggressively toward nearest safe platform
        let bestPlat = safePlatforms[0] || platforms[0];
        let bestDist = Infinity;
        for (const p of safePlatforms) {
          const d = Math.hypot(p.x - bot.x, p.y - bot.y);
          if (d < bestDist) {
            bestDist = d;
            bestPlat = p;
          }
        }

        if (bestPlat) {
          dx = Math.sign(bestPlat.x - bot.x);
          // If falling below platform and grounded, jump!
          if (bot.isGrounded) dy = -1;
        }
      }
    }

    // 2. PAINT WAR BOT LOGIC (Guerra de Pintura)
    else if (mode === 'paint-war' && paintCells) {
      // Find rivals from other team to slap and trigger mega paint explosions
      const enemies = allPlayers.filter(p => p.id !== bot.id && p.team !== bot.team && p.isAlive);
      let closestEnemy: PlayerState | null = null;
      let closestDist = Infinity;

      for (const e of enemies) {
        const d = Math.hypot(e.x - bot.x, e.y - bot.y);
        if (d < closestDist) {
          closestDist = d;
          closestEnemy = e;
        }
      }

      if (closestEnemy && closestDist < 85) {
        dx = Math.sign(closestEnemy.x - bot.x);
        dy = Math.sign(closestEnemy.y - bot.y);
        slap = true;
      } else {
        // Find nearest cell belonging to enemy team to re-paint
        const enemyCells = paintCells.filter(c => c.team !== bot.team);
        if (enemyCells.length > 0) {
          const targetCell = enemyCells[Math.floor((Date.now() * 0.001 + bot.id) % enemyCells.length)];
          const cellCenterX = targetCell.x + targetCell.width / 2;
          const cellCenterY = targetCell.y + targetCell.height / 2;
          dx = Math.sign(cellCenterX - bot.x);
          dy = Math.sign(cellCenterY - bot.y);
        }
      }
    }

    // 3. CAKE DEFENSE BOT LOGIC (Defensa del Pastel en Equipo)
    else if (mode === 'cake-defense' && gremlins) {
      // Hunt down the closest gremlin to the cake (or closest to bot)
      const cakeX = 480;
      const cakeY = 297;
      let urgentGremlin: CakeGremlin | null = null;
      let minGremlinCakeDist = Infinity;

      for (const g of gremlins) {
        if (g.hp > 0) {
          const dToCake = Math.hypot(g.x - cakeX, g.y - cakeY);
          if (dToCake < minGremlinCakeDist) {
            minGremlinCakeDist = dToCake;
            urgentGremlin = g;
          }
        }
      }

      if (urgentGremlin) {
        dx = Math.sign(urgentGremlin.x - bot.x);
        dy = Math.sign(urgentGremlin.y - bot.y);
        if (Math.hypot(urgentGremlin.x - bot.x, urgentGremlin.y - bot.y) < 65) {
          slap = true;
        }
      }
    }

    // 4. CANDY SIEGE / DONUT TUG BOT LOGIC
    else if ((mode === 'candy-siege' || mode === 'donut-tug') && donut) {
      // Push the massive donut/object towards opponent's side
      const targetSide = bot.team === 'red' ? 800 : 160;
      dx = Math.sign(donut.x - bot.x);
      dy = Math.sign(donut.y - bot.y);
      if (Math.hypot(donut.x - bot.x, donut.y - bot.y) < 60) {
        slap = true;
      }
    }

    // Standard Modes (Hot Bomb, Soccer, Coins, Whisk, etc.)
    else if (mode === 'hot-bomb') {
      if (bot.hasBomb) {
        let closestDist = Infinity;
        let target: PlayerState | null = null;
        for (const p of allPlayers) {
          if (p.id !== bot.id && p.isAlive) {
            const d = Math.hypot(p.x - bot.x, p.y - bot.y);
            if (d < closestDist) {
              closestDist = d;
              target = p;
            }
          }
        }
        if (target) {
          dx = Math.sign(target.x - bot.x);
          dy = Math.sign(target.y - bot.y);
          if (closestDist < 75) slap = true;
        }
      } else {
        const bombHolder = allPlayers.find(p => p.hasBomb && p.isAlive);
        if (bombHolder) {
          const distToBomb = Math.hypot(bombHolder.x - bot.x, bombHolder.y - bot.y);
          if (distToBomb < 240) {
            dx = -Math.sign(bombHolder.x - bot.x);
            dy = -Math.sign(bombHolder.y - bot.y);
            if (distToBomb < 70) slap = true;
          }
        }
      }
    } else if (mode === 'jelly-soccer' && ball) {
      dx = Math.sign(ball.x - bot.x);
      dy = Math.sign(ball.y - bot.y);
      if (Math.hypot(ball.x - bot.x, ball.y - bot.y) < 60) slap = true;
    } else if (mode === 'coin-frenzy' && coins) {
      let closestCoin: CoinItem | null = null;
      let closestDist = Infinity;
      for (const c of coins) {
        if (!c.collected) {
          const d = Math.hypot(c.x - bot.x, c.y - bot.y);
          if (d < closestDist) {
            closestDist = d;
            closestCoin = c;
          }
        }
      }
      if (closestCoin) {
        dx = Math.sign(closestCoin.x - bot.x);
        dy = Math.sign(closestCoin.y - bot.y);
      }
    } else if (mode === 'whisk-dodge' && hazards) {
      const cx = 480;
      const cy = 270;
      const distFromCenter = Math.hypot(bot.x - cx, bot.y - cy);
      if (distFromCenter < 120) {
        dx = Math.sign(bot.x - cx);
        dy = Math.sign(bot.y - cy);
      } else {
        dx = -Math.sign(bot.y - cy);
        dy = Math.sign(bot.x - cx);
      }
    } else if (mode === 'target-bullseye') {
      dx = Math.sign(480 - bot.x);
      dy = Math.sign(350 - bot.y);
    } else if (mode === 'conveyor-dash') {
      // Run rightwards to counter conveyor belt pull, keeping around x = 580..680
      if (bot.x < 640) {
        dx = 1;
      } else if (bot.x > 740) {
        dx = 0;
      } else {
        dx = 0.65;
      }

      // Detect approaching conveyor posts and jump over them!
      if (hazards) {
        for (const h of hazards) {
          if (h.type === 'conveyor-post') {
            const distAhead = h.x - bot.x;
            if (distAhead > -12 && distAhead < 135 && bot.isGrounded) {
              dy = -1; // Jump over the post!
              dx = 1;
              break;
            }
          }
        }
      }
    } else if (mode === 'donut-heist') {
      const donutCarrier = allPlayers.find(p => p.hasDonut && p.isAlive);
      if (bot.hasDonut) {
        let closestDist = Infinity;
        let pursuer: PlayerState | null = null;
        for (const p of allPlayers) {
          if (p.id !== bot.id && p.isAlive) {
            const d = Math.hypot(p.x - bot.x, p.y - bot.y);
            if (d < closestDist) {
              closestDist = d;
              pursuer = p;
            }
          }
        }
        if (pursuer && closestDist < 180) {
          dx = -Math.sign(pursuer.x - bot.x);
          if (bot.isGrounded && Math.random() < 0.3) dy = -1;
        }
      } else if (donutCarrier) {
        dx = Math.sign(donutCarrier.x - bot.x);
        if (Math.abs(donutCarrier.x - bot.x) < 70 && bot.slapCooldown <= 0) slap = true;
        if (bot.isGrounded && donutCarrier.y < bot.y - 40) dy = -1;
      } else if (donut) {
        dx = Math.sign(donut.x - bot.x);
        if (bot.isGrounded && donut.y < bot.y - 40) dy = -1;
      }
    } else if (mode === 'jelly-king') {
      const crownCarrier = allPlayers.find(p => p.hasCrown && p.isAlive);
      if (bot.hasCrown) {
        dx = (480 - bot.x) * 0.005;
        dy = (320 - bot.y) * 0.005;
      } else if (crownCarrier) {
        dx = Math.sign(crownCarrier.x - bot.x);
        dy = Math.sign(crownCarrier.y - bot.y);
        if (Math.hypot(crownCarrier.x - bot.x, crownCarrier.y - bot.y) < 70) slap = true;
      } else if (crown) {
        dx = Math.sign(crown.x - bot.x);
        dy = Math.sign(crown.y - bot.y);
      }
    } else if (mode === 'hex-crumble' && hexTiles) {
      let bestTile: HexTile | null = null;
      let bestDist = Infinity;
      for (const tile of hexTiles) {
        if (tile.state === 'stable') {
          const d = Math.hypot(tile.x - bot.x, tile.y - bot.y);
          if (d < bestDist) {
            bestDist = d;
            bestTile = tile;
          }
        }
      }
      if (bestTile) {
        dx = Math.sign(bestTile.x - bot.x);
        if (bot.isGrounded && (Math.abs(bestTile.x - bot.x) > 30 || bestTile.y < bot.y - 10)) {
          dy = -1;
        }
      }
    }

    if (Math.random() < 0.05) {
      dx += (Math.random() - 0.5) * 1.5;
    }

    return {
      dx: Math.max(-1, Math.min(1, dx)),
      dy: Math.max(-1, Math.min(1, dy)),
      slap,
    };
  }
}
