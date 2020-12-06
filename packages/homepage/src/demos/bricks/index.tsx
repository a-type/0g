import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SavedScene } from 'r2d';
import { PX_SCALE, SIZE } from './constants';
import './index.css';
import 'r2d/src/tools/tools.css';
import './systems';
import './prefabs';
import { game } from './game';

const world: SavedScene = {
  entities: {
    scene: {
      id: 'scene',
      prefab: 'Scene',
      storesData: {
        children: {
          paddle: {
            id: 'paddle',
            prefab: 'Paddle',
            initial: {
              bodyConfig: {
                shape: 'rectangle',
                density: 1,
                width: SIZE / 3,
                height: SIZE / 20,
                restitution: 1,
                angle: 0,
                friction: 0.25,
                fixedRotation: true,
              },
              forces: {
                velocity: { x: 0, y: 0 },
              },
              transform: { x: 0, y: SIZE / 2 },
            },
          },
          ball: {
            id: 'ball',
            prefab: 'Ball',
            initial: {
              bodyConfig: {
                shape: 'circle',
                density: 0.1,
                radius: 1,
                restitution: 1,
                friction: 0.25,
                angle: 0,
                bullet: true,
                fixedRotation: true,
              },
              forces: {},
              transform: { x: 0, y: 0 },
            },
          },
          leftWall: {
            id: 'leftWall',
            prefab: 'Wall',
            initial: {
              bodyConfig: {
                shape: 'rectangle',
                density: 100,
                width: 5,
                height: SIZE,
                restitution: 1,
                angle: 0,
                isStatic: true,
              },
              transform: { x: -SIZE / 2, y: 0 },
            },
          },
          rightWall: {
            id: 'rightWall',
            prefab: 'Wall',
            initial: {
              bodyConfig: {
                shape: 'rectangle',
                density: 1,
                width: 5,
                height: SIZE,
                restitution: 1,
                angle: 0,
                isStatic: true,
              },
              transform: { x: SIZE / 2, y: 0 },
            },
          },
          topWall: {
            id: 'topWall',
            prefab: 'Wall',
            initial: {
              bodyConfig: {
                shape: 'rectangle',
                density: 1,
                width: SIZE,
                height: 0.5,
                restitution: 1,
                angle: 0,
                isStatic: true,
              },
              transform: { x: 0, y: -SIZE / 2 },
            },
          },
          blockSpawner: {
            id: 'blockSpawner',
            prefab: 'BlockSpawner',
            initial: {
              transform: {
                y: -SIZE / 3,
              },
            },
          },
        },
      },
    },
  },
};

const App = () => {
  return (
    <div
      className="Viewport"
      style={{
        transform: `scale(${
          Math.min(window.innerHeight, window.innerWidth) / SIZE / PX_SCALE -
          0.2
        })`,
      }}
    >
      <div className="CenterSpaceTransformer">
        <game.World scene={world} />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
