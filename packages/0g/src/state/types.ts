import { State, StateAPI, StateCreator } from './State';

export type StateTypeFor<I extends StateAPI<any>> = {
  new (): I;
  id: number;
};

export type StateComponentDeps<S extends StateAPI<any>> = S extends StateAPI<
  infer D
>
  ? D
  : never;

export type StateType = StateTypeFor<StateAPI<any>>;

export type StateInstanceFor<
  S extends StateCreator<any>
> = S extends StateCreator<infer D> ? State<D> : never;
