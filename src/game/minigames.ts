/**
 * Game Modes and Arena Hazard systems for ¡Caos Gelatina!
 * Expanded with Team Action, Paint War, and Co-op modes.
 */

import {
  GameModeId,
  HexTile,
  Hazard,
  PlatformItem,
  TargetZone,
  CoinItem,
  BallItem,
  PaintCell,
  CakeGremlin,
} from '../types/game';

export interface MinigameDefinition {
  id: GameModeId;
  title: string;
  subtitle: string;
  objective: string;
  twist: string;
  color: string;
  category: 'Supervivencia' | 'Puntos' | 'Deportes' | 'Habilidad' | 'En Equipo';
  isTeamGame?: boolean;
  duration: number; // in seconds
}

export const MINIGAMES: Record<GameModeId, MinigameDefinition> = {
  'hot-bomb': {
    id: 'hot-bomb',
    title: 'La Patata Explosiva',
    subtitle: 'Hot Caramel Bomb Blast',
    objective: '¡Golpea a otros jugadores para pasar la bomba antes de que se acabe la mecha!',
    twist: 'Giro: En los últimos 5 segundos, la arena emite vapor y todos se mueven +20% más rápido.',
    color: '#ef4444',
    category: 'Supervivencia',
    duration: 35,
  },
  'hex-crumble': {
    id: 'hex-crumble',
    title: 'Plataformas Quebradizas',
    subtitle: 'Hex-Drop Crumble Waffles',
    objective: '¡Mantén el equilibrio en las baldosas de gofre antes de que se desplomen al vacío!',
    twist: 'Giro: Pisadas consecutivas aceleran la caída y resortes laterales te catapultan.',
    color: '#f59e0b',
    category: 'Supervivencia',
    duration: 40,
  },
  'donut-heist': {
    id: 'donut-heist',
    title: 'Fiebre de Donas de Oro',
    subtitle: 'Golden Donut Robbery',
    objective: '¡Atrapa la rosquilla gigante dorada y consérvala para sumar puntos mientras esquivas rodillos!',
    twist: 'Giro: Quien lleva la dona pesa el doble pero puede usarla como escudo de choque.',
    color: '#ec4899',
    category: 'Puntos',
    duration: 40,
  },
  'jelly-king': {
    id: 'jelly-king',
    title: 'Rey de la Colina Gelatinosa',
    subtitle: 'Gelatin Summit Crown',
    objective: '¡Roba la corona dorada y mantente en la cima resbaladiza durante 15 segundos acumulados!',
    twist: 'Giro: Chorros de crema chantilly brotan del suelo lanzando a todos por los aires.',
    color: '#8b5cf6',
    category: 'Puntos',
    duration: 45,
  },
  'whisk-dodge': {
    id: 'whisk-dodge',
    title: 'Esquiva-Batidoras Letales',
    subtitle: 'Lethal Whisk & Blender',
    objective: '¡Sobrevive a las aspas giratorias de la batidora gigante que barren la pista circular!',
    twist: 'Giro: Las aspas cambian de sentido de rotación bruscamente cada 8 segundos.',
    color: '#06b6d4',
    category: 'Supervivencia',
    duration: 35,
  },
  'meteor-shower': {
    id: 'meteor-shower',
    title: 'Lluvia de Meteoros de Caramelo',
    subtitle: 'Molten Caramel Rain',
    objective: '¡Esquiva los meteoros de caramelo hirviente guiándote por sus sombras de impacto!',
    twist: 'Giro: Puedes bofetear a los rivales directamente hacia las zonas rojas de impacto.',
    color: '#ea580c',
    category: 'Supervivencia',
    duration: 35,
  },
  'honey-lava': {
    id: 'honey-lava',
    title: 'El Suelo es Miel Hirviente',
    subtitle: 'The Floor is Lava Honey',
    objective: '¡Salta entre galletas flotantes y nubes de azúcar para no quemarte con la marea de miel!',
    twist: 'Giro: El nivel de la miel sube por oleadas, sumergiendo las plataformas inferiores.',
    color: '#d97706',
    category: 'Supervivencia',
    duration: 40,
  },
  'jelly-soccer': {
    id: 'jelly-soccer',
    title: 'Fútbol Gelatinoso Supremo',
    subtitle: 'Giant Cherry Bouncy Soccer',
    objective: '¡Empuja y abofetea la pelota gigante de cereza para anotar goles en la portería rival!',
    twist: 'Giro: La pelota rebota con físicas hiper-elásticas y acelera en cada impacto.',
    color: '#10b981',
    category: 'Deportes',
    isTeamGame: true,
    duration: 45,
  },
  'conveyor-dash': {
    id: 'conveyor-dash',
    title: 'Carrera de Cintas y Postes',
    subtitle: 'Accelerating Conveyor Hurdles',
    objective: '¡Corre contra la cinta transportadora, salta los postes y no dejes que te arrastre al vacío!',
    twist: 'Giro: ¡La cinta y los postes aceleran cada segundo! El que se caiga por el borde pierde al instante.',
    color: '#3b82f6',
    category: 'Supervivencia',
    duration: 45,
  },
  'target-bullseye': {
    id: 'target-bullseye',
    title: 'Tiro al Blanco Gelatinoso',
    subtitle: 'Springboard Bullseye Drop',
    objective: '¡Únete a los rebotadores elásticos para aterrizar en los anillos centrales de +5 puntos!',
    twist: 'Giro: La diana central se desplaza de izquierda a derecha con inercia pendular.',
    color: '#6366f1',
    category: 'Habilidad',
    duration: 40,
  },
  'egg-splat': {
    id: 'egg-splat',
    title: 'Batalla de Sirope Resbaladizo',
    subtitle: 'Zero-Friction Syrup Tag',
    objective: '¡Muévete sobre una pista de hielo y sirope con fricción cero y golpea a todos los rivales!',
    twist: 'Giro: Los empujones no tienen fricción y te hacen rebotar infinitamente contra las paredes.',
    color: '#14b8a6',
    category: 'Habilidad',
    duration: 35,
  },
  'coin-frenzy': {
    id: 'coin-frenzy',
    title: 'Caza de Monedas de Chocolate',
    subtitle: 'Golden Choco-Coin Frenzy',
    objective: '¡Recolecta la mayor cantidad de monedas de chocolate antes de que se agote el tiempo!',
    twist: 'Giro: Si recibes una bofetada, ¡sueltas la mitad de tus monedas por el suelo!',
    color: '#eab308',
    category: 'Puntos',
    duration: 35,
  },
  'paint-war': {
    id: 'paint-war',
    title: 'Guerra de Pintura: Batalla de Sirope',
    subtitle: 'Turf Syrup Paint War',
    objective: '¡Pinta el suelo con el color de tu equipo corriendo y abofeteando a los rivales!',
    twist: 'Giro: Abofetear a un rival provoca una mega-explosión que pinta 9 casillas al instante.',
    color: '#e11d48',
    category: 'En Equipo',
    isTeamGame: true,
    duration: 40,
  },
  'cake-defense': {
    id: 'cake-defense',
    title: 'Defensa del Pastel en Equipo',
    subtitle: 'Co-op Birthday Cake Fortress',
    objective: '¡Protejan juntos el pastel central de las oleadas de bichos glotones de azúcar!',
    twist: 'Giro: Los bichos gigantes embisten con proyectiles de merengue explosivo.',
    color: '#db2777',
    category: 'En Equipo',
    isTeamGame: true,
    duration: 45,
  },
  'candy-siege': {
    id: 'candy-siege',
    title: 'Guerra de Cañones de Caramelo',
    subtitle: 'Team Fortress Cannon Duel',
    objective: '¡Dispara proyectiles de caramelo gigante a través del foso para expulsar al otro equipo!',
    twist: 'Giro: Los cañones se recargan golpeando sacos de azúcar en la retaguardia.',
    color: '#7c3aed',
    category: 'En Equipo',
    isTeamGame: true,
    duration: 40,
  },
  'donut-tug': {
    id: 'donut-tug',
    title: 'Tira y Afloja de Carros de Masa',
    subtitle: 'Team Donut Push & Tug',
    objective: '¡Empujen en equipo la masa gigante dorada hacia la zona de anotación rival!',
    twist: 'Giro: El suelo de la zona central se engrasa con mantequilla aumentando la inercia.',
    color: '#059669',
    category: 'En Equipo',
    isTeamGame: true,
    duration: 40,
  },
};

