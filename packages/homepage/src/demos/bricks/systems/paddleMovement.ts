import { game } from '../game';

export const paddleMovement = game.system({
  name: 'paddleMovement',
  runsOn: (prefab) => prefab.name === 'Paddle',
  state: {
    initialY: null,
  } as { initialY: null | number },
  run: (entity, state, ctx) => {
    const transform = game.stores.transform.get(entity)!;
    const body = game.stores.body.get(entity)!;

    if (state.initialY === null) state.initialY = transform.y;

    const velocity = { x: 0, y: 0 };
    if (
      ctx.world.input.keyboard.getKeyPressed('a') ||
      ctx.world.input.keyboard.getKeyPressed('ArrowLeft')
    ) {
      velocity.x = -12;
    } else if (
      ctx.world.input.keyboard.getKeyPressed('d') ||
      ctx.world.input.keyboard.getKeyPressed('ArrowRight')
    ) {
      velocity.x = 12;
    }

    body.forces.addVelocity(velocity);
    transform.y = state.initialY || transform.y;
  },
});
