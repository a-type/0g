import { store } from '0g';
import { stores as box2dStores } from '@0g/box2d';
import { vecScale } from 'math2d';

export type BlockData = {
  key: string;
  text: string;
};

const randomUnit = () => {
  const rand = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(rand),
    y: Math.sin(rand),
  };
};

export const stores = {
  ...box2dStores,
  ballConfig: store(
    class BallConfig {
      speed = 12;
    },
    'persistent',
    'ballConfig'
  ),
  ballState: store(
    class BallState {
      needsLaunch = true;
    },
    'state',
    'ballState'
  ),
  blockInfo: store(
    class BlockInfo {
      spawnerId: string | null = null;
      key: string | null = null;
      text = 'TODO';
      fontSize = 80;
    },
    'persistent',
    'blockInfo'
  ),
  blocksConfig: store(
    class BlocksConfig {
      blockWidth = 6;
      blockHeight = 8;
      fontSize = 80;
      blocks = [
        [
          {
            key: 'title0',
            text: '0',
          },
          {
            key: 'titleG',
            text: 'G',
          },
        ],
      ] as Array<Array<BlockData>>;
      alreadySpawned = false;
    },
    'persistent',
    'blocksConfig'
  ),
  paddleConfig: store(
    class PaddleConfig {
      speed = 16;
    },
    'persistent',
    'paddleConfig'
  ),
  debrisConfig: store(
    class DebrisConfig {
      text = '%';
      index = 0;
    },
    'persistent',
    'debrisConfig'
  ),
  debrisControllerConfig: store(
    class DebrisControllerConfig {
      items = new Array(20).fill(null).map((_, i) => ({
        text: '%',
        size: Math.random() * 2 + 1,
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
        angle: Math.random() * Math.PI * 2,
        key: i,
        velocity: vecScale(randomUnit(), Math.random() * 0.1),
        angularVelocity: Math.random() * 0.05 - 0.025,
      }));
      alreadySpawned = false;
    },
    'persistent',
    'debrisControllerConfig'
  ),
  wallTag: store(class WallTag {}, 'persistent', 'wallTag'),
};
