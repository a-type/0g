import * as React from 'react';
import { Game } from './Game';
import { logger } from './logger';
import { Renderer } from './renderer';

export const worldContext = React.createContext<Game | null>(null);

export type WorldProps = {
  game: Game;
  renderers: Renderer[];
};

const RendererComponent = ({
  renderer,
  game,
}: {
  renderer: Renderer;
  game: Game;
}) => {
  const [_, setForceUpdate] = React.useState(Math.random());

  logger.debug(
    `🖥 Renderer ${renderer.name}: ${renderer.query.entities.length} matching entities`,
  );
  React.useEffect(() => {
    function onChange() {
      setForceUpdate(Math.random());
      logger.debug(
        `🖥 Renderer ${renderer.name} query updated: ${renderer.query.entities.length} matching entities`,
      );
    }
    // FIXME: why is this needed?
    onChange();

    renderer.query.events.on('entityAdded', onChange);
    renderer.query.events.on('entityRemoved', onChange);

    return () => {
      renderer.query.events.off('entityAdded', onChange);
      renderer.query.events.off('entityRemoved', onChange);
    };
  }, [renderer.query]);

  return (
    <>
      {renderer.query.entities.map((entity) => (
        <renderer.Component key={entity.id} game={game} entity={entity} />
      ))}
    </>
  );
};

export const World: React.FC<WorldProps> = ({ game, renderers }) => {
  return (
    <worldContext.Provider value={game}>
      {renderers.map((renderer) => (
        <RendererComponent
          key={renderer.name}
          renderer={renderer}
          game={game}
        />
      ))}
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
