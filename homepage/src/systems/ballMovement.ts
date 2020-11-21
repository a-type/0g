import { forces } from '../stores/forces';
import { r2d } from '../../../src';
import { transform } from '../stores/transform';

export const ballMovement = r2d.system({
  stores: {
    forces: forces,
    transform: transform,
  },
  state: {
    started: false,
  },
  run: (stores, state) => {
    if (!state.started) {
      state.started = true;
      stores.transform.x = 0;
      stores.transform.y = 0;
      stores.forces.velocity = {
        x: 0,
        y: 3,
      };
    }

    if (stores.transform.y > 400) {
      state.started = false;
    }
  },
});
