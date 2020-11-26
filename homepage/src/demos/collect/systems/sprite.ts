import { r2d } from '../../../../..';
import { SpritesheetName } from '../assets';

export const sprite = r2d.system({
  stores: {
    sprite: r2d.store({
      sheetName: 'characters' as SpritesheetName,
      sheetX: 0,
      sheetY: 0,
      sheetWidth: 64,
      sheetHeight: 64,
    }),
  },
  run: () => {
    return;
  },
});
