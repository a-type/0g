import { Game } from '0g';
import * as gameComponents from './components.js';
import * as box2dComponents from '../common/box2d/components.js';
import { systems as box2dSystems } from '../common/box2d/systems.js';
import { systems } from './systems.js';
import { createSVGElement } from './utils.js';
import { asteroidPrefab, playerPrefab, worldPrefab } from './prefabs.js';
import { Keyboard, keyboard, Pointer, pointer } from '0g/input';

const game = new Game({
  components: [
    ...Object.values(gameComponents),
    ...Object.values(box2dComponents),
  ],
  systems: [box2dSystems, systems],
});

game.globals.resolve('keyboard', keyboard);
game.subscribe('stepComplete', keyboard.frame);
game.globals.resolve('pointer', pointer);
game.subscribe('stepComplete', pointer.frame);

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
  interface Globals {
    root: SVGSVGElement;
    keyboard: Keyboard;
    pointer: Pointer;
  }
  interface AssetLoaders {
    foo: string;
  }
}

export const spaceGameRoot = root;
export const spaceGame = game;

// @ts-ignore
window.game = game;
