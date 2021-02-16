import { State } from './State';

export type StateTypeFor<I extends State<any>> = {
  new (): I;
};

export type StateComponentDeps<S extends State<any>> = S extends State<infer D>
  ? D
  : never;
