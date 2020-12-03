import * as r2d from '../../../../../..';
import { EntityContact } from '../box2d';

export const contacts = r2d.store('contacts', {
  /** began since last frame */
  began: new Array<EntityContact>(),
  /** all contacts this frame */
  current: new Array<EntityContact>(),
  /** ended since last frame (not in current) */
  ended: new Array<EntityContact>(),
});
