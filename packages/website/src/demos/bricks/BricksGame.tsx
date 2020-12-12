import * as React from 'react';
import { World, Game } from '0g';
import { GameScene } from './scenes';
import * as systems from './systems';

const game = new Game({
  systems,
});

(window as any).game = game;

export function BricksGame() {
  return (
    <div
      css={{
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: 'auto',
        overflow: 'hidden',
      }}
    >
      <div
        css={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          overflow: 'visible',
          '& > *': {
            position: 'absolute',
            display: 'block',
          },
        }}
      >
        <World game={game}>
          <GameScene id="gameScene" initial={{}} />
        </World>
      </div>
    </div>
  );
}
