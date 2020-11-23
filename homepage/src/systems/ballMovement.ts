import { forces } from '../stores/forces';
import { r2d, store } from '../../../src';
import { transform } from '../stores/transform';
import { body } from '../stores/body';
import { SIZE } from '../constants';
import { vecGetLength, vecNormalize, vecScale } from 'math2d';

export const ballMovement = r2d.system({
  stores: {
    forces: forces,
    transform: transform,
    body: body,
    config: store({
      speed: 12,
    }),
  },
  state: {
    started: false,
  },
  run: (stores, state) => {
    if (!state.started) {
      state.started = true;
      stores.transform.x = 0;
      stores.transform.y = 0;
      stores.forces.impulse = {
        x: 0,
        y: stores.config.speed * stores.body.mass,
      };
    }

    if (stores.transform.y > SIZE * 1.5) {
      stores.transform.x = 0;
      stores.transform.y = 0;
    }

    // limit velocity
    if (vecGetLength(stores.body.velocity) > stores.config.speed) {
      const normal = vecNormalize(stores.body.velocity);
      stores.forces.velocity = vecScale(normal, stores.config.speed);
    }
  },
});
