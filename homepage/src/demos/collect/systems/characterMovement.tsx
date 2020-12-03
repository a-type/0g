import * as r2d from '../../../../../src';
import { forces } from '../../../common/stores/forces';
import { transform } from '../../../common/stores/transform';
import { game } from '../game';

export const characterConfig = r2d.store('characterConfig', {
  speed: 12,
});

export const characterMovement = game.system<{
  transform: ReturnType<typeof transform>;
  forces: ReturnType<typeof forces>;
  config: ReturnType<typeof characterConfig>;
}>({
  name: 'characterMovement',
  runsOn: (prefab) => prefab.name === 'Character',
  run: (entity, _, ctx) => {
    const config = entity.getStore('characterConfig');
    const forces = entity.getStore('forces');

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
