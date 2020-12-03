import * as React from 'react';
import * as r2d from '../../../../..';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { box2d } from '../../../common/plugins';

export const Paddle = r2d.prefab({
  name: 'Paddle',
  stores: {
    transform: box2d.stores.transform(),
    bodyConfig: box2d.stores.bodyConfig(),
    body: box2d.stores.body(),
    forces: box2d.stores.forces(),
  },
  ManualComponent: ({ stores }) => {
    return (
      <input
        placeholder="I'm a paddle"
        className="Paddle"
        ref={useBodyRef(stores)}
      />
    );
  },
});
