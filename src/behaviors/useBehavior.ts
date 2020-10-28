import { useMemo, useRef } from 'react';
import { CanvasContext, useFrame } from 'react-three-fiber';

export type UpdateStuff<T> = {
  /** Canvas state, as passed to useFrame */
  context: CanvasContext;
  /** Frame delta in ms, as passed to useFrame */
  delta: number;
  /** The state of this behavior, as defined by you. Mutable. */
  state: T;
};

type BaseApi = {
  [method: string]: (...args: any[]) => any;
};

export type BehaviorStuff<S, A extends BaseApi> = {
  onUpdate?: (things: UpdateStuff<S>) => void;
  makeApi?: (state: S) => A;
  priority?: number;
} & (S extends undefined ? {} : { initialState: S });

export type Behavior<S, A extends BaseApi = {}> = {
  getState: () => S;
} & A;

export function useBehavior<State, Api extends BaseApi = {}>(
  stuff: BehaviorStuff<State, Api>
): Behavior<State, Api> {
  const stateRef = useRef<State>((stuff as any).initialState);

  useFrame((ctx, delta) => {
    stuff.onUpdate?.({
      context: ctx,
      delta,
      state: stateRef.current,
    });
  }, stuff.priority || 0);

  const api: Api = useMemo(() => stuff.makeApi?.(stateRef.current), []) as Api;

  return {
    getState: () => stateRef.current,
    ...api,
  };
}
