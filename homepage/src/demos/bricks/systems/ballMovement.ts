import { forces } from '../../../common/stores/forces';
import { r2d } from '../../../../..';
import { SIZE } from '../constants';
import { vecGetLength } from 'math2d';
import { Store } from '../../../../../src';
import { transform } from '../../../common/stores/transform';
import { body } from '../../../common/stores/body';

export const ballMovement = r2d.system<
  {
    transform: ReturnType<typeof transform>;
    config: Store<{ speed: number }>;
    body: ReturnType<typeof body>;
    forces: ReturnType<typeof forces>;
  },
  {
    started: boolean;
  }
>({
  name: 'ballMovement',
  runsOn: (prefab) => {
    return prefab.name === 'Ball';
  },
  state: {
    started: false,
  },
  run: (stores, state) => {
    if (!state.started) {
      state.started = true;
      stores.transform.x = 0;
      stores.transform.y = 0;
      const currentSpeed = vecGetLength(stores.body.velocity);
      if (currentSpeed < stores.config.speed) {
        stores.forces.impulse = {
          x: 0,
          y: (stores.config.speed - currentSpeed) * stores.body.mass,
        };
      }
    }

    // if (stores.transform.y > SIZE * 1.5) {
    //   stores.transform.x = 0;
    //   stores.transform.y = 0;
    // }
  },
});
