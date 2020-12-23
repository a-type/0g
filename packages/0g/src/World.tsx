import * as React from 'react';
import { Game } from './Game';

export const worldContext = React.createContext<Game | null>(null);

export type WorldProps = {
  game: Game;
};

export const World: React.FC<WorldProps> = ({ game, children }) => {
  return <worldContext.Provider value={game}>{children}</worldContext.Provider>;
};
