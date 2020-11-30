import { r2d } from '../../../..';
import { spriteConfig } from '../stores/spriteConfig';

export const sprite = r2d.system<{
  spriteConfig: ReturnType<typeof spriteConfig>;
}>({
  name: 'sprite',
  runsOn: (prefab) => !!prefab.stores.sprite,
  run: () => {
    // Doesn't do anything... yet
    return;
  },
});
