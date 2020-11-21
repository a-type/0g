import { forces } from '../stores/forces';
import { r2d } from '../../../src';
import { transform } from '../stores/transform';
import { body } from '../stores/body';
import { SIZE } from '../constants';

export const ballMovement = r2d.system({
  stores: {
    forces: forces,
    transform: transform,
    body: body,
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
        y: 300 * stores.body.mass,
      };
    }

    if (stores.transform.y > SIZE * 1.5) {
      state.started = false;
    }
  },
});