export function createHexGrid(width: number, height: number): HexTile[] {
  const tiles: HexTile[] = [];
  const rows = 3;
  const cols = 7;
  const tileRadius = 38;
  const startX = width * 0.16;
  const startY = height * 0.42;
  const spacingX = (width * 0.68) / (cols - 1);
  const spacingY = 55;

  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (r % 2) * (spacingX * 0.5);
      tiles.push({
        id: id++,
        x: startX + c * spacingX + offsetX,
        y: startY + r * spacingY,
        radius: tileRadius,
        state: 'stable',
        steppedTimer: 0,
        respawnTimer: 0,
        wobbleOffset: 0,
      });
    }
  }
  return tiles;
}

export function updateHexTiles(tiles: HexTile[], dt: number) {
  for (const tile of tiles) {
    if (tile.state === 'warning') {
      tile.steppedTimer += dt;
      tile.wobbleOffset = Math.sin(tile.steppedTimer * 30) * 4;
      if (tile.steppedTimer > 0.4) {
        tile.state = 'cracking';
      }
    } else if (tile.state === 'cracking') {
      tile.steppedTimer += dt;
      tile.wobbleOffset = Math.sin(tile.steppedTimer * 50) * 8;
      if (tile.steppedTimer > 1.2) {
        tile.state = 'fallen';
        tile.respawnTimer = 6.0;
        tile.wobbleOffset = 0;
      }
    } else if (tile.state === 'fallen') {
      tile.respawnTimer -= dt;
      if (tile.respawnTimer <= 0) {
        tile.state = 'stable';
        tile.steppedTimer = 0;
      }
    }
  }
}

