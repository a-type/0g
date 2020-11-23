import * as React from 'react';
import { ballMovement } from '../systems/ballMovement';
import { rigidBody } from '../systems/rigidBody';
import { r2d } from '../../../src';
import { useBodyRef } from '../hooks/useBodyRef';
import { brickBreaker } from '../systems/brickBreaker';

export const Ball = r2d.prefab({
  name: 'Ball',
  systems: {
    rigidBody: rigidBody,
    movement: ballMovement,
    brickBreaker: brickBreaker,
  },
  ManualComponent: ({ stores }) => {
    return <span ref={useBodyRef(stores)} className="Ball" />;
  },
});
