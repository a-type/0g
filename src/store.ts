import { Store } from './types';

export function store<S extends Store>(shape: S): S {
  return shape;
}
