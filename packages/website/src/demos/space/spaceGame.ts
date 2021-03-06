import { Game } from '0g';
import * as gameComponents from './components';
import * as box2dComponents from '../common/box2d/components';
import { systems as box2dSystems } from '../common/box2d/systems';
import { systems } from './systems';
import { createSVGElement } from './utils';
import { asteroidPrefab, playerPrefab, worldPrefab } from './prefabs';
import { Keyboard, keyboard } from '../common/input/keyboard';
import { Pointer, pointer } from '../common/input/pointer';

const game = new Game({
  components: [
    ...Object.values(gameComponents),
    ...Object.values(box2dComponents),
  ],
  systems: [box2dSystems, systems],
});

game.globals.resolve('keyboard', keyboard);
game.on('stepComplete', keyboard.frame);
game.globals.resolve('pointer', pointer);
game.on('stepComplete', pointer.frame);

const root = createSVGElement('svg');
root.setAttribute('viewBox', '0 0 100 100');
game.globals.resolve('root', root);

// setup initial game entities
worldPrefab(game);
playerPrefab(game, { x: 50, y: 50 });
for (let i = 0; i < 4; i++) {
  asteroidPrefab(game, {
    size: 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
  });
}

declare module '0g' {
  interface GameResources {
    root: SVGSVGElement;
    keyboard: Keyboard;
    pointer: Pointer;
  }
}

export const spaceGameRoot = root;
export const spaceGame = game;

// @ts-ignore
window.game = game;
