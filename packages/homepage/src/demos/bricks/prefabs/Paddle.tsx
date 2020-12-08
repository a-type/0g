import * as React from 'react';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { SIZE } from '../constants';
import { game } from '../game';

export const Paddle = game.prefab({
  name: 'Paddle',
  stores: {
    transform: game.stores.transform(),
    body: game.stores.body({
      config: {
        shape: 'rectangle',
        density: 1,
        width: SIZE / 3,
        height: SIZE / 20,
        restitution: 1,
        angle: 0,
        friction: 0.25,
        fixedRotation: true,
      },
    }),
  },
  Component: ({ stores }) => {
    return (
      <input
        placeholder="I'm a paddle"
        className="Paddle"
        ref={useBodyRef(stores)}
      />
    );
  },
});
