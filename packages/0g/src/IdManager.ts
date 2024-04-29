import { incrementIdVersion, SIGNIFIER_MASK } from './ids.js';

/**
 * Provides monotonically increasing ID numbers. Allows
 * releasing unused IDs back to pool.
 */
export class IdManager {
  private recycled = new Array<number>();
  private active = new Array<number>();
  private allocatedCount = 0;

  get() {
    let id: number | undefined;
    id = this.recycled.shift();
    if (!id) {
      if (this.allocatedCount >= SIGNIFIER_MASK) {
        throw new Error('Ran out of IDs');
      }
      // FIXME: incrementing first means ids start at 1
      id = ++this.allocatedCount;
    }
    return id!;
  }

  release(id: number) {
    const index = this.active.indexOf(id);
    if (index === -1) {
      throw new Error(`Tried to release inactive ID ${id}`);
    }
    this.active.splice(index);
    this.recycled.push(incrementIdVersion(id));
  }
}
