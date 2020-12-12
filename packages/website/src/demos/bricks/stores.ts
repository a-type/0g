import { store } from '0g';
import { stores as box2dStores } from '@0g/box2d';

export type BlockData = {
  key: string;
  text: string;
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
  paddleConfig: store('paddleConfig', { speed: 12 }),
};
