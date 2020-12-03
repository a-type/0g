import * as React from 'react';
import * as r2d from '../../../../..';
import { useBodyStyles } from '../../../common/hooks/useBodyStyles';
import { box2d } from '../../../common/plugins';

export const Block = r2d.prefab({
  name: 'Block',
  stores: {
    transform: box2d.stores.transform(),
    bodyConfig: box2d.stores.bodyConfig(),
    contacts: box2d.stores.contacts(),
    forces: box2d.stores.forces(),
  },
  Component: ({ stores }) => {
    return <button style={useBodyStyles(stores)}>Boop</button>;
  },
});
