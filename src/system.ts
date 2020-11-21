import { SystemConfig, System, Plugins, WorldContext, Stores } from './types';

export function system<
  P extends Plugins,
  S extends Stores,
  A extends Record<string, unknown>
>(config: SystemConfig<S, A, WorldContext<P>>): System<S, A, WorldContext<P>> {
  const { state, ...cfg } = config;
  return {
    ...cfg,
    state: state || ({} as A),
  };
}
