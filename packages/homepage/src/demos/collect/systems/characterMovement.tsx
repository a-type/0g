import { game } from '../game';

export const characterMovement = game.system({
  name: 'characterMovement',
  runsOn: (prefab) => prefab.name === 'Character',
  run: (entity, _, ctx) => {
    const config = game.stores.characterConfig.get(entity)!;
    const body = game.stores.body.get(entity)!;

    const velocity = { x: 0, y: 0 };
    if (ctx.world.input.keyboard.getKeyPressed('ArrowLeft'))
      velocity.x = -config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowRight'))
      velocity.x = config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowUp'))
      velocity.y = -config.speed;
    if (ctx.world.input.keyboard.getKeyPressed('ArrowDown'))
      velocity.y = config.speed;

    body.forces.velocity = velocity;
  },
});
