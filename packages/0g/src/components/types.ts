import { Component } from './Component';
import { StateComponent } from './StateComponent';

export type ComponentInstance = Component | StateComponent;

export type ComponentType =
  | { new (): Component; id: number; builtinKeys: string[]; defaultValues: any }
  | {
      new (): StateComponent;
      id: number;
      builtinKeys: string[];
      defaultValues: any;
    };
export type ComponentInstanceFor<S extends ComponentType> = S extends {
  new (): infer T;
}
  ? T
  : never;
