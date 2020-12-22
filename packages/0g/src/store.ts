import { makeAutoObservable } from 'mobx';
import shortid from 'shortid';
import { ObjectPool } from './internal/objectPool';

export type StoreSpec<Shape extends {} = {}> = {
  key: string;
  acquire(): Shape;
  release(inst: Shape): void;
  role: 'persistent' | 'state';
};

export function store<Shape extends {}>(
  Prototype: { new (): Shape },
  role: 'persistent' | 'state' = 'persistent',
  key = `store-${shortid()}`,
): StoreSpec<Shape> {
  const pool = new ObjectPool(() => {
    return makeAutoObservable(new Prototype());
  });

  return {
    key,
    acquire() {
      const inst = pool.acquire();
      return inst;
    },
    release(inst: Shape) {
      pool.release(inst);
    },
    role,
  };
}

export type StoreShape<Spec extends StoreSpec> = Spec extends StoreSpec<
  infer Shape
>
  ? Shape
  : never;
