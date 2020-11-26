import { r2d } from '../../../..';
import { EntityContact } from '../plugins/box2d';

export const contacts = r2d.store({
  /** began since last frame */
  began: new Array<EntityContact>(),
  /** all contacts this frame */
  current: new Array<EntityContact>(),
  /** ended since last frame (not in current) */
  ended: new Array<EntityContact>(),
});
