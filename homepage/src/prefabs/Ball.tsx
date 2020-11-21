import * as React from 'react';
import { animated, useSpring } from '@react-spring/web';
import { ballMovement } from '../systems/ballMovement';
import { rigidBody } from '../systems/rigidBody';
import { r2d } from '../../../src';

export const Ball = r2d.prefab({
  name: 'Ball',
  systems: {
    rigidBody: rigidBody,
    movement: ballMovement,
  },
  Component: ({ stores }) => {
    const style = useSpring({
      x: stores.transform.x,
      y: stores.transform.y,
      width:
        stores.bodyConfig.shape === 'circle' ? stores.bodyConfig.radius * 2 : 0,
      height:
        stores.bodyConfig.shape === 'circle' ? stores.bodyConfig.radius * 2 : 0,
    });

    return <animated.span style={style} className="Ball" />;
  },
});
