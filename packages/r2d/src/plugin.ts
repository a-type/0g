import { Plugin, Store } from './types';

export function plugin<
  API extends Record<string, unknown>,
  Stores extends Record<string, Store<string, any, any>>
>(config: Plugin<API, Stores>) {
  return config;
}
