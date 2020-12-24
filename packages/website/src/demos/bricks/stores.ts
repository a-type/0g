import { PersistentStore, StateStore } from '0g';
import { stores as box2dStores } from '0g-box2d';
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
  BallConfig: class BallConfig extends PersistentStore {
    speed = 12;
  },
  BallState: class BallState extends StateStore {
    needsLaunch = true;
  },
  BlockInfo: class BlockInfo extends PersistentStore {
    spawnerId: string | null = null;
    key: string | null = null;
    text = 'TODO';
    fontSize = 80;
  },
  BlocksConfig: class BlocksConfig extends PersistentStore {
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
  PaddleConfig: class PaddleConfig extends PersistentStore {
    speed = 16;
  },
  DebrisConfig: class DebrisConfig extends PersistentStore {
    text = '%';
    index = 0;
  },
  DebrisControllerConfig: class DebrisControllerConfig extends PersistentStore {
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
  WallTag: class WallTag extends PersistentStore {},
};
