import * as React from 'react';
import { ballMovement } from '../systems/ballMovement';
import { rigidBody } from '../../../common/systems/rigidBody';
import { r2d } from '../../../../..';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
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
