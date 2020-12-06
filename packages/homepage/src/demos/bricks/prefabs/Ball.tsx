import * as React from 'react';
import { game } from '../game';
import { useBodyRef } from '../../../common/hooks/useBodyRef';

export const Ball = game.prefab({
  name: 'Ball',
  stores: {
    bodyConfig: game.stores.bodyConfig(),
    transform: game.stores.transform(),
    forces: game.stores.forces(),
    contacts: game.stores.contacts(),
    body: game.stores.body(),
    config: game.stores.ballConfig(),
  },
  Component: ({ stores }) => {
    return <span ref={useBodyRef(stores)} className="Ball" />;
  },
});
