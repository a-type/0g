import { forces } from '../../../common/stores/forces';
import { r2d } from '../../../../..';
import { transform } from '../../../common/stores/transform';

export const paddleMovement = r2d.system<
  {
    forces: ReturnType<typeof forces>;
    transform: ReturnType<typeof transform>;
  },
  { initialY: null | number }
>({
  name: 'paddleMovement',
  runsOn: (prefab) => prefab.name === 'Paddle',
  state: {
    initialY: null,
  },
  run: ({ forces, transform }, state, ctx) => {
    if (state.initialY !== null) state.initialY = transform.y;

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

    forces.velocity = velocity;
    transform.y = state.initialY || transform.y;
  },
});
