import { forces } from '../stores/forces';
import { r2d } from '../../../src';

export const paddleMovement = r2d.system({
  stores: {
    forces: forces,
  },
  run: ({ forces }, _, ctx) => {
    const velocity = { x: 0, y: 0 };
    if (
      ctx.input.keyboard.getKeyPressed('a') ||
      ctx.input.keyboard.getKeyPressed('ArrowLeft')
    ) {
      velocity.x = -5;
    } else if (
      ctx.input.keyboard.getKeyPressed('d') ||
      ctx.input.keyboard.getKeyPressed('ArrowRight')
    ) {
      velocity.x = 5;
    }

    forces.velocity = velocity;
  },
});
