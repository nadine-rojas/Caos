/**
 * Executive Game Design Document (GDD) & Creative Director Pitch Bible
 * Authored from the perspective of a Senior Game Design Director & Creative Producer.
 * Comprehensive coverage of all 16 playable minigames, Team Action & Paint War.
 */

import React, { useState } from 'react';
import { PhysicsParams, GameModeId } from '../types/game';
import { DEFAULT_PHYSICS } from '../game/physics';
import { MINIGAMES } from '../game/minigames';
import { soundEngine } from '../audio/soundEngine';
import {
  Sparkles,
  Gamepad2,
  Layers,
  Palette,
  Volume2,
  Calendar,
  Sliders,
  Play,
  X,
  CheckCircle2,
  Flame,
  Award,
  Zap,
  Users,
} from 'lucide-react';

interface GDDDocumentProps {
  onClose: () => void;
  onLaunchGame: (mode?: GameModeId) => void;
  physics: PhysicsParams;
  onUpdatePhysics: (params: PhysicsParams) => void;
}

type TabKey = 'premise' | 'loop' | 'mechanics' | 'minigames' | 'art_audio' | 'roadmap' | 'sandbox';

export const GDDDocument: React.FC<GDDDocumentProps> = ({
  onClose,
  onLaunchGame,
  physics,
  onUpdatePhysics,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('minigames');
  const [localPhysics, setLocalPhysics] = useState<PhysicsParams>({ ...physics });
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const handlePhysicsChange = (key: keyof PhysicsParams, val: number) => {
    const updated = { ...localPhysics, [key]: val };
    setLocalPhysics(updated);
    onUpdatePhysics(updated);
  };

  const resetPhysics = () => {
    setLocalPhysics({ ...DEFAULT_PHYSICS });
    onUpdatePhysics({ ...DEFAULT_PHYSICS });
  };

  const allMinigames = Object.values(MINIGAMES);
  const categories = ['Todos', 'En Equipo', 'Supervivencia', 'Puntos', 'Deportes', 'Habilidad'];
  const filteredMinigames =
    selectedCategory === 'Todos'
      ? allMinigames
      : allMinigames.filter(m => m.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Document Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Gamepad2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Game Design Document (GDD)
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-rose-400 font-semibold">16 Minijuegos · Guerra de Pintura & Equipos</span>
              </div>
              <h1 className="text-lg font-display font-bold text-white">
                ¡Caos Gelatina! Club de Golpes Blandos
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLaunchGame('paint-war')}
              className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition-colors"
            >
              <Play size={14} fill="currentColor" />
              <span>Jugar Guerra de Pintura</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Cerrar documento"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto shrink-0 text-xs">
          {[
            { id: 'minigames', label: '16 Minijuegos (Pintura & Equipos)', icon: Award },
            { id: 'premise', label: 'Ficha & Premisa', icon: Sparkles },
            { id: 'loop', label: 'Gameplay Loop', icon: Layers },
            { id: 'mechanics', label: 'Mecánicas & Físicas', icon: Zap },
            { id: 'art_audio', label: 'Arte & Audio Procedural', icon: Palette },
            { id: 'roadmap', label: 'Roadmap Técnico MVP', icon: Calendar },
            { id: 'sandbox', label: 'Calibrador de Físicas', icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
          {/* TAB: 16 MINIJUEGOS DETALLADOS */}
          {activeTab === 'minigames' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Catálogo de los 16 Minijuegos (Acción Individual y en Equipo)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Incluye la Guerra de Pintura (Turf Battle), Defensa del Pastel Co-op, y el algoritmo de salto para bots en Miel Hirviente.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMinigames.map((mg, i) => (
                  <div
                    key={mg.id}
                    className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow"
                            style={{ backgroundColor: mg.color }}
                          >
                            {mg.category}
                          </span>
                          {mg.isTeamGame && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">
                              EQUIPOS
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-slate-400 font-bold">
                          {mg.duration} seg
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white font-display">{mg.title}</h4>
                      <p className="text-xs text-slate-400 font-mono mb-2">{mg.subtitle}</p>
                      <p className="text-xs text-slate-300 mb-2">{mg.objective}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                        <strong className="text-amber-400 block mb-0.5">Giro Inesperado:</strong>
                        <span className="text-slate-300">{mg.twist}</span>
                      </div>

                      <button
                        onClick={() => onLaunchGame(mg.id)}
                        className="w-full py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Jugar Este Minijuego</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PREMISA & FICHA TÉCNICA */}
          {activeTab === 'premise' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs uppercase font-semibold text-slate-400 mb-1">Título Tentativo</div>
                  <div className="text-base font-bold text-white font-display">¡Caos Gelatina! Club de Golpes Blandos</div>
                  <div className="text-xs text-amber-400 mt-1">16 Minijuegos Integrados</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs uppercase font-semibold text-slate-400 mb-1">Estructura & Modos</div>
                  <div className="text-base font-bold text-white font-display">Modo Equipos & Todos vs Todos</div>
                  <div className="text-xs text-slate-400 mt-1">1 a 3 Jugadores Local / Co-op + Bots Inteligentes</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-xs uppercase font-semibold text-slate-400 mb-1">Plataformas Objetivo</div>
                  <div className="text-base font-bold text-white font-display">PC (Steam), Switch & Web</div>
                  <div className="text-xs text-slate-400 mt-1">HTML5 Canvas (MVP) → Godot 4 / Unity</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Flame size={16} />
                  <span>Logline Oficial</span>
                </div>
                <p className="text-slate-200 font-medium italic text-base">
                  "Un lote de gelatinas gourmet radiactivas cobra vida en la cocina de un restaurante de alta repostería y desata una batalla campal a través de 16 pruebas absurdas de empujones elásticos, guerras de pintura de sirope, defensa cooperativa de pasteles y rodillos gigantes para coronarse como el postre supremo."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} />
                  <span>Dinámica de Juegos en Equipo & Cooperativos</span>
                </h4>
                <p className="text-xs text-slate-300">
                  En los modos en equipo (Equipo Rojo vs Equipo Azul), los jugadores coordinan bofetadas combinadas:
                  en <em>Guerra de Pintura</em>, golpear a un rival expande un radio de 9 casillas de color de tu equipo;
                  en <em>Defensa del Pastel</em>, todos cooperan contra hordas de bichos de azúcar para defender la tarta de cumpleaños central.
                </p>
              </div>
            </div>
          )}

          {/* TAB: CORE GAMEPLAY LOOP */}
          {activeTab === 'loop' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white font-display mb-1">Bucle Central de Juego</h3>
                <p className="text-xs text-slate-400">
                  Cadencia de micro-físicas, táctica en equipo y desarrollo de campeonato.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase">Segundo a Segundo</span>
                  <h4 className="text-sm font-bold text-white">Slap & Salto Elástico</h4>
                  <p className="text-xs text-slate-300">
                    Cargar bofetadas, leer inercia de derrape, saltar entre galletas seguras antes de que suba la miel hirviente y embestir al rival.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase">Minuto a Minuto</span>
                  <h4 className="text-sm font-bold text-white">Objetivos de Equipo</h4>
                  <p className="text-xs text-slate-300">
                    Cubrir el 60% del suelo con sirope de tu color, empujar la masa dorada en equipo o defender el pastel de los bichos glotones.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Campeonato Completo</span>
                  <h4 className="text-sm font-bold text-white">16 Rondas & Podio</h4>
                  <p className="text-xs text-slate-300">
                    Puntuación por equipos, trofeos de repostería y fanfarria con confeti físico.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MECÁNICAS & FÍSICAS */}
          {activeTab === 'mechanics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Controles & Esquema
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-300 font-semibold">Jugador 1</span>
                      <span className="font-mono text-amber-400 font-bold">WASD + Espacio (Bofetada/Salto)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-300 font-semibold">Jugador 2</span>
                      <span className="font-mono text-emerald-400 font-bold">Flechas + Enter (Bofetada/Salto)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-300 font-semibold">Jugador 3</span>
                      <span className="font-mono text-sky-400 font-bold">IJKL + U (Bofetada/Salto)</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    IA de Navegación Vertical en Miel Hirviente
                  </h3>
                  <p className="text-xs text-slate-300">
                    El algoritmo de los bots calcula en tiempo real la distancia vertical al nivel de la miel (<code className="text-amber-400">honeyLevel</code>).
                    Al estar sobre una plataforma amenazada, identifican la plataforma superior más cercana y ejecutan impulsos de salto (<code className="text-amber-400">vy: -620</code>) hacia el centro de la galleta segura, además de abofetear a rivales que invadan su plataforma.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ARTE & AUDIO */}
          {activeTab === 'art_audio' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase">
                    <Palette size={16} />
                    <span>Estilo Visual Candy Cartoon</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Paleta saturada con contraste de repostería (Fresa Neón #F43F5E, Menta Ácida #10B981, Amarillo Donut #FBBF24, Azul Glaseado #38BDF8), ojos saltones reactivos y accesorios cómicos.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase">
                    <Volume2 size={16} />
                    <span>Diseño de Sonido Procedural</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Sintetizador Web Audio API en tiempo real sin descargas: boings ascendentes, bofetadas con ruido blanco filtrado, fanfarrias de victoria y música slap-bass a 125 BPM.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => soundEngine.playBoing(1.2)}
                      className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400"
                    >
                      Probar Boing
                    </button>
                    <button
                      onClick={() => soundEngine.playSlap()}
                      className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400"
                    >
                      Probar Slap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ROADMAP TÉCNICO */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-base font-bold text-white font-display mb-1">Roadmap de Producción Multiplataforma</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-300">
                  <strong>Fase 1 (MVP Actual):</strong> 16 minijuegos funcionales a 60fps en Canvas, modos en equipo (Guerra de Pintura, Defensa de Pastel), bots inteligentes en Miel Hirviente y sintetizador procedural Web Audio.
                </div>
                <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/20 text-amber-300">
                  <strong>Fase 2:</strong> Rollback Netcode determinista para multijugador online con sincronización de estados comprimidos.
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300">
                  <strong>Fase 3:</strong> Port a Nintendo Switch con soporte HD Rumble y versión Steam con Remote Play Together.
                </div>
              </div>
            </div>
          )}

          {/* TAB: SANDBOX DE CALIBRACIÓN */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-display mb-1">
                    Calibrador de Físicas en Tiempo Real
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifica rebote, empuje y velocidad para probarlos inmediatamente en cualquiera de los 16 minijuegos.
                  </p>
                </div>
                <button
                  onClick={resetPhysics}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg"
                >
                  Restaurar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">Rebote de Gelatina</span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(localPhysics.bounciness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.2"
                    step="0.05"
                    value={localPhysics.bounciness}
                    onChange={e => handlePhysicsChange('bounciness', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">Fuerza de Bofetada</span>
                    <span className="font-mono text-rose-400 font-bold">{localPhysics.slapForce} px/s</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="1100"
                    step="50"
                    value={localPhysics.slapForce}
                    onChange={e => handlePhysicsChange('slapForce', parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="text-xs text-amber-300">
                  ¿Listo para probar las físicas en los 16 minijuegos?
                </div>
                <button
                  onClick={() => onLaunchGame('paint-war')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Jugar con estos Ajustes</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>GDD Ejecutivo · 16 Minijuegos (Guerra de Pintura & Equipos)</span>
          <span>Versión 3.0</span>
        </div>
      </div>
    </div>
  );
};
