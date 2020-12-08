import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SavedScene } from '0g';
import { PX_SCALE, SIZE } from './constants';
import './index.css';
import '0g/src/tools/tools.css';
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
              transform: { x: 0, y: SIZE / 2 },
            },
          },
          ball: {
            id: 'ball',
            prefab: 'Ball',
            initial: {
              transform: { x: 0, y: 0 },
            },
          },
          leftWall: {
            id: 'leftWall',
            prefab: 'Wall',
            initial: {
              body: {
                config: {
                  width: 5,
                  height: SIZE,
                },
              },
              transform: { x: -SIZE / 2, y: 0 },
            },
          },
          rightWall: {
            id: 'rightWall',
            prefab: 'Wall',
            initial: {
              body: {
                config: {
                  width: 5,
                  height: SIZE,
                },
              },
              transform: { x: SIZE / 2, y: 0 },
            },
          },
          topWall: {
            id: 'topWall',
            prefab: 'Wall',
            initial: {
              body: {
                config: {
                  width: SIZE,
                  height: 0.5,
                },
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
