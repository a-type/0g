import { EventEmitter } from 'events';
import { Poolable } from '../internal/objectPool';

export declare interface Component {
  on(event: 'change', callback: (id: number) => void): this;
  off(event: 'change', callback: (id: number) => void): this;
}

export class Component extends EventEmitter implements Poolable {
  static defaultValues: any = {};
  static builtinKeys: string[] = Object.getOwnPropertyNames(new Component());
  static id: number = 0;
  __alive = true;
  ___version = 0;
  __type: number = 0;
  id: number = 0;

  constructor() {
    super();
    this.__type = Object.getPrototypeOf(this).constructor.id;
  }

  get type() {
    return this.__type;
  }

  set<T extends Component>(this: T, values: Partial<T>) {
    Object.assign(this, values);
    this.mark();
  }

  mark() {
    this.___version++;
    this.emit('change', this.id);
  }

  reset = () => {
    this.set(Object.getPrototypeOf(this).constructor.defaultValues);
    this.___version = 0;
    this.emit('change', this.id);
  };
}
