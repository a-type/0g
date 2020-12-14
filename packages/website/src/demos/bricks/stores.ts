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
  ballConfig: store('ballConfig', { speed: 12 }),
  blockInfo: store('blockInfo', {
    spawnerId: null as string | null,
    key: null as string | null,
    text: 'TODO',
    fontSize: 80,
  }),
  blocksConfig: store('blocksConfig', {
    blockWidth: 6,
    blockHeight: 8,
    fontSize: 80,
    blocks: [
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
    ] as Array<Array<BlockData | null>>,
    removeBlock(key: string) {
      this.blocks = this.blocks.map((row) =>
        row.map((item) => (item?.key === key ? null : item))
      );
    },
  }),
  paddleConfig: store('paddleConfig', { speed: 16 }),
  debrisConfig: store('debrisConfig', {
    text: '%',
    index: 0,
  }),
  debrisControllerConfig: store('debrisControllerConfig', {
    items: new Array(20).fill(null).map((_, i) => ({
      text: '%',
      size: Math.random() * 2 + 1,
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
      angle: Math.random() * Math.PI * 2,
      key: i,
      velocity: vecScale(randomUnit(), Math.random() * 0.1),
      angularVelocity: Math.random() * 0.05 - 0.025,
    })),
    remove(index: number) {
      this.items = this.items.filter((i) => i.key !== index);
    },
  }),
};
