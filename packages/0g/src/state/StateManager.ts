import { ComponentType } from '../components';
import { EntityImpostor } from '../EntityImpostor';
import { Game } from '../Game';
import { State, StateCreator } from './State';
import { StatePool } from './StatePool';

export class StateManager {
  private stateTypeIndex: number[];
  private pools = new Array<StatePool<State<any>>>();
  private instances = new Array<Array<State<any>>>();

  constructor(
    private stateTypes: Array<StateCreator<ComponentType[]>>,
    game: Game,
  ) {
    this.stateTypeIndex = [];
    stateTypes.forEach((stateType, idx) => {
      stateType.id = game.idManager.get();
      this.stateTypeIndex[stateType.id] = idx;
    });
  }

  acquire = (typeId: number, entity: EntityImpostor<any>) => {
    return this.pools[this.getTypeIndex(typeId)].acquire(entity);
  };

  release = (typeId: number, instance: State<any>) => {
    return this.pools[this.getTypeIndex(typeId)].release(instance);
  };

  getMatchingStates = (componentTypes: ComponentType[]) => {
    return this.stateTypes.filter((state) => {
      for (const dep of state.dependencies) {
        if (!componentTypes.includes(dep)) {
          return false;
        }
      }
      return true;
    });
  };

  get = (entityId: number, stateTypeId: number) => {};

  private getTypeIndex(stateTypeId: number) {
    return this.stateTypeIndex[stateTypeId];
  }
}
