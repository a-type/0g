import { ComponentHandle } from './Component2.js';

export type Has<Comp extends ComponentHandle> = {
  Component: Comp;
  kind: 'has';
  __isFilter: true;
  toString(): string;
};

export const has = <Comp extends ComponentHandle>(
  Component: Comp,
): Has<Comp> => ({
  Component,
  kind: 'has',
  __isFilter: true,
  toString() {
    return `has(${Component.name})`;
  },
});

export type Not<Comp extends ComponentHandle> = {
  Component: Comp;
  kind: 'not';
  __isFilter: true;
  toString(): string;
};

export const not = <Comp extends ComponentHandle>(
  Component: Comp,
): Not<Comp> => ({
  Component,
  kind: 'not',
  __isFilter: true,
  toString() {
    return `not(${Component.name})`;
  },
});

export type Changed<Comp extends ComponentHandle> = {
  Component: Comp;
  kind: 'changed';
  __isFilter: true;
  toString(): string;
};

export const changed = <Comp extends ComponentHandle>(
  Component: Comp,
): Changed<Comp> => ({
  Component,
  kind: 'changed',
  __isFilter: true,
  toString() {
    return `changed(${Component.name})`;
  },
});

export type Any<Comps extends ComponentHandle[]> = {
  Components: Comps;
  kind: 'any';
  __isFilter: true;
  toString(): string;
};

export const any = <Comps extends ComponentHandle[]>(
  ...Components: Comps
): Any<Comps> => ({
  Components,
  kind: 'any',
  __isFilter: true,
  toString() {
    return `any(${Components.map((Comp) => Comp.name).join(', ')})`;
  },
});

export type Filter<Comp extends ComponentHandle> =
  | Not<Comp>
  | Has<Comp>
  | Changed<Comp>
  | Any<Comp[]>;

export const isFilter = (thing: any): thing is Filter<any> =>
  thing.__isFilter === true;

export const isNotFilter = (fil: Filter<any>): fil is Not<ComponentHandle> =>
  fil.kind === 'not';

export const isHasFilter = (fil: Filter<any>): fil is Has<ComponentHandle> =>
  fil.kind === 'has';

export const isChangedFilter = (
  fil: Filter<any>,
): fil is Changed<ComponentHandle> => fil.kind === 'changed';

export const isAnyFilter = (fil: Filter<any>): fil is Any<ComponentHandle[]> =>
  fil.kind === 'any';
