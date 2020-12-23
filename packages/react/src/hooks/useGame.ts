import { useContext } from 'react';
import { worldContext } from '../World';

export function useGame() {
  const game = useContext(worldContext);
  if (!game) {
    throw new Error('Must be called within World');
  }
  return game;
}
