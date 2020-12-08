import * as React from 'react';
import { System } from '../system';
import { Prefab, Stores, Plugin } from '../types';

export function withConfig(
  prefabs: Record<string, Prefab<Stores>>,
  systems: System<any, any>[],
  plugins: Record<string, Plugin>
) {
  return function <
    P extends {
      prefabs: Record<string, Prefab<Stores>>;
      systems: System<any, any>[];
      plugins?: Record<string, Plugin>;
    }
  >(
    Component: React.ComponentType<P>
  ): React.ComponentType<Omit<P, 'prefabs' | 'systems' | 'plugins'>> {
    return (props: Omit<P, 'systems' | 'prefabs' | 'plugins'>) => (
      <Component
        {...(props as any)}
        systems={systems}
        prefabs={prefabs}
        plugins={plugins}
      />
    );
  };
}
