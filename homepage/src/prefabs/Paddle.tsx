import * as React from 'react';
import { paddleMovement } from '../systems/paddleMovement';
import { rigidBody } from '../systems/rigidBody';
import { r2d } from '../../../src';
import { useBodyStyles } from '../hooks/useBodyStyles';

export const Paddle = r2d.prefab({
  name: 'Paddle',
  systems: {
    rigidBody: rigidBody,
    movement: paddleMovement,
  },
  Component: ({ stores }) => {
    return (
      <input
        placeholder="I'm a paddle"
        className="Paddle"
        style={useBodyStyles(stores)}
      />
    );
  },
});
