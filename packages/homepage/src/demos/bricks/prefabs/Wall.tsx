import * as React from 'react';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { game } from '../game';

export const Wall = game.prefab({
  name: 'Wall',
  stores: {
    transform: game.stores.transform(),
    bodyConfig: game.stores.bodyConfig(),
  },
  Component: ({ stores }) => {
    return <div className="Wall" ref={useBodyRef(stores)} />;
  },
});
