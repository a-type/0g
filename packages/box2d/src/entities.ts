import { entity } from '0g';
import { worldConfig } from './stores';

export const Physics = entity(
  'Physics',
  {
    worldConfig: worldConfig(),
  },
  () => null
);
