import * as g from '0g';

export const spawnerConfig = g.store('spawnerConfig', {
  blocks: [
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
  ],
  blockWidth: 5,
  blockHeight: 2.5,
});
