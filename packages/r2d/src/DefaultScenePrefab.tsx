import * as React from 'react';
import { children } from './children';
import { Children } from './components/Children';
import { Prefab } from './types';

export const DefaultScenePrefab: Prefab<{
  children: ReturnType<typeof children>;
}> = {
  name: 'Scene',
  stores: {
    children: children(),
  },
  Component: ({ stores: { children } }) =>
    children ? (
      <>
        <Children entities={children} />
      </>
    ) : null,
};
