import { r2d } from '../../../../../src';
import { forces } from '../../../common/stores/forces';
import { transform } from '../../../common/stores/transform';

export const characterConfig = r2d.store('characterConfig', {
  speed: 12,
});

export const characterMovement = r2d.system<{
  transform: ReturnType<typeof transform>;
  forces: ReturnType<typeof forces>;
  config: ReturnType<typeof characterConfig>;
}>({
  name: 'characterMovement',
  runsOn: (prefab) => prefab.name === 'Character',
  run: ({ config, forces }, _, ctx) => {
    const velocity = { x: 0, y: 0 };
    if (ctx.world.input.keyboard.getKeyPressed('ArrowLeft'))
      velocity.x = -config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowRight'))
      velocity.x = config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowUp'))
      velocity.y = -config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowDown'))
      velocity.y = config.speed;

    forces.velocity = velocity;
  },
});
