/**
 * ¡Caos Gelatina! Club de Golpes Blandos
 * Full-viewport Game Shell + Playable 60fps Party Game + Interactive GDD Pitch Bible
 */

import React, { useState } from 'react';
import { GameModeId, PlayerConfig, PhysicsParams } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './game/GameCanvas';
import { GDDDocument } from './components/GDDDocument';
import { DEFAULT_PHYSICS } from './game/physics';

export default function App() {
  const [currentView, setCurrentView] = useState<'TITLE' | 'PLAYING'>('TITLE');
  const [showGDD, setShowGDD] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<GameModeId>('hot-bomb');
  const [isTournament, setIsTournament] = useState<boolean>(false);
  const [customPhysics, setCustomPhysics] = useState<PhysicsParams>({ ...DEFAULT_PHYSICS });

  const [playerConfigs, setPlayerConfigs] = useState<PlayerConfig[]>([
    {
      id: 1,
      name: 'Gelatina Fresa',
      color: '#f43f5e',
      accentColor: '#fda4af',
      isBot: false,
      hat: 'bandana',
    },
    {
      id: 2,
      name: 'Bot Menta',
      color: '#10b981',
      accentColor: '#6ee7b7',
      isBot: true,
      hat: 'propeller',
    },
    {
      id: 3,
      name: 'Bot Mora',
      color: '#3b82f6',
      accentColor: '#93c5fd',
      isBot: true,
      hat: 'chef',
    },
  ]);

  const handleStartGame = (mode: GameModeId, configs: PlayerConfig[], tournament: boolean) => {
    setActiveMode(mode);
    setPlayerConfigs(configs);
    setIsTournament(tournament);
    setCurrentView('PLAYING');
  };

  const handleExitToTitle = () => {
    setCurrentView('TITLE');
  };

  const handleLaunchGameFromGDD = (mode?: GameModeId) => {
    if (mode) {
      setActiveMode(mode);
    }
    setShowGDD(false);
    setCurrentView('PLAYING');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090d16] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100">
      {/* View Switcher: Title Screen vs 60fps Active Game Viewport */}
      {currentView === 'TITLE' ? (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenGDD={() => setShowGDD(true)}
        />
      ) : (
        <GameCanvas
          mode={activeMode}
          playerConfigs={playerConfigs}
          customPhysics={customPhysics}
          isTournament={isTournament}
          onOpenGDD={() => setShowGDD(true)}
          onExitToTitle={handleExitToTitle}
        />
      )}

      {/* Comprehensive Game Design Document (GDD) Modal */}
      {showGDD && (
        <GDDDocument
          onClose={() => setShowGDD(false)}
          onLaunchGame={handleLaunchGameFromGDD}
          physics={customPhysics}
          onUpdatePhysics={setCustomPhysics}
        />
      )}
    </div>
  );
}
