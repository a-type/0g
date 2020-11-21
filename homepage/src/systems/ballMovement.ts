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
      // const randomAngle = Math.random() * Math.PI * 2;
      // stores.forces.velocity = {
      //   x: Math.cos(randomAngle) * 3,
      //   y: Math.sin(randomAngle) * 3,
      // };
      stores.forces.velocity = {
        x: 0,
        y: 3,
      };
    }
  },
});
