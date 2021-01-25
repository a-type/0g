import { Component } from './Component';

/** @deprecated */
export type ComponentInstance = Component;

export type ComponentType = {
  new (): Component;
  id: number;
  builtinKeys: string[];
  defaultValues: any;
};

export type ComponentInstanceFor<S extends ComponentType> = S extends {
  new (): infer T;
}
  ? T
  : never;

export type ComponentTypeFor<I extends ComponentInstance> = {
  new (): I;
  id: number;
  builtinKeys: string[];
  defaultValues: any;
};
