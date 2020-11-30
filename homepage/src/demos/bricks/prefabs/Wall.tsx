import * as React from 'react';
import { r2d } from '../../../../..';
import { useBodyStyles } from '../../../common/hooks/useBodyStyles';
import { bodyConfig } from '../../../common/stores/bodyConfig';
import { transform } from '../../../common/stores/transform';

export const Wall = r2d.prefab({
  name: 'Wall',
  stores: {
    transform: transform(),
    bodyConfig: bodyConfig(),
  },
  Component: ({ stores }) => {
    return <div className="Wall" style={useBodyStyles(stores)} />;
  },
});
