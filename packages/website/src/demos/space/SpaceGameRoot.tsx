import * as React from 'react';
import { spaceGame, spaceGameRoot } from './spaceGame.js';
import { GameProvider, useGame, useQuery } from '@0g/react';
import { Asteroid, Player } from './components.js';
import { asteroidPrefab, playerPrefab } from './prefabs.js';

export function SpaceGameRoot() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.appendChild(spaceGameRoot);

    let raf = 0;
    const loop = (dt: number) => {
      raf = requestAnimationFrame(loop);
      spaceGame.step(dt);
    };

    requestAnimationFrame(loop);

    return () => {
      el.removeChild(spaceGameRoot);
      cancelAnimationFrame(raf);
    };
  }, [ref]);

  return (
    <GameProvider value={spaceGame}>
      <div className="gameRoot">
        <div ref={ref} />
        <div className="ui">
          <RespawnButton />
          <Win />
        </div>
      </div>
    </GameProvider>
  );
}

function RespawnButton() {
  const players = useQuery([Player]);
  const game = useGame();
  const respawn = () => {
    playerPrefab(game, { x: 50, y: 50 });
  };

  if (players.count > 0) {
    return null;
  }

  return <button onClick={respawn}>Respawn</button>;
}

function Win() {
  const asteroids = useQuery([Asteroid]);
  const game = useGame();
  const reset = () => {
    for (let i = 0; i < 4; i++) {
      asteroidPrefab(game, {
        size: 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    }
  };

  if (asteroids.count > 0) return null;

  return (
    <div
      className="win"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
      }}
    >
      <h3>You Win!</h3>
      <button onClick={reset}>More Asteroids!</button>
    </div>
  );
}
