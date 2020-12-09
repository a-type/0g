import { makeAutoObservable } from 'mobx';
import { EntityData } from '../types';

export class WorldState {
  entities: Record<string, EntityData> = {};
  get ids() {
    return Object.keys(this.entities);
  }
  has(id: string) {
    return !!this.entities[id];
  }

  constructor(initial: Record<string, EntityData>) {
    this.entities = initial;
    makeAutoObservable(this);
  }
}
