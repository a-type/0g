import { transform } from 'src/stores/transform';
import { system } from '../../../src';

export const rigidBody = system({
  stores: {
    transform: transform,
  },
  run: () => {
    return;
  },
});
