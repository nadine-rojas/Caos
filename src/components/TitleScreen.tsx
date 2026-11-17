/**
 * Title Screen: Full-viewport Game Shell Title with 16 Minigames,
 * Team Action games, Paint War, and intelligent bot mode.
 */

import React, { useState, useEffect } from 'react';
import { GameModeId, PlayerConfig } from '../types/game';
import { MINIGAMES } from '../game/minigames';
import { soundEngine } from '../audio/soundEngine';
import { Play, BookOpen, Volume2, VolumeX, Users, Award, Grid, Shield, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (mode: GameModeId, players: PlayerConfig[], isTournament: boolean) => void;
  onOpenGDD: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, onOpenGDD }) => {
  const [playerCount, setPlayerCount] = useState<1 | 2 | 3>(1);
  const [selectedMode, setSelectedMode] = useState<GameModeId | 'tournament'>('paint-war');
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [jellySquish, setJellySquish] = useState<[number, number, number]>([1, 1, 1]);
  const [showGameCatalog, setShowGameCatalog] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<'Todos' | 'En Equipo' | 'Supervivencia' | 'Puntos'>('Todos');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (!showGameCatalog) startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerCount, selectedMode, showGameCatalog]);

  const handlePokeJelly = (idx: number) => {
    soundEngine.playBoing(1.0 + idx * 0.2);
    setJellySquish(prev => {
      const next: [number, number, number] = [...prev];
      next[idx] = 1.45;
      return next;
    });
    setTimeout(() => {
      setJellySquish(prev => {
        const next: [number, number, number] = [...prev];
        next[idx] = 1;
        return next;
      });
    }, 250);
  };

  const startGame = (overrideMode?: GameModeId) => {
    soundEngine.playBoing(1.4);
    const configs: PlayerConfig[] = [
      {
        id: 1,
        name: 'Gelatina Fresa',
        color: '#f43f5e',
        accentColor: '#fda4af',
        isBot: false,
        hat: 'bandana',
        team: 'red',
      },
      {
        id: 2,
        name: playerCount >= 2 ? 'Gelatina Menta' : 'Bot Menta',
        color: '#10b981',
        accentColor: '#6ee7b7',
        isBot: playerCount < 2,
        hat: 'propeller',
        team: 'blue',
      },
      {
        id: 3,
        name: playerCount >= 3 ? 'Gelatina Mora' : 'Bot Mora',
        color: '#3b82f6',
        accentColor: '#93c5fd',
        isBot: playerCount < 3,
        hat: 'chef',
        team: 'blue',
      },
    ];

    const modeToPlay = overrideMode || (selectedMode === 'tournament' ? 'paint-war' : selectedMode);
    onStartGame(modeToPlay, configs, selectedMode === 'tournament' && !overrideMode);
  };

  const toggleSound = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
  };

  const allMinigamesList = Object.values(MINIGAMES);
  const filteredList =
    catalogFilter === 'Todos'
      ? allMinigamesList
      : allMinigamesList.filter(m => m.category === catalogFilter);

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between items-center bg-[#090d16] text-slate-100 overflow-hidden select-none p-4 sm:p-6">
      {/* Background Aura */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative w-full max-w-5xl flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            ¡Caos Gelatina!
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
            <Sparkles size={12} />
            <span>Guerra de Pintura & Modos en Equipo</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowGameCatalog(prev => !prev)}
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Grid size={14} />
            <span>Catálogo Completo (16 Juegos)</span>
          </button>
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={onOpenGDD}
            className="px-3.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 hover:border-indigo-500 rounded-lg text-xs font-semibold text-indigo-300 flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
          >
            <BookOpen size={15} />
            <span>Documento de Diseño (GDD)</span>
          </button>
        </div>
      </header>

      {/* Main Content: Title or Game Catalog */}
      {!showGameCatalog ? (
        <main className="relative flex flex-col items-center justify-center text-center z-10 my-auto max-w-3xl w-full">
          {/* Bespoke SVG Title Lockup */}
          <div className="w-full max-w-lg mb-3 cursor-default">
            <svg viewBox="0 0 600 130" className="w-full h-auto drop-shadow-[0_12px_24px_rgba(244,63,94,0.35)]">
              <defs>
                <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>
              <text
                x="300"
                y="68"
                textAnchor="middle"
                fill="#090d16"
                stroke="#090d16"
                strokeWidth="14"
                strokeLinejoin="round"
                fontFamily="Outfit, sans-serif"
                fontWeight="900"
                fontSize="64"
                letterSpacing="2"
              >
                ¡CAOS GELATINA!
              </text>
              <text
                x="300"
                y="68"
                textAnchor="middle"
                fill="url(#titleGrad)"
                fontFamily="Outfit, sans-serif"
                fontWeight="900"
                fontSize="64"
                letterSpacing="2"
              >
                ¡CAOS GELATINA!
              </text>
              <text
                x="300"
                y="108"
                textAnchor="middle"
                fill="url(#subGrad)"
                fontFamily="Outfit, sans-serif"
                fontWeight="700"
                fontSize="17"
                letterSpacing="3"
              >
                GUERRA DE PINTURA & ACCIÓN EN EQUIPO
              </text>
            </svg>
          </div>

          {/* Interactive Bouncing Jellies with Team Badges */}
          <div className="flex items-end justify-center gap-6 mb-5 h-24">
            <div
              onClick={() => handlePokeJelly(0)}
              className="flex flex-col items-center cursor-pointer transition-transform duration-200 active:scale-95 group"
              title="¡Tócame para hacerme rebotar!"
            >
              <div
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-300 relative shadow-lg flex items-center justify-center transition-all duration-150"
                style={{ transform: `scale(${jellySquish[0] > 1 ? '1.35, 0.75' : '1, 1'})` }}
              >
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center border border-slate-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950 translate-x-0.5" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center border border-slate-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950 translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute top-1 inset-x-2 h-1.5 bg-slate-950 rounded-sm" />
              </div>
              <span className="text-[10px] font-bold text-rose-300 mt-1 opacity-80 group-hover:opacity-100">
                P1 (Equipo Rojo)
              </span>
            </div>

            <div
              onClick={() => handlePokeJelly(1)}
              className="flex flex-col items-center cursor-pointer transition-transform duration-200 active:scale-95 group"
              title="¡Tócame para hacerme rebotar!"
            >
              <div
                className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-300 relative shadow-lg flex items-center justify-center transition-all duration-150"
                style={{ transform: `scale(${jellySquish[1] > 1 ? '1.35, 0.75' : '1, 1'})` }}
              >
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center border border-slate-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950 -translate-x-0.5" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center border border-slate-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950 -translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute -top-1.5 w-3.5 h-1 bg-amber-400 rounded-full" />
              </div>
              <span className="text-[10px] font-bold text-emerald-300 mt-1 opacity-80 group-hover:opacity-100">
                {playerCount >= 2 ? 'P2 (Equipo Azul)' : 'Bot Menta (Azul)'}
              </span>
            </div>

            <div
              onClick={() => handlePokeJelly(2)}
              className="flex flex-col items-center cursor-pointer transition-transform duration-200 active:scale-95 group"
              title="¡Tócame para hacerme rebotar!"
            >
              <div
                className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-300 relative shadow-lg flex items-center justify-center transition-all duration-150"
                style={{ transform: `scale(${jellySquish[2] > 1 ? '1.35, 0.75' : '1, 1'})` }}
              >
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center border border-slate-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center border border-slate-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  </div>
                </div>
                <div className="absolute -top-2 w-4 h-2.5 bg-white rounded-t-md border border-slate-300" />
              </div>
              <span className="text-[10px] font-bold text-sky-300 mt-1 opacity-80 group-hover:opacity-100">
                {playerCount >= 3 ? 'P3 (Equipo Azul)' : 'Bot Mora (Azul)'}
              </span>
            </div>
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5 w-full max-w-xl">
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold px-2.5 flex items-center gap-1.5">
                <Users size={14} />
                <span>Jugadores:</span>
              </span>
              {([1, 2, 3] as const).map(count => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    playerCount === count
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {count === 1 ? '1P vs Bots' : `${count} Jugadores`}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 w-full sm:w-auto">
              <button
                onClick={() => setSelectedMode('paint-war')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedMode === 'paint-war'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles size={14} />
                <span>Guerra de Pintura</span>
              </button>
              <select
                value={selectedMode === 'tournament' ? 'tournament' : selectedMode}
                onChange={e => {
                  if (e.target.value) setSelectedMode(e.target.value as GameModeId | 'tournament');
                }}
                className="bg-transparent text-xs text-slate-300 font-medium px-2 py-1 outline-none cursor-pointer max-w-[170px] truncate"
              >
                <option value="tournament" className="bg-slate-900 text-amber-300 font-bold">
                  🏆 Modo Torneo Completo
                </option>
                <optgroup label="Modos en Equipo (Acción Co-op / Versus)" className="bg-slate-900 text-slate-300">
                  <option value="paint-war">🎨 Guerra de Pintura (Turf Battle)</option>
                  <option value="cake-defense">🎂 Defensa del Pastel en Equipo</option>
                  <option value="jelly-soccer">⚽ Fútbol Gelatinoso Supremo</option>
                  <option value="donut-tug">🍩 Tira y Afloja de Masas</option>
                  <option value="candy-siege">🏰 Guerra de Cañones</option>
                </optgroup>
                <optgroup label="Modos de Supervivencia (Bots Inteligentes)" className="bg-slate-900 text-slate-300">
                  <option value="conveyor-dash">🏃 Carrera de Cintas y Postes</option>
                  <option value="honey-lava">🍯 El Suelo es Miel Hirviente</option>
                  <option value="hot-bomb">💣 La Patata Explosiva</option>
                  <option value="hex-crumble">🧇 Plataformas Quebradizas</option>
                  <option value="whisk-dodge">🌪️ Esquiva-Batidoras Letales</option>
                  <option value="meteor-shower">☄️ Lluvia de Meteoros</option>
                </optgroup>
                <optgroup label="Puntos & Caos" className="bg-slate-900 text-slate-300">
                  <option value="donut-heist">🍩 Fiebre de Donas de Oro</option>
                  <option value="jelly-king">👑 Rey de la Colina Gelatinosa</option>
                  <option value="coin-frenzy">🪙 Caza de Monedas de Chocolate</option>
                  <option value="target-bullseye">🎯 Tiro al Blanco Gelatinoso</option>
                  <option value="egg-splat">🧊 Batalla de Sirope Resbaladizo</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-2 w-full max-w-sm">
            <button
              onClick={() => startGame()}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-500 via-amber-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 active:scale-98 text-slate-950 font-display font-black text-lg rounded-2xl shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <Play size={20} fill="currentColor" />
              <span>
                {selectedMode === 'tournament'
                  ? '¡JUGAR TORNEO COMPLETO!'
                  : `¡JUGAR ${MINIGAMES[selectedMode]?.title.toUpperCase() || 'PARTIDA'}!`}
              </span>
            </button>
            <span className="text-[11px] text-slate-400">
              Pulsa <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">Enter</kbd> o <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">Espacio</kbd> para iniciar
            </span>
          </div>
        </main>
      ) : (
        /* Visual Catalog of all 16 minigames with category filter */
        <main className="relative flex-1 w-full max-w-5xl my-3 overflow-y-auto z-10 pr-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Catálogo de los 16 Minijuegos
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona cualquier minijuego para jugarlo al instante
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {(['Todos', 'En Equipo', 'Supervivencia', 'Puntos'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatalogFilter(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                    catalogFilter === cat
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setShowGameCatalog(false)}
                className="text-xs font-semibold px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md ml-2"
              >
                ← Volver
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredList.map((mg, idx) => (
              <div
                key={mg.id}
                onClick={() => startGame(mg.id)}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: mg.color }}
                    >
                      {mg.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{mg.duration}s</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {mg.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {mg.objective}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                  <span>Jugar Ahora</span>
                  <Play size={12} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Flat Control-Hint Line */}
      <footer className="relative w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 z-20">
        <div className="flex items-center gap-2 mb-1 sm:mb-0">
          <span className="text-slate-300 font-medium">Controles:</span>
          <span>WASD + Espacio (P1)</span>
          <span aria-hidden="true">·</span>
          <span>Flechas + Enter (P2)</span>
          <span aria-hidden="true">·</span>
          <span>IJKL + U (P3)</span>
          <span aria-hidden="true">·</span>
          <span>Esc Pausa</span>
        </div>
        <div className="flex items-center gap-2">
          <span>IA de Bots Optimizada en Miel Hirviente · Guerra de Pintura Lista</span>
        </div>
      </footer>
    </div>
  );
};
