import { game } from '../game';

export const blockSpawner = game.system({
  name: 'blockSpawner',
  runsOn: (prefab) => prefab.name === 'BlockSpawner',
  state: {
    didSpawn: false,
  },
  run: (entity, state, ctx) => {
    const transform = entity.getStore('transform');
    const spawnerConfig = entity.getStore('blockSpawnerConfig');

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
