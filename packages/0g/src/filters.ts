import { ComponentType } from './Component';

export type Has<Comp extends ComponentType<any>> = {
  Component: Comp;
  kind: 'has';
  __isFilter: true;
  toString(): string;
};

export const has = <Comp extends ComponentType<any>>(
  Component: Comp,
): Has<Comp> => ({
  Component,
  kind: 'has',
  __isFilter: true,
  toString() {
    return `has(${Component.name})`;
  },
});

export type Not<Comp extends ComponentType<any>> = {
  Component: Comp;
  kind: 'not';
  __isFilter: true;
  toString(): string;
};

export const not = <Comp extends ComponentType<any>>(
  Component: Comp,
): Not<Comp> => ({
  Component,
  kind: 'not',
  __isFilter: true,
  toString() {
    return `not(${Component.name})`;
  },
});

export type Changed<Comp extends ComponentType<any>> = {
  Component: Comp;
  kind: 'changed';
  __isFilter: true;
  toString(): string;
};

export const changed = <Comp extends ComponentType<any>>(
  Component: Comp,
): Changed<Comp> => ({
  Component,
  kind: 'changed',
  __isFilter: true,
  toString() {
    return `changed(${Component.name})`;
  },
});

export type Any<Comps extends ComponentType<any>[]> = {
  Components: Comps;
  kind: 'any';
  __isFilter: true;
  toString(): string;
};

export const any = <Comps extends ComponentType<any>[]>(
  ...Components: Comps
): Any<Comps> => ({
  Components,
  kind: 'any',
  __isFilter: true,
  toString() {
    return `any(${Components.map((Comp) => Comp.name).join(', ')})`;
  },
});

export type Filter<Comp extends ComponentType<any>> =
  | Not<Comp>
  | Has<Comp>
  | Changed<Comp>
  | Any<Comp[]>;

export const isFilter = (thing: any): thing is Filter<any> =>
  thing.__isFilter === true;

export const isNotFilter = (fil: Filter<any>): fil is Not<ComponentType<any>> =>
  fil.kind === 'not';

export const isHasFilter = (fil: Filter<any>): fil is Has<ComponentType<any>> =>
  fil.kind === 'has';

export const isChangedFilter = (
  fil: Filter<any>,
): fil is Changed<ComponentType<any>> => fil.kind === 'changed';

export const isAnyFilter = (
  fil: Filter<any>,
): fil is Any<ComponentType<any>[]> => fil.kind === 'any';
