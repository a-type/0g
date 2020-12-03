import * as React from 'react';
import * as r2d from '../../../../..';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { box2d } from '../../../common/plugins';

export const Ball = r2d.prefab({
  name: 'Ball',
  stores: {
    bodyConfig: box2d.stores.bodyConfig(),
    transform: box2d.stores.transform(),
    forces: box2d.stores.forces(),
    contacts: box2d.stores.contacts(),
    body: box2d.stores.body(),
    config: r2d.store('ballConfig', { speed: 12 })(),
  },
  ManualComponent: ({ stores }) => {
    return <span ref={useBodyRef(stores)} className="Ball" />;
  },
});
