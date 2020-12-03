import { vecGetLength } from 'math2d';
import { game } from '../game';

export const ballMovement = game.system({
  name: 'ballMovement',
  runsOn: (prefab) => {
    return prefab.name === 'Ball';
  },
  state: {
    started: false,
  },
  run: (entity, state) => {
    const transform = entity.getStore('transform');
    const body = entity.getStore('body');
    const forces = entity.getStore('forces');
    const config = entity.getStore('ballConfig');

    if (!state.started) {
      state.started = true;
      transform.x = 0;
      transform.y = 0;
      const currentSpeed = vecGetLength(body.velocity);
      if (currentSpeed < config.speed) {
        forces.impulse = {
          x: 0,
          y: (config.speed - currentSpeed) * body.mass,
        };
      }
    }
  },
});
