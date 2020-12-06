import * as r2d from 'r2d';

export const spawnerConfig = r2d.store('spawnerConfig', {
  blocks: [
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
  ],
  blockWidth: 5,
  blockHeight: 2.5,
});
