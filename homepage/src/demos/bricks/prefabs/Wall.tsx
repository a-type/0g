import * as React from 'react';
import * as r2d from '../../../../..';
import { useBodyStyles } from '../../../common/hooks/useBodyStyles';
import { box2d } from '../../../common/plugins';

export const Wall = r2d.prefab({
  name: 'Wall',
  stores: {
    transform: box2d.stores.transform(),
    bodyConfig: box2d.stores.bodyConfig(),
  },
  Component: ({ stores }) => {
    return <div className="Wall" style={useBodyStyles(stores)} />;
  },
});
