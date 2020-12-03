import * as React from 'react';
import { System } from '../system';
import { Prefab, Stores } from '../types';

export function withConfig(
  prefabs: Record<string, Prefab<Stores>>,
  systems: System<any, any>[]
) {
  return function <
    P extends {
      prefabs: Record<string, Prefab<Stores>>;
      systems: System<any, any>[];
    }
  >(
    Component: React.ComponentType<P>
  ): React.ComponentType<Omit<P, 'prefabs' | 'systems'>> {
    return (props: Omit<P, 'systems' | 'prefabs'>) => (
      <Component {...(props as any)} systems={systems} prefabs={prefabs} />
    );
  };
}
