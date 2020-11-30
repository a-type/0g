import { r2d } from '../../../../..';
import { Store } from '../../../../../src';
import { transform } from '../../../common/stores/transform';

export const blockSpawner = r2d.system<
  {
    transform: ReturnType<typeof transform>;
    spawnerConfig: Store<{
      horizontalCount: number;
      verticalCount: number;
      blockWidth: number;
      blockHeight: number;
    }>;
  },
  {
    didSpawn: boolean;
  }
>({
  name: 'blockSpawner',
  runsOn: (prefab) => prefab.name === 'BlockSpawner',
  state: {
    didSpawn: false,
  },
  run: ({ transform, spawnerConfig }, state, ctx) => {
    if (!state.didSpawn) {
      state.didSpawn = true;
      const x = transform.x;
      const y = transform.y;
      for (
        let w = -(spawnerConfig.horizontalCount / 2);
        w < spawnerConfig.horizontalCount / 2;
        w++
      ) {
        for (
          let h = -(spawnerConfig.verticalCount / 2);
          h < spawnerConfig.verticalCount / 2;
          h++
        ) {
          ctx.world.add(
            'Block',
            {
              bodyConfig: {
                shape: 'rectangle',
                width: spawnerConfig.blockWidth,
                height: spawnerConfig.blockHeight,
                isStatic: true,
              },
              transform: {
                x: x + w * spawnerConfig.blockWidth,
                y: y + h * spawnerConfig.blockHeight,
              },
            },
            ctx.entity.id
          );
        }
      }
    }
  },
});
