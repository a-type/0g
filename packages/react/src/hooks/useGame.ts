import { useContext } from 'react';
import { gameContext } from '../GameProvider.js';

export function useGame() {
  const game = useContext(gameContext);
  if (!game) {
    throw new Error('Must be called within World');
  }
  return game;
}
