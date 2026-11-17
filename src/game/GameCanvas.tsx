/**
 * GameCanvas: 60fps isolated canvas host supporting 16 minigames,
 * with Paint War, Cake Defense Co-op, Honey Lava smart bots, and Team Modes.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameModeId,
  PlayerConfig,
  PlayerState,
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
  PhysicsParams,
} from '../types/game';
import { GamePhysicsWorld } from './physics';
import { GameRenderer } from './GameRenderer';
import {
  MINIGAMES,
  createHexGrid,
  updateHexTiles,
  createRollingPins,
  createGeysers,
  createWhiskHazards,
  createHoneyPlatforms,
  createTargetZones,
  spawnCoins,
  createSoccerBall,
  createPaintGrid,
  spawnCakeGremlins,
} from './minigames';
import { soundEngine } from '../audio/soundEngine';
import { Volume2, VolumeX, Pause, Play, Trophy, RotateCcw, BookOpen, Shield } from 'lucide-react';

interface GameCanvasProps {
  mode: GameModeId;
  playerConfigs: PlayerConfig[];
  onOpenGDD: () => void;
  onExitToTitle: () => void;
  customPhysics?: PhysicsParams;
  isTournament?: boolean;
  onTournamentFinished?: (winner: PlayerState) => void;
}

const ALL_MODES: GameModeId[] = [
  'paint-war',
  'cake-defense',
  'honey-lava',
  'hot-bomb',
  'hex-crumble',
  'donut-heist',
  'jelly-king',
  'jelly-soccer',
  'whisk-dodge',
  'meteor-shower',
  'conveyor-dash',
  'target-bullseye',
  'egg-splat',
  'coin-frenzy',
  'candy-siege',
  'donut-tug',
];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  playerConfigs,
  onOpenGDD,
  onExitToTitle,
  customPhysics,
  isTournament = false,
  onTournamentFinished,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [roundWinner, setRoundWinner] = useState<PlayerState | null>(null);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [hudScores, setHudScores] = useState<
    { id: number; name: string; score: number; color: string; accentColor: string; isAlive: boolean; team: 'red' | 'blue' }[]
  >([]);
  const [roundSecondsLeft, setRoundSecondsLeft] = useState(MINIGAMES[mode].duration);
  const [teamScorePercentages, setTeamScorePercentages] = useState<{ red: number; blue: number }>({ red: 50, blue: 50 });
  const [cakeHealthState, setCakeHealthState] = useState<number>(100);

  const physicsWorldRef = useRef<GamePhysicsWorld>(new GamePhysicsWorld());
  const playersRef = useRef<PlayerState[]>([]);
  const keysDownRef = useRef<Record<string, boolean>>({});
  const keysJustPressedRef = useRef<Record<string, boolean>>({});
  const hexTilesRef = useRef<HexTile[]>([]);
  const hazardsRef = useRef<Hazard[]>([]);
  const platformsRef = useRef<PlatformItem[]>([]);
  const targetZonesRef = useRef<TargetZone[]>([]);
  const donutRef = useRef<DonutItem | null>(null);
  const crownRef = useRef<CrownItem | null>(null);
  const ballRef = useRef<BallItem | null>(null);
  const coinsRef = useRef<CoinItem[]>([]);
  const paintCellsRef = useRef<PaintCell[]>([]);
  const gremlinsRef = useRef<CakeGremlin[]>([]);
  const cakeHealthRef = useRef<number>(100);
  const honeyLevelRef = useRef<number>(500);

  const bombTimerRef = useRef<number>(14.0);
  const roundTimerRef = useRef<number>(MINIGAMES[mode].duration);
  const isRunningRef = useRef<boolean>(true);
  const isPausedRef = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const currentModeRef = useRef<GameModeId>(mode);

  useEffect(() => {
    if (customPhysics) {
      physicsWorldRef.current.params = { ...customPhysics };
    }
  }, [customPhysics]);

  const initRound = useCallback(
    (targetMode: GameModeId) => {
      currentModeRef.current = targetMode;
      const width = 960;
      const height = 540;

      hexTilesRef.current = targetMode === 'hex-crumble' ? createHexGrid(width, height) : [];
      platformsRef.current = targetMode === 'honey-lava' ? createHoneyPlatforms(width, height) : [];
      targetZonesRef.current = targetMode === 'target-bullseye' ? createTargetZones(width, height) : [];
      coinsRef.current = targetMode === 'coin-frenzy' ? spawnCoins(width, height, 14) : [];
      ballRef.current = targetMode === 'jelly-soccer' ? createSoccerBall(width, height) : null;
      paintCellsRef.current = targetMode === 'paint-war' ? createPaintGrid(width, height) : [];
      gremlinsRef.current = targetMode === 'cake-defense' ? spawnCakeGremlins(width, height, 7) : [];
      cakeHealthRef.current = 100;
      setCakeHealthState(100);
      honeyLevelRef.current = height - 35; // Start just below bottom platforms

      if (targetMode === 'donut-heist' || targetMode === 'donut-tug') {
        hazardsRef.current = targetMode === 'donut-heist' ? createRollingPins(width, height) : [];
        donutRef.current = {
          x: width * 0.5,
          y: height * 0.55,
          vx: 0,
          vy: 0,
          carrierId: null,
          radius: targetMode === 'donut-tug' ? 32 : 22,
          bouncePhase: 0,
        };
      } else {
        donutRef.current = null;
      }

      if (targetMode === 'jelly-king') {
        hazardsRef.current = createGeysers(width, height);
        crownRef.current = {
          x: width * 0.5,
          y: height * 0.52,
          vx: 0,
          vy: 0,
          carrierId: null,
          radius: 20,
          floatOffset: 0,
        };
      } else {
        crownRef.current = null;
      }

      if (targetMode === 'whisk-dodge') {
        hazardsRef.current = createWhiskHazards(width, height);
      } else if (targetMode === 'conveyor-dash') {
        // Start with an initial post approaching from the right side of the belt
        const beltFloorY = height - 95;
        const postH = 60;
        hazardsRef.current = [
          {
            id: 'post-initial',
            type: 'conveyor-post',
            x: width - 110,
            y: beltFloorY - postH / 2,
            vx: -140,
            vy: 0,
            width: 22,
            height: postH,
            active: true,
          },
        ];
      } else if (targetMode !== 'donut-heist' && targetMode !== 'jelly-king') {
        hazardsRef.current = [];
      }

      const initialPlayers: PlayerState[] = playerConfigs.map((cfg, idx) => {
        const teamAssigned = cfg.team || (idx % 2 === 0 ? 'red' : 'blue');
        let spawnX = (width / (playerConfigs.length + 1)) * (idx + 1);
        let spawnY = height * 0.55;

        if (targetMode === 'honey-lava') {
          // Distribute players on safe platforms
          const initialPlats = platformsRef.current;
          const assignedPlat = initialPlats[idx % initialPlats.length];
          spawnX = assignedPlat ? assignedPlat.x : width * 0.5;
          spawnY = assignedPlat ? assignedPlat.y - 30 : height * 0.4;
        } else if (targetMode === 'conveyor-dash') {
          // Spawn players on the conveyor belt facing right (against the belt flow)
          spawnX = 430 + idx * 95;
          spawnY = height - 130;
        } else if (targetMode === 'hex-crumble') {
          spawnY = height * 0.35;
        } else if (targetMode === 'paint-war') {
          spawnX = teamAssigned === 'red' ? width * 0.25 : width * 0.75;
          spawnY = height * 0.55;
        }

        return {
          id: cfg.id,
          name: cfg.name,
          color: cfg.color,
          accentColor: cfg.accentColor,
          isBot: cfg.isBot,
          hat: cfg.hat,
          team: teamAssigned,
          x: spawnX,
          y: spawnY,
          vx: 0,
          vy: 0,
          radius: 24,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          isGrounded: false,
          facing: targetMode === 'conveyor-dash' ? 1 : teamAssigned === 'red' ? 1 : -1,
          hasBomb: targetMode === 'hot-bomb' && idx === 0,
          hasCrown: false,
          hasDonut: false,
          score: 0,
          isAlive: true,
          stunTimer: 0,
          slapCooldown: 0,
          isSlapping: false,
          invulnerableTimer: 0.5,
          eyeOffset: { x: 0, y: 0 },
          blinkTimer: 1.5 + idx * 0.4,
          isBlinking: false,
          pointsAccumulated: 0,
        };
      });

      playersRef.current = initialPlayers;
      bombTimerRef.current = 14.0;
      roundTimerRef.current = MINIGAMES[targetMode].duration;
      physicsWorldRef.current.particles = [];
      physicsWorldRef.current.screenShake = 0;
      physicsWorldRef.current.hitstopTimer = 0;
      setRoundWinner(null);
      setRoundSecondsLeft(MINIGAMES[targetMode].duration);

      setHudScores(
        initialPlayers.map(p => ({
          id: p.id,
          name: p.name,
          score: 0,
          color: p.color,
          accentColor: p.accentColor,
          isAlive: true,
          team: p.team,
        }))
      );
    },
    [playerConfigs]
  );

  useEffect(() => {
    soundEngine.startBgm();
    return () => {
      soundEngine.stopBgm();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        setIsPaused(prev => {
          const next = !prev;
          isPausedRef.current = next;
          return next;
        });
        return;
      }

      if (!keysDownRef.current[e.code]) {
        keysJustPressedRef.current[e.code] = true;
      }
      keysDownRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
      keysJustPressedRef.current[e.code] = false;
    };

    const handleBlur = () => {
      keysDownRef.current = {};
      keysJustPressedRef.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // 60fps Game Loop
  useEffect(() => {
    initRound(mode);
    isRunningRef.current = true;
    lastTimeRef.current = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let hudSyncTimer = 0;
    let meteorTimer = 0;
    let gremlinSpawnTimer = 0;
    let postSpawnTimer = 0;

    const gameLoop = (currentTime: number) => {
      if (!isRunningRef.current) return;

      const rawDt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      const dt = Math.min(rawDt, 0.05);

      if (!isPausedRef.current) {
        const arenaWidth = canvas.width;
        const arenaHeight = canvas.height;
        const world = physicsWorldRef.current;
        const players = playersRef.current;
        const activeMode = currentModeRef.current;

        // Calculate accelerating conveyor speed for 'conveyor-dash'
        const elapsedRoundTime = Math.max(0, MINIGAMES[activeMode].duration - roundTimerRef.current);
        const conveyorSpeed = activeMode === 'conveyor-dash' ? 140 + elapsedRoundTime * 8.2 : 140;

        const inHitstop = world.updateEffects(dt);
        world.updateParticles(dt);

        if (!inHitstop) {
          roundTimerRef.current -= dt;
          hudSyncTimer += dt;

          if (hudSyncTimer > 0.25) {
            hudSyncTimer = 0;
            setRoundSecondsLeft(Math.max(0, Math.ceil(roundTimerRef.current)));
            setHudScores(
              players.map(p => ({
                id: p.id,
                name: p.name,
                score: p.score,
                color: p.color,
                accentColor: p.accentColor,
                isAlive: p.isAlive,
                team: p.team,
              }))
            );

            // Paint War turf percentage calculation
            if (activeMode === 'paint-war' && paintCellsRef.current.length > 0) {
              const total = paintCellsRef.current.length;
              const redCount = paintCellsRef.current.filter(c => c.team === 'red').length;
              const redPct = Math.round((redCount / total) * 100);
              const bluePct = 100 - redPct;
              setTeamScorePercentages({ red: redPct, blue: bluePct });
            }
          }

          // 1. HONEY LAVA RISING TIDE (Slow sinusoidal rise & fall)
          if (activeMode === 'honey-lava') {
            const baseLevel = arenaHeight - 45;
            const waveHeight = 90;
            honeyLevelRef.current = baseLevel - (Math.sin(Date.now() * 0.0012) + 1) * (waveHeight * 0.5);
          }

          // 2. CONVEYOR DASH: ACCELERATING BELT & JUMPING POST HURDLES
          else if (activeMode === 'conveyor-dash') {
            const beltFloorY = arenaHeight - 95;
            postSpawnTimer += dt;
            // Spawn interval shrinks as conveyor speed increases!
            const spawnInterval = Math.max(0.75, 2.05 - (conveyorSpeed - 140) / 190);
            if (postSpawnTimer >= spawnInterval) {
              postSpawnTimer = 0;
              const postH = 54 + Math.random() * 28;
              hazardsRef.current.push({
                id: `post-${Date.now()}-${Math.random()}`,
                type: 'conveyor-post',
                x: arenaWidth - 78,
                y: beltFloorY - postH / 2,
                vx: -conveyorSpeed,
                vy: 0,
                width: 22,
                height: postH,
                active: true,
              });
            }

            // Move posts along the belt & check player hurdle collisions
            for (let i = hazardsRef.current.length - 1; i >= 0; i--) {
              const h = hazardsRef.current[i];
              h.vx = -conveyorSpeed;
              h.x -= conveyorSpeed * dt;

              // Remove post once it drops off the left edge of the conveyor belt
              if (h.x < 120) {
                world.spawnBurst(h.x, beltFloorY - 15, '#fbbf24', 5, 'star');
                hazardsRef.current.splice(i, 1);
                continue;
              }

              const postTop = h.y - h.height / 2;
              const postHalfW = h.width / 2;

              for (const p of players) {
                if (!p.isAlive) continue;
                const horizOverlap = Math.abs(p.x - h.x) < p.radius * 0.8 + postHalfW;
                const vertOverlap = p.y + p.radius * 0.85 > postTop + 6 && p.y - p.radius < beltFloorY;
                if (horizOverlap && vertOverlap) {
                  // Player didn't jump high enough over the post -> swept left toward the cliff!
                  p.x = h.x - postHalfW - p.radius * 0.82;
                  p.vx = Math.min(p.vx, -conveyorSpeed * 1.15);
                  p.scaleX = 0.72;
                  p.scaleY = 1.28;
                  if (Math.random() < 0.25) {
                    soundEngine.playBoing(0.85);
                    world.spawnBurst(p.x + p.radius, p.y, '#ef4444', 4, 'star');
                  }
                }
              }
            }

            // Award survival points while staying on the belt
            for (const p of players) {
              if (!p.isAlive) continue;
              p.pointsAccumulated += dt;
              if (p.pointsAccumulated >= 1.0) {
                p.pointsAccumulated -= 1.0;
                p.score += 1;
              }
            }
          }

          // 3. PAINT WAR MOVEMENT PAINTING
          else if (activeMode === 'paint-war') {
            for (const p of players) {
              if (!p.isAlive) continue;
              for (const cell of paintCellsRef.current) {
                if (
                  p.x >= cell.x &&
                  p.x <= cell.x + cell.width &&
                  p.y >= cell.y &&
                  p.y <= cell.y + cell.height
                ) {
                  if (cell.team !== p.team) {
                    cell.team = p.team;
                    cell.color = p.team === 'red' ? '#e11d48' : '#2563eb';
                    p.score += 1;
                    if (Math.random() < 0.2) {
                      world.spawnBurst(p.x, p.y + p.radius, cell.color, 2, 'paint');
                    }
                  }
                }
              }
            }
          }

          // 4. CAKE DEFENSE CO-OP
          else if (activeMode === 'cake-defense') {
            const cakeX = arenaWidth * 0.5;
            const cakeY = arenaHeight * 0.55;

            gremlinSpawnTimer += dt;
            if (gremlinSpawnTimer > 3.0 && gremlinsRef.current.length < 12) {
              gremlinSpawnTimer = 0;
              const more = spawnCakeGremlins(arenaWidth, arenaHeight, 3);
              gremlinsRef.current.push(...more);
            }

            for (let i = gremlinsRef.current.length - 1; i >= 0; i--) {
              const g = gremlinsRef.current[i];
              if (g.hp <= 0) {
                gremlinsRef.current.splice(i, 1);
                continue;
              }

              // Move towards cake
              const dx = cakeX - g.x;
              const dy = cakeY - g.y;
              const dist = Math.hypot(dx, dy);
              const speed = 75;

              g.vx = (dx / dist) * speed;
              g.vy = (dy / dist) * speed;
              g.x += g.vx * dt;
              g.y += g.vy * dt;

              // Check bite on cake
              if (dist < 45) {
                cakeHealthRef.current = Math.max(0, cakeHealthRef.current - 4 * dt);
                setCakeHealthState(cakeHealthRef.current);
                if (Math.random() < 0.1) {
                  soundEngine.playBoing(0.7);
                  world.spawnBurst(cakeX, cakeY, '#db2777', 4, 'star');
                }
              }

              // Check player slap or collision with gremlin
              for (const p of players) {
                if (!p.isAlive) continue;
                const pDist = Math.hypot(p.x - g.x, p.y - g.y);
                if (pDist < p.radius + g.radius + (p.isSlapping ? 25 : 0)) {
                  g.hp -= p.isSlapping ? 2 : 1;
                  g.x += p.facing * 90;
                  p.score += 10;
                  soundEngine.playSlap();
                  world.triggerHitstop(0.05, 8);
                  world.spawnBurst(g.x, g.y, g.color, 12, 'star');

                  if (g.hp <= 0) {
                    p.score += 25;
                    soundEngine.playPickup();
                    world.spawnBurst(g.x, g.y, '#fef08a', 18, 'confetti');
                  }
                  break;
                }
              }
            }
          }

          // 5. DONUT TUG OF WAR
          else if (activeMode === 'donut-tug' && donutRef.current) {
            const d = donutRef.current;
            d.vx *= Math.pow(0.92, dt * 60);
            d.vy *= Math.pow(0.92, dt * 60);
            d.x += d.vx * dt;
            d.y += d.vy * dt;

            // Goal detection
            if (d.x < 180) {
              // Blue pushes into Red zone -> Blue scores!
              players.filter(p => p.team === 'blue').forEach(p => (p.score += 5));
              soundEngine.playVictoryFanfare();
              world.spawnBurst(d.x, d.y, '#3b82f6', 25, 'confetti');
              d.x = arenaWidth * 0.5;
              d.vx = 0;
            } else if (d.x > arenaWidth - 180) {
              // Red pushes into Blue zone -> Red scores!
              players.filter(p => p.team === 'red').forEach(p => (p.score += 5));
              soundEngine.playVictoryFanfare();
              world.spawnBurst(d.x, d.y, '#f43f5e', 25, 'confetti');
              d.x = arenaWidth * 0.5;
              d.vx = 0;
            }

            for (const p of players) {
              if (!p.isAlive) continue;
              const pDist = Math.hypot(p.x - d.x, p.y - d.y);
              if (pDist < p.radius + d.radius) {
                const pushForce = p.isSlapping ? 450 : 220;
                d.vx += p.facing * pushForce * dt;
                d.bouncePhase += dt * 8;
                if (p.isSlapping) soundEngine.playSlap();
              }
            }
          }

          // 6. HOT BOMB
          else if (activeMode === 'hot-bomb') {
            bombTimerRef.current -= dt;
            if (Math.random() < 0.05 + (1 - bombTimerRef.current / 15) * 0.15) {
              soundEngine.playBombTick(1 - bombTimerRef.current / 15);
            }
            if (bombTimerRef.current <= 0) {
              const bombHolder = players.find(p => p.hasBomb && p.isAlive);
              if (bombHolder) {
                bombHolder.isAlive = false;
                soundEngine.playExplosion();
                world.spawnBurst(bombHolder.x, bombHolder.y, '#ef4444', 24, 'slime');
                world.triggerHitstop(0.09, 16);
              }
              const alive = players.filter(p => p.isAlive);
              if (alive.length > 1) {
                const next = alive[Math.floor(Math.random() * alive.length)];
                next.hasBomb = true;
                bombTimerRef.current = 10.0;
              }
            }
          }

          // 7. HEX CRUMBLE
          else if (activeMode === 'hex-crumble') {
            updateHexTiles(hexTilesRef.current, dt);
          }

          // 8. JELLY SOCCER
          else if (activeMode === 'jelly-soccer' && ballRef.current) {
            const goal = world.updateSoccerBall(ballRef.current, players, dt, arenaWidth, arenaHeight);
            if (goal) {
              soundEngine.playVictoryFanfare();
              world.triggerHitstop(0.12, 18);
              world.spawnBurst(ballRef.current.x, ballRef.current.y, '#f43f5e', 30, 'confetti');

              if (goal === 'p1_goal') {
                players.filter(p => p.team === 'red').forEach(p => (p.score += 1));
              } else if (goal === 'p2_goal') {
                players.filter(p => p.team === 'blue').forEach(p => (p.score += 1));
              }
              ballRef.current.x = arenaWidth * 0.5;
              ballRef.current.y = arenaHeight * 0.55;
              ballRef.current.vx = 0;
              ballRef.current.vy = 0;
            }
          }

          // 9. WHISK DODGE
          else if (activeMode === 'whisk-dodge') {
            for (const h of hazardsRef.current) {
              const currentRot = (h.rotation || 0) + (h.rotSpeed || 3) * dt;
              h.rotation = currentRot;
              const bladeRadius = h.width * 0.5;
              for (const p of players) {
                if (!p.isAlive) continue;
                const d = Math.hypot(p.x - h.x, p.y - h.y);
                if (d < p.radius + bladeRadius * 0.65) {
                  p.vx += Math.cos(currentRot) * 520;
                  p.vy += Math.sin(currentRot) * 520;
                  soundEngine.playSlap();
                  world.spawnBurst(p.x, p.y, '#f43f5e', 8, 'star');
                }
              }
            }
          }

          // 10. METEOR SHOWER & CANDY SIEGE
          else if (activeMode === 'meteor-shower' || activeMode === 'candy-siege') {
            meteorTimer += dt;
            if (meteorTimer > 0.85) {
              meteorTimer = 0;
              hazardsRef.current.push({
                id: `meteor-${Date.now()}-${Math.random()}`,
                type: 'meteor',
                x: 160 + Math.random() * (arenaWidth - 320),
                y: 120 + Math.random() * (arenaHeight - 220),
                vx: 0,
                vy: 0,
                width: 88,
                height: 88,
                active: true,
                warningTimer: 1.3,
              });
            }
            for (let i = hazardsRef.current.length - 1; i >= 0; i--) {
              const h = hazardsRef.current[i];
              if (h.warningTimer !== undefined) {
                h.warningTimer -= dt;
                if (h.warningTimer <= 0) {
                  soundEngine.playExplosion();
                  world.spawnBurst(h.x, h.y, '#f97316', 18, 'star');
                  const blastRadius = h.width * 0.5;
                  for (const p of players) {
                    if (!p.isAlive) continue;
                    const d = Math.hypot(p.x - h.x, p.y - h.y);
                    if (d < blastRadius + p.radius) {
                      if (activeMode === 'meteor-shower') {
                        p.isAlive = false;
                      } else {
                        const angle = Math.atan2(p.y - h.y, p.x - h.x);
                        p.vx += Math.cos(angle) * 620;
                        p.vy += Math.sin(angle) * 620;
                      }
                    }
                  }
                  hazardsRef.current.splice(i, 1);
                }
              }
            }
            if (activeMode === 'candy-siege') {
              for (const p of players) {
                if (!p.isAlive) continue;
                p.pointsAccumulated += dt;
                if (p.pointsAccumulated >= 1.2) {
                  p.pointsAccumulated -= 1.2;
                  p.score += 1;
                }
              }
            }
          }

          // 11. COIN FRENZY
          else if (activeMode === 'coin-frenzy') {
            for (const c of coinsRef.current) {
              if (c.collected) continue;
              for (const p of players) {
                if (!p.isAlive) continue;
                if (Math.hypot(p.x - c.x, p.y - c.y) < p.radius + c.radius) {
                  c.collected = true;
                  p.score += c.value;
                  soundEngine.playPickup();
                  world.spawnBurst(c.x, c.y, '#fbbf24', 8, 'confetti');
                }
              }
            }
            if (coinsRef.current.filter(c => !c.collected).length < 4) {
              coinsRef.current = spawnCoins(arenaWidth, arenaHeight, 12);
            }
          }

          // 12. TARGET BULLSEYE & EGG SPLAT
          else if (activeMode === 'target-bullseye' || activeMode === 'egg-splat') {
            const cx = arenaWidth * 0.5;
            const cy = arenaHeight * 0.55;
            for (const p of players) {
              if (!p.isAlive) continue;
              const d = Math.hypot(p.x - cx, p.y - cy);
              if (d < 150) {
                p.pointsAccumulated += dt * (d < 55 ? 2.5 : 1.2);
                if (p.pointsAccumulated >= 1.0) {
                  p.pointsAccumulated -= 1.0;
                  p.score += 1;
                }
              }
            }
          }

          // 13. DONUT HEIST & JELLY KING
          else if (activeMode === 'donut-heist' && donutRef.current) {
            const d = donutRef.current;
            d.bouncePhase += dt * 4;
            for (const p of players) {
              if (!p.isAlive) continue;
              if (d.carrierId === null && Math.hypot(p.x - d.x, p.y - d.y) < p.radius + d.radius) {
                d.carrierId = p.id;
                p.hasDonut = true;
                soundEngine.playPickup();
              }
              if (d.carrierId === p.id) {
                d.x = p.x;
                d.y = p.y - p.radius - 14;
                p.pointsAccumulated += dt;
                if (p.pointsAccumulated >= 1.0) {
                  p.pointsAccumulated -= 1.0;
                  p.score += 2;
                }
              }
            }
          } else if (activeMode === 'jelly-king' && crownRef.current) {
            const c = crownRef.current;
            c.floatOffset += dt * 4;
            for (const p of players) {
              if (!p.isAlive) continue;
              if (c.carrierId === null && Math.hypot(p.x - c.x, p.y - c.y) < p.radius + c.radius) {
                c.carrierId = p.id;
                p.hasCrown = true;
                soundEngine.playPickup();
              }
              if (c.carrierId === p.id) {
                c.x = p.x;
                c.y = p.y - p.radius - 16;
                p.pointsAccumulated += dt;
                if (p.pointsAccumulated >= 1.0) {
                  p.pointsAccumulated -= 1.0;
                  p.score += 2;
                }
              }
            }
          }

          // UPDATE ALL PLAYERS & SMART BOT INPUT
          players.forEach((p, idx) => {
            let input = { dx: 0, dy: 0, slap: false };

            if (!p.isBot) {
              if (idx === 0) {
                if (keysDownRef.current['KeyA']) input.dx -= 1;
                if (keysDownRef.current['KeyD']) input.dx += 1;
                if (keysDownRef.current['KeyW']) input.dy -= 1;
                if (keysDownRef.current['KeyS']) input.dy += 1;
                if (keysJustPressedRef.current['Space']) input.slap = true;
              } else if (idx === 1) {
                if (keysDownRef.current['ArrowLeft']) input.dx -= 1;
                if (keysDownRef.current['ArrowRight']) input.dx += 1;
                if (keysDownRef.current['ArrowUp']) input.dy -= 1;
                if (keysDownRef.current['ArrowDown']) input.dy += 1;
                if (keysJustPressedRef.current['Enter'] || keysJustPressedRef.current['Numpad0']) input.slap = true;
              } else if (idx === 2) {
                if (keysDownRef.current['KeyJ']) input.dx -= 1;
                if (keysDownRef.current['KeyL']) input.dx += 1;
                if (keysDownRef.current['KeyI']) input.dy -= 1;
                if (keysDownRef.current['KeyK']) input.dy += 1;
                if (keysJustPressedRef.current['KeyU'] || keysJustPressedRef.current['KeyO']) input.slap = true;
              }
            } else {
              // Smart Bot with Honey Lava, Conveyor Hurdles & Team modes wired!
              input = world.computeBotInput(
                p,
                players,
                activeMode,
                donutRef.current || undefined,
                crownRef.current || undefined,
                hexTilesRef.current,
                ballRef.current || undefined,
                coinsRef.current,
                hazardsRef.current,
                platformsRef.current,
                honeyLevelRef.current,
                gremlinsRef.current,
                paintCellsRef.current
              );
            }

            world.updatePlayer(
              p,
              dt,
              arenaWidth,
              arenaHeight,
              input,
              activeMode,
              hexTilesRef.current,
              platformsRef.current,
              honeyLevelRef.current,
              conveyorSpeed
            );
          });

          // Inter-player collisions & Paint burst
          for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
              world.resolvePlayerInteractions(
                players[i],
                players[j],
                activeMode,
                coinsRef.current,
                paintCellsRef.current
              );
            }
          }

          // ROUND WIN CONDITIONS
          const alivePlayers = players.filter(p => p.isAlive);
          let winner: PlayerState | null = null;

          const isSurvival = [
            'hot-bomb',
            'hex-crumble',
            'whisk-dodge',
            'meteor-shower',
            'honey-lava',
            'conveyor-dash',
          ].includes(activeMode);
          if (isSurvival) {
            if (alivePlayers.length <= 1 || roundTimerRef.current <= 0) {
              winner =
                alivePlayers.sort((a, b) => b.score - a.score)[0] ||
                [...players].sort((a, b) => b.score - a.score)[0];
            }
          } else if (activeMode === 'paint-war') {
            if (roundTimerRef.current <= 0) {
              const redScore = paintCellsRef.current.filter(c => c.team === 'red').length;
              const blueScore = paintCellsRef.current.filter(c => c.team === 'blue').length;
              const winningTeam = redScore >= blueScore ? 'red' : 'blue';
              winner = players.find(p => p.team === winningTeam && !p.isBot) || players.find(p => p.team === winningTeam) || players[0];
            }
          } else if (activeMode === 'cake-defense') {
            if (roundTimerRef.current <= 0 || cakeHealthRef.current <= 0) {
              winner = [...players].sort((a, b) => b.score - a.score)[0];
            }
          } else {
            const leader = [...players].sort((a, b) => b.score - a.score)[0];
            if (roundTimerRef.current <= 0 || (leader && leader.score >= 15)) {
              winner = leader;
            }
          }

          if (winner && !roundWinner) {
            setRoundWinner(winner);
            soundEngine.playVictoryFanfare();
            world.spawnBurst(arenaWidth * 0.5, arenaHeight * 0.4, winner.accentColor, 40, 'confetti');
            if (isTournament && onTournamentFinished) {
              onTournamentFinished(winner);
            }
          }
        }

        // RENDER FRAME
        GameRenderer.render(
          ctx,
          arenaWidth,
          arenaHeight,
          players,
          world.particles,
          activeMode,
          world.screenShake,
          hexTilesRef.current,
          hazardsRef.current,
          donutRef.current || undefined,
          crownRef.current || undefined,
          ballRef.current || undefined,
          coinsRef.current,
          platformsRef.current,
          targetZonesRef.current,
          honeyLevelRef.current,
          paintCellsRef.current,
          gremlinsRef.current,
          cakeHealthRef.current,
          bombTimerRef.current,
          roundTimerRef.current,
          conveyorSpeed
        );
      }

      keysJustPressedRef.current = {};
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunningRef.current = false;
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [mode, initRound, isTournament, onTournamentFinished]);

  const handleToggleSound = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
  };

  const handleNextRound = () => {
    const currentIdx = ALL_MODES.indexOf(currentModeRef.current);
    const nextMode = ALL_MODES[(currentIdx + 1) % ALL_MODES.length];
    initRound(nextMode);
  };

  const handleSelectSpecificGame = (newMode: GameModeId) => {
    initRound(newMode);
  };

  const minigameInfo = MINIGAMES[currentModeRef.current];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
    >
      <div className="relative w-full max-w-5xl aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full object-contain block" />

        {/* Perimeter Status Cluster (<15% playfield obstruction) */}
        <div className="absolute top-0 inset-x-0 p-3 pointer-events-none flex items-center justify-between z-10">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold text-white shadow"
              style={{ backgroundColor: minigameInfo.color }}
            >
              {minigameInfo.title}
            </span>
            {minigameInfo.isTeamGame && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600/80 text-white border border-indigo-400/40">
                EN EQUIPO
              </span>
            )}
            <span className="text-xs text-slate-400 hidden sm:inline">
              {minigameInfo.objective}
            </span>
          </div>

          {/* Center: Timer readout or Paint/Cake Team Meters */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {currentModeRef.current === 'paint-war' ? (
              <div className="bg-slate-950/85 border border-slate-700/80 rounded-lg px-3 py-1 flex items-center gap-2 text-xs">
                <span className="font-bold text-rose-400 font-mono tabular-nums">ROJO: {teamScorePercentages.red}%</span>
                <span className="text-slate-600">|</span>
                <span className="font-bold text-sky-400 font-mono tabular-nums">AZUL: {teamScorePercentages.blue}%</span>
              </div>
            ) : currentModeRef.current === 'cake-defense' ? (
              <div className="bg-slate-950/85 border border-pink-700/80 rounded-lg px-3 py-1 flex items-center gap-1.5 text-xs">
                <Shield size={14} className="text-pink-400" />
                <span className="font-bold text-pink-300 font-mono tabular-nums">PASTEL: {Math.round(cakeHealthState)}%</span>
              </div>
            ) : null}

            <div className="bg-slate-950/80 border border-slate-700/60 rounded-lg px-3 py-1 flex items-center gap-2 text-slate-200">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Tiempo</span>
              <span className="font-mono text-base font-bold tabular-nums text-amber-400">
                {roundSecondsLeft}s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleToggleSound}
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={onOpenGDD}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 rounded-lg text-xs font-medium text-indigo-300 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <BookOpen size={14} />
              <span>GDD & Modos</span>
            </button>
            <button
              onClick={() => {
                setIsPaused(p => !p);
                isPausedRef.current = !isPausedRef.current;
              }}
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
        </div>

        {/* Bottom Perimeter Player Score Strip */}
        <div className="absolute bottom-2 inset-x-3 pointer-events-none flex items-center justify-between z-10">
          <div className="flex items-center gap-2 pointer-events-auto">
            {hudScores.map(p => (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-opacity ${
                  p.isAlive
                    ? 'bg-slate-900/90 border-slate-700 shadow-md'
                    : 'bg-red-950/60 border-red-800/60 opacity-60'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accentColor }} />
                <span className="font-semibold text-slate-200">
                  {minigameInfo.isTeamGame ? (p.team === 'red' ? `[R] ${p.name}` : `[A] ${p.name}`) : p.name}
                </span>
                <span className="font-mono font-bold tabular-nums text-amber-300 ml-1">
                  {p.score} pts
                </span>
                {!p.isAlive && <span className="text-red-400 font-bold ml-1">K.O.</span>}
              </div>
            ))}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                keysJustPressedRef.current['Space'] = true;
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg shadow-lg transition-transform"
            >
              ¡Bofetada! (Espacio)
            </button>
          </div>
        </div>

        {/* Pause Modal */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-30 p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl">
              <h2 className="text-2xl font-display font-extrabold text-white mb-1">Juego en Pausa</h2>
              <p className="text-xs text-slate-400 mb-4">Elige una acción o cambia directamente de minijuego (16 disponibles):</p>

              <div className="mb-4 text-left">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Cambiar a otro minijuego:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {ALL_MODES.map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        handleSelectSpecificGame(m);
                        setIsPaused(false);
                        isPausedRef.current = false;
                      }}
                      className={`text-left px-2 py-1.5 rounded text-xs truncate transition-colors ${
                        currentModeRef.current === m
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {MINIGAMES[m].title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsPaused(false);
                    isPausedRef.current = false;
                  }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-colors"
                >
                  Continuar Partida
                </button>
                <button
                  onClick={onOpenGDD}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <BookOpen size={15} />
                  <span>Documento de Diseño (GDD)</span>
                </button>
                <button
                  onClick={() => initRound(currentModeRef.current)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Reiniciar Ronda</span>
                </button>
                <button
                  onClick={onExitToTitle}
                  className="w-full py-1.5 bg-slate-800/60 hover:bg-red-950/50 hover:text-red-300 text-slate-400 text-xs rounded-lg transition-colors"
                >
                  Salir al Menú Principal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Round Victory Modal */}
        {roundWinner && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center z-30 p-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl">
              <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 mb-2">
                <Trophy size={32} />
              </div>
              <h2 className="text-2xl font-display font-black text-white mb-1">
                {minigameInfo.isTeamGame
                  ? `¡El Equipo ${roundWinner.team === 'red' ? 'Rojo' : 'Azul'} Gana!`
                  : `¡${roundWinner.name} Gana la Ronda!`}
              </h2>
              <p className="text-xs text-slate-400 mb-4">{minigameInfo.title}</p>

              <div className="bg-slate-950/60 rounded-xl p-3 mb-5 border border-slate-800 space-y-1.5">
                {[...playersRef.current]
                  .sort((a, b) => b.score - a.score || (b.isAlive ? 1 : 0) - (a.isAlive ? 1 : 0))
                  .map((p, rank) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">#{rank + 1}</span>
                        <span style={{ color: p.accentColor }} className="font-bold">
                          {minigameInfo.isTeamGame ? `[${p.team.toUpperCase()}] ${p.name}` : p.name}
                        </span>
                      </div>
                      <span className="font-mono text-slate-300 font-bold">{p.score} pts</span>
                    </div>
                  ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleNextRound}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-colors"
                >
                  Siguiente Minijuego
                </button>
                <button
                  onClick={onExitToTitle}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-lg transition-colors"
                >
                  Menú
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl mt-2 px-3 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-medium">Controles:</span>
          <span>P1: WASD + Espacio</span>
          <span aria-hidden="true">·</span>
          <span>P2: Flechas + Enter</span>
          <span aria-hidden="true">·</span>
          <span>P3: IJKL + U</span>
          <span aria-hidden="true">·</span>
          <span>Esc Pausa</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-semibold">IA Bots Mejorada · Modos en Equipo & Guerra de Pintura</span>
        </div>
      </div>
    </div>
  );
};
