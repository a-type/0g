import { forces } from '../stores/forces';
import { r2d } from '../../../src';
import { transform } from '../stores/transform';

export const paddleMovement = r2d.system({
  stores: {
    forces: forces,
    transform: transform,
  },
  state: {
    initialY: null as null | number,
  },
  run: ({ forces, transform }, state, ctx) => {
    if (state.initialY !== null) state.initialY = transform.y;

    const velocity = { x: 0, y: 0 };
    if (
      ctx.input.keyboard.getKeyPressed('a') ||
      ctx.input.keyboard.getKeyPressed('ArrowLeft')
    ) {
      velocity.x = -12;
    } else if (
      ctx.input.keyboard.getKeyPressed('d') ||
      ctx.input.keyboard.getKeyPressed('ArrowRight')
    ) {
      velocity.x = 12;
    }

    forces.velocity = velocity;
    transform.y = state.initialY || transform.y;
  },
});
