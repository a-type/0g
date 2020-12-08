import * as React from 'react';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { SIZE } from '../constants';
import { game } from '../game';

export const Wall = game.prefab({
  name: 'Wall',
  stores: {
    transform: game.stores.transform(),
    body: game.stores.body({
      config: {
        shape: 'rectangle',
        width: 5,
        height: SIZE,
        restitution: 1,
        isStatic: true,
        friction: 0,
      },
    }),
  },
  Component: ({ stores }) => {
    return <div className="Wall" ref={useBodyRef(stores)} />;
  },
});
