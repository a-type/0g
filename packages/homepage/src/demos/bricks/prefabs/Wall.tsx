import * as React from 'react';
import * as r2d from 'r2d';
import { box2d } from '../../../common/plugins';
import { useBodyRef } from '../../../common/hooks/useBodyRef';

export const Wall = r2d.prefab({
  name: 'Wall',
  stores: {
    transform: box2d.stores.transform(),
    bodyConfig: box2d.stores.bodyConfig(),
  },
  Component: ({ stores }) => {
    return <div className="Wall" ref={useBodyRef(stores)} />;
  },
});
