import { Component } from './Component';
import { StateComponent } from './StateComponent';

export type ComponentInstance = Component | StateComponent;

export type ComponentType = { new (): Component } | { new (): StateComponent };
export type ComponentInstanceFor<S extends ComponentType> = S extends {
  new (): infer T;
}
  ? T
  : never;
