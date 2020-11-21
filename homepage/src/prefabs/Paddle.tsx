import * as React from 'react';
import { paddleMovement } from '../systems/paddleMovement';
import { rigidBody } from '../systems/rigidBody';
import { r2d } from '../../../src';
import { useBodyRef } from '../hooks/useBodyRef';

export const Paddle = r2d.prefab({
  name: 'Paddle',
  systems: {
    rigidBody: rigidBody,
    movement: paddleMovement,
  },
  ManualComponent: ({ stores }) => {
    return (
      <input
        placeholder="I'm a paddle"
        className="Paddle"
        ref={useBodyRef(stores)}
      />
    );
  },
});
