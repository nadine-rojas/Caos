/**
 * Types and interfaces for ¡Caos Gelatina! (Expanded with Team Action & Paint War)
 */

export type GameModeId =
  | 'hot-bomb'
  | 'hex-crumble'
  | 'donut-heist'
  | 'jelly-king'
  | 'whisk-dodge'
  | 'meteor-shower'
  | 'honey-lava'
  | 'jelly-soccer'
  | 'conveyor-dash'
  | 'target-bullseye'
  | 'egg-splat'
  | 'coin-frenzy'
  | 'paint-war'
  | 'cake-defense'
  | 'candy-siege'
  | 'donut-tug';

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'ROUND_OVER' | 'TOURNAMENT_OVER';

export interface PlayerConfig {
  id: number;
  name: string;
  color: string;
  accentColor: string;
  isBot: boolean;
  hat: 'crown' | 'propeller' | 'chef' | 'bandana' | 'ninja';
  team?: 'red' | 'blue';
}

export interface PlayerState {
  id: number;
  name: string;
  color: string;
  accentColor: string;
  isBot: boolean;
  hat: string;
  team: 'red' | 'blue';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  isGrounded: boolean;
  facing: 1 | -1;
  hasBomb: boolean;
  hasCrown: boolean;
  hasDonut: boolean;
  score: number;
  isAlive: boolean;
  stunTimer: number;
  slapCooldown: number;
  isSlapping: boolean;
  invulnerableTimer: number;
  eyeOffset: { x: number; y: number };
  blinkTimer: number;
  isBlinking: boolean;
  pointsAccumulated: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'smoke' | 'star' | 'slime' | 'confetti' | 'paint';
  rotation?: number;
  rotSpeed?: number;
}

export interface HexTile {
  id: number;
  x: number;
  y: number;
  radius: number;
  state: 'stable' | 'warning' | 'cracking' | 'fallen';
  steppedTimer: number;
  respawnTimer: number;
  wobbleOffset: number;
}

export interface PaintCell {
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  team: 'red' | 'blue' | null;
  color: string;
}

export interface CakeGremlin {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  team: 'red' | 'blue';
  color: string;
  life: number;
}

export interface Hazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: 'rolling-pin' | 'cream-geyser' | 'spring-pad' | 'whisk-blade' | 'meteor' | 'honey-wave' | 'conveyor-post';
  active: boolean;
  warningTimer?: number;
  cycleTimer?: number;
  rotation?: number;
  rotSpeed?: number;
  targetX?: number;
  targetY?: number;
}

export interface DonutItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  carrierId: number | null;
  radius: number;
  bouncePhase: number;
}

export interface CrownItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  carrierId: number | null;
  radius: number;
  floatOffset: number;
}

export interface BallItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
}

export interface CoinItem {
  id: number;
  x: number;
  y: number;
  radius: number;
  value: number;
  collected: boolean;
  floatPhase: number;
}

export interface PlatformItem {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx?: number;
  color?: string;
}

export interface TargetZone {
  x: number;
  y: number;
  radius: number;
  points: number;
  color: string;
  label: string;
}

export interface PhysicsParams {
  gravity: number;
  friction: number;
  bounciness: number;
  slapForce: number;
  squashDamping: number;
  moveSpeed: number;
}
