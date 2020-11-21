import * as React from 'react';
import { ballMovement } from '../systems/ballMovement';
import { rigidBody } from '../systems/rigidBody';
import { r2d } from '../../../src';
import { useBodyStyles } from '../hooks/useBodyStyles';

export const Ball = r2d.prefab({
  name: 'Ball',
  systems: {
    rigidBody: rigidBody,
    movement: ballMovement,
  },
  Component: ({ stores }) => {
    return <span style={useBodyStyles(stores)} className="Ball" />;
  },
});
