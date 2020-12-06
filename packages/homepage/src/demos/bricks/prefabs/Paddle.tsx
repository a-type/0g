import * as React from 'react';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { game } from '../game';

export const Paddle = game.prefab({
  name: 'Paddle',
  stores: {
    transform: game.stores.transform(),
    bodyConfig: game.stores.bodyConfig(),
    body: game.stores.body(),
    forces: game.stores.forces(),
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
