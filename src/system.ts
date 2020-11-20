import { Stores, BasicSystemState, SystemConfigObject, System } from './types';

// export function system<S extends Stores, A extends BasicSystemState, W>(
//   config: SystemConfig<S, A, W>
// ): SystemCreator<S, A, W> {
//   return (context) => {
//     const { state, ...restCfg } =
//       typeof config === 'function' ? config(context) : config;
//     return {
//       ...restCfg,
//       state: (typeof state === 'function' ? state() : state) || ({} as A),
//     };
//   };
// }

export function system<S extends Stores, A extends BasicSystemState>(
  config: SystemConfigObject<S, A>
): System<S, A> {
  const { state, ...cfg } = config;
  return {
    ...cfg,
    state: typeof state === 'function' ? state() : state || ({} as A),
  };
}
