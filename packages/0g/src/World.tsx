import * as React from 'react';
import { PluginProviders } from './internal/PluginProviders';
import { Game } from './Game';

export const worldContext = React.createContext<Game | null>(null);

export type WorldProps = {
  game: Game;
};

export const World: React.FC<WorldProps> = ({ game, children }) => {
  return (
    <worldContext.Provider value={game}>
      <PluginProviders plugins={game.plugins}>
        <>{children}</>
      </PluginProviders>
    </worldContext.Provider>
  );
};

export function useGame() {
  const game = React.useContext(worldContext);
  if (!game) {
    throw new Error('Must be called within World');
  }
  return game;
}
