import { Plugin, StoreCreator } from './types';

export function plugin<
  API extends Record<string, unknown>,
  Stores extends Record<string, StoreCreator<string, any>>
>(config: Plugin<API, Stores>) {
  return config;
}