export function createRollingPins(width: number, height: number): Hazard[] {
  return [
    {
      id: 'pin-1',
      x: -120,
      y: height - 110,
      width: 70,
      height: 40,
      vx: 240,
      vy: 0,
      type: 'rolling-pin',
      active: true,
      cycleTimer: 0,
    },
    {
      id: 'pin-2',
      x: width + 120,
      y: height - 110,
      width: 70,
      height: 40,
      vx: -200,
      vy: 0,
      type: 'rolling-pin',
      active: true,
      cycleTimer: 3.5,
    },
  ];
}

export function createGeysers(width: number, height: number): Hazard[] {
  return [
    {
      id: 'geyser-1',
      x: width * 0.28,
      y: height * 0.72,
      width: 50,
      height: 120,
      vx: 0,
      vy: 0,
      type: 'cream-geyser',
      active: false,
      cycleTimer: 0,
      warningTimer: 0,
    },
    {
      id: 'geyser-2',
      x: width * 0.72,
      y: height * 0.72,
      width: 50,
      height: 120,
      vx: 0,
      vy: 0,
      type: 'cream-geyser',
      active: false,
      cycleTimer: 2.2,
      warningTimer: 0,
    },
  ];
}

export function createWhiskHazards(width: number, height: number): Hazard[] {
  return [
    {
      id: 'whisk-center',
      x: width * 0.5,
      y: height * 0.52,
      width: 240,
      height: 28,
      vx: 0,
      vy: 0,
      type: 'whisk-blade',
      active: true,
      rotation: 0,
      rotSpeed: 1.8,
      cycleTimer: 0,
    },
    {
      id: 'whisk-outer',
      x: width * 0.5,
      y: height * 0.52,
      width: 320,
      height: 24,
      vx: 0,
      vy: 0,
      type: 'whisk-blade',
      active: true,
      rotation: Math.PI / 2,
      rotSpeed: -1.3,
      cycleTimer: 0,
    },
  ];
}

