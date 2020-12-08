import * as React from 'react';
import { game } from '../game';
import { useBodyRef } from '../../../common/hooks/useBodyRef';

export const Ball = game.prefab({
  name: 'Ball',
  stores: {
    transform: game.stores.transform(),
    contacts: game.stores.contacts(),
    body: game.stores.body({
      config: {
        shape: 'circle',
        radius: 1,
        fixedRotation: true,
        friction: 0.25,
        restitution: 1,
        bullet: true,
      },
    }),
    config: game.stores.ballConfig(),
  },
  Component: ({ stores }) => {
    return <span ref={useBodyRef(stores)} className="Ball" />;
  },
});
