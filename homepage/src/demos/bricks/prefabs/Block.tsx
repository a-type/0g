import * as React from 'react';
import { r2d } from '../../../../..';
import { useBodyStyles } from '../../../common/hooks/useBodyStyles';
import { rigidBody } from '../../../common/systems/rigidBody';

export const Block = r2d.prefab({
  name: 'Block',
  systems: {
    rigidBody: rigidBody,
  },
  Component: ({ stores }) => {
    return <button style={useBodyStyles(stores)}>Boop</button>;
  },
});
