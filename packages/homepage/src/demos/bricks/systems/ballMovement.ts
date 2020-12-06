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
    const transform = game.stores.transform.get(entity)!;
    const body = game.stores.body.get(entity)!;
    const forces = game.stores.forces.get(entity)!;
    const config = game.stores.ballConfig.get(entity)!;

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
