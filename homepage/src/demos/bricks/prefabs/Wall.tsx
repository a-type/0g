import * as React from 'react';
import { r2d } from '../../../../..';
import { useBodyStyles } from '../../../common/hooks/useBodyStyles';
import { rigidBody } from '../../../common/systems/rigidBody';

export const Wall = r2d.prefab({
  name: 'Wall',
  systems: {
    rigidBody: rigidBody,
  },
  Component: ({ stores }) => {
    return <div className="Wall" style={useBodyStyles(stores)} />;
  },
});
