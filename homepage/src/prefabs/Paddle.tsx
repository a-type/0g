import * as React from 'react';
import { paddleMovement } from '../systems/paddleMovement';
import { rigidBody } from '../systems/rigidBody';
import { r2d } from '../../../src';
import { animated, useSpring } from '@react-spring/web';

export const Paddle = r2d.prefab({
  name: 'Paddle',
  systems: {
    rigidBody: rigidBody,
    movement: paddleMovement,
  },
  Component: ({ stores }) => {
    const style = useSpring({
      x: stores.transform.x,
      y: stores.transform.y,
      width:
        stores.bodyConfig.shape === 'rectangle' ? stores.bodyConfig.width : 0,
      height:
        stores.bodyConfig.shape === 'rectangle' ? stores.bodyConfig.height : 0,
    });

    return (
      <animated.input
        placeholder="I'm a paddle"
        className="Paddle"
        style={style}
      />
    );
  },
});
