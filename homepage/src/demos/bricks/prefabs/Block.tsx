import * as React from 'react';
import * as r2d from '../../../../..';
import { useBodyStyles } from '../../../common/hooks/useBodyStyles';
import { bodyConfig } from '../../../common/stores/bodyConfig';
import { contacts } from '../../../common/stores/contacts';
import { forces } from '../../../common/stores/forces';
import { transform } from '../../../common/stores/transform';

export const Block = r2d.prefab({
  name: 'Block',
  stores: {
    transform: transform(),
    bodyConfig: bodyConfig(),
    contacts: contacts(),
    forces: forces(),
  },
  Component: ({ stores }) => {
    return <button style={useBodyStyles(stores)}>Boop</button>;
  },
});
