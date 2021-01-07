import { EventEmitter } from 'events';
import { Poolable } from '../internal/objectPool';

export declare interface BaseComponent {
  on(event: 'change', callback: () => void): this;
  off(event: 'change', callback: () => void): this;
}

export class BaseComponent extends EventEmitter implements Poolable {
  static kind = 'base';
  static defaultValues: any = {};
  static builtinKeys: string[] = Object.getOwnPropertyNames(
    new BaseComponent(),
  );
  static id: number = 0;
  __alive = true;

  ___version = 0;

  get __version() {
    return this.___version;
  }

  set<T extends BaseComponent>(this: T, values: Partial<T>) {
    Object.assign(this, values);
    this.mark();
  }

  mark() {
    this.___version++;
    this.emit('change');
  }

  reset = () => {
    this.set(Object.getPrototypeOf(this).constructor.defaultValues);
    this.___version = 0;
    this.emit('change');
  };
}
