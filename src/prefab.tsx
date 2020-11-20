import React, { FC, memo } from 'react';
import { useProxy } from 'valtio';
import { logger } from './logger';
import { Prefab, PrefabConfig, PrefabRenderProps, Systems } from './types';

/**
 * Wraps the reactive ("plain") component's stores prop with
 * useProxy so the component will react to changes.
 */
function wrapReactiveComponent<S extends Systems>(
  Component: FC<PrefabRenderProps<S>>
): FC<PrefabRenderProps<S>> {
  return function ReactivePrefabComponent({ stores, ...rest }) {
    const snapshot = useProxy(stores as any);
    return <Component {...rest} stores={snapshot} />;
  };
}

export function prefab<S extends Systems = Systems>(
  config: PrefabConfig<S>
): Prefab<S> {
  if (config.Component && config.ManualComponent) {
    logger.warn(
      `Both Component and ManualComponent were supplied to ${config.name} - Component will be used`
    );
  }

  const Component = config.Component
    ? wrapReactiveComponent(config.Component)
    : config.ManualComponent;

  if (!Component) {
    throw new Error(
      `One of Component or ManualComponent must be supplied to prefab ${config.name}`
    );
  }

  Component.displayName = config.name;

  return {
    ...config,
    Component: memo(Component),
  };
}
