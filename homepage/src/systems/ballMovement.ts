import { forces } from '../stores/forces';
import { r2d } from '../../../src';

export const ballMovement = r2d.system({
  stores: {
    forces: forces,
  },
  state: {
    started: false,
  },
  run: (stores, state) => {
    if (!state.started) {
      state.started = true;
      stores.forces.velocity = {
        x: 0,
        y: 3,
      };
    }
  },
});
