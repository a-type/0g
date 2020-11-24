import * as React from 'react';
import { prefab } from './prefab';

export const DefaultScenePrefab = prefab({
  name: 'Scene',
  systems: {},
  ManualComponent: ({ children }) => <>{children}</>,
});
