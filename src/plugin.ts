import { PluginConfig } from './types';

export function plugin<API extends Record<string, unknown>>(config: PluginConfig<API>) {
  return config;
}
