import React from 'react';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { LobbyView } from './components/LobbyView';
import { useLiarUno } from './useLiarUno';

export default function App() {
  const gameState = useLiarUno();

  if (gameState.phase === 'MENU') {
    return <MainMenu onPlay={gameState.goToLobby} />;
  }

  if (gameState.phase === 'LOBBY') {
    return <LobbyView onStart={gameState.startGame} onBack={() => { /* Wait, no back in state yet. We can just reload or add goBack. If no goBack, just keep it out */ window.location.reload() }} />;
  }

  return <GameView gameState={gameState} />;
}

