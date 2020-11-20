import { input } from 'src/stores/input';
import { system } from '../../../src';

export const paddleMovement = system({
  stores: {
    input: input,
  },
  run: () => {
    return;
  },
});
