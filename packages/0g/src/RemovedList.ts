/**
 * Manages "removed" Entities, stuck in limbo between being
 * 'deleted' (from user perspective) and formally returned to
 * pools.
 */
export class RemovedList {
  private _list = new Array<number>();

  add = (entityId: number) => {
    this._list.push(entityId);
  };

  flush = (callback: (entityId: number) => void) => {
    while (this._list.length) {
      callback(this._list.shift()!);
    }
  };
}
