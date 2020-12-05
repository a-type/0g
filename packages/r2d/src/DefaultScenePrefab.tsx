import * as React from 'react';
import { children } from './children';
import { Children } from './components/Children';
import { prefab } from './prefab';

export const DefaultScenePrefab = prefab({
  name: 'Scene',
  stores: {
    children: children(),
  },
  ManualComponent: ({ stores: { children } }) =>
    children ? (
      <>
        <Children entities={children} />
      </>
    ) : null,
});