/**
 * Well-spaced Biscuit Platforms for Honey Lava
 */
export function createHoneyPlatforms(width: number, height: number): PlatformItem[] {
  return [
    // Bottom rescue step
    { id: 1, x: width * 0.22, y: height * 0.68, width: 150, height: 22, color: '#f59e0b' },
    { id: 2, x: width * 0.78, y: height * 0.68, width: 150, height: 22, color: '#f59e0b' },
    // Middle tiers
    { id: 3, x: width * 0.5, y: height * 0.52, width: 170, height: 24, color: '#f59e0b' },
    // High safe havens
    { id: 4, x: width * 0.25, y: height * 0.36, width: 130, height: 20, color: '#fbbf24' },
    { id: 5, x: width * 0.75, y: height * 0.36, width: 130, height: 20, color: '#fbbf24' },
    // Top summit
    { id: 6, x: width * 0.5, y: height * 0.22, width: 120, height: 18, color: '#fef08a' },
  ];
}

export function createTargetZones(width: number, height: number): TargetZone[] {
  return [
    { x: width * 0.5, y: height * 0.65, radius: 150, points: 1, color: '#3b82f6', label: '+1 pt' },
    { x: width * 0.5, y: height * 0.65, radius: 95, points: 3, color: '#f59e0b', label: '+3 pts' },
    { x: width * 0.5, y: height * 0.65, radius: 45, points: 5, color: '#ef4444', label: '¡DIANA +5!' },
  ];
}

export function spawnCoins(width: number, height: number, count = 12): CoinItem[] {
  const coins: CoinItem[] = [];
  for (let i = 0; i < count; i++) {
    coins.push({
      id: i,
      x: width * 0.12 + Math.random() * (width * 0.76),
      y: height * 0.25 + Math.random() * (height * 0.55),
      radius: 12,
      value: 1,
      collected: false,
      floatPhase: Math.random() * Math.PI * 2,
    });
  }
  return coins;
}

export function createSoccerBall(width: number, height: number): BallItem {
  return {
    x: width * 0.5,
    y: height * 0.55,
    vx: 0,
    vy: 0,
    radius: 28,
    rotation: 0,
  };
}

/**
 * Create Paint War Floor Grid (16 columns x 10 rows)
 */
export function createPaintGrid(width: number, height: number): PaintCell[] {
  const cells: PaintCell[] = [];
  const cols = 16;
  const rows = 10;
  const topY = 70;
  const playHeight = height - 90;
  const cellW = width / cols;
  const cellH = playHeight / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Half starts red, half starts blue
      const initialTeam = c < cols / 2 ? 'red' : 'blue';
      cells.push({
        col: c,
        row: r,
        x: c * cellW,
        y: topY + r * cellH,
        width: cellW,
        height: cellH,
        team: initialTeam,
        color: initialTeam === 'red' ? '#e11d48' : '#2563eb',
      });
    }
  }
  return cells;
}

/**
 * Spawn Cake Gremlins for Cake Defense
 */
export function spawnCakeGremlins(width: number, height: number, count = 6): CakeGremlin[] {
  const gremlins: CakeGremlin[] = [];
  const cakeX = width * 0.5;
  const cakeY = height * 0.55;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const spawnDist = 380 + Math.random() * 80;
    const gx = cakeX + Math.cos(angle) * spawnDist;
    const gy = cakeY + Math.sin(angle) * spawnDist;
    gremlins.push({
      id: `gremlin-${Date.now()}-${i}`,
      x: gx,
      y: gy,
      vx: 0,
      vy: 0,
      radius: 16,
      hp: 2,
      maxHp: 2,
      color: '#a855f7',
    });
  }
  return gremlins;
}
