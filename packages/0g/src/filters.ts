import { Component, ComponentType } from './components';

export type Has<Comp extends ComponentType> = {
  Component: Comp;
  kind: 'has';
  __isFilter: true;
};

export const has = <Comp extends ComponentType>(
  Component: Comp,
): Has<Comp> => ({
  Component,
  kind: 'has',
  __isFilter: true,
});

export type Not<Comp extends ComponentType> = {
  Component: Comp;
  kind: 'not';
  __isFilter: true;
};

export const not = <Comp extends ComponentType>(
  Component: Comp,
): Not<Comp> => ({
  Component,
  kind: 'not',
  __isFilter: true,
});

export type Changed<Comp extends ComponentType> = {
  Component: Comp;
  kind: 'changed';
  __isFilter: true;
};

export const changed = <Comp extends ComponentType>(
  Component: Comp,
): Changed<Comp> => ({
  Component,
  kind: 'changed',
  __isFilter: true,
});

export type Filter<Comp extends ComponentType> =
  | Not<Comp>
  | Has<Comp>
  | Changed<Comp>;

export type ComponentForFilter<Fil extends Filter<any>> = Fil extends Not<
  infer C
>
  ? C
  : Fil extends Component
  ? Component
  : never;

export const isFilter = (thing: any): thing is Filter<any> =>
  thing.__isFilter === true;

export const isNotFilter = (fil: Filter<any>): fil is Not<ComponentType> =>
  fil.kind === 'not';

export const isHasFilter = (fil: Filter<any>): fil is Has<ComponentType> =>
  fil.kind === 'has';
