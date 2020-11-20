import * as React from 'react';
import { paddleMovement } from 'src/systems/paddleMovement';
import { rigidBody } from 'src/systems/rigidBody';
import { prefab } from '../../../src';
import { animated, useSpring } from '@react-spring/web';

export const Paddle = prefab({
  name: 'Paddle',
  systems: {
    rigidBody: rigidBody,
    movement: paddleMovement,
  },
  Component: ({ stores }) => {
    const style = useSpring({
      x: stores.transform.x,
      y: stores.transform.y,
    });

    return <animated.div style={style} />;
  },
});
