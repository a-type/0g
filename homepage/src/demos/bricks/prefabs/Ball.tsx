import * as React from 'react';
import * as r2d from '../../../../..';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { bodyConfig } from '../../../common/stores/bodyConfig';
import { transform } from '../../../common/stores/transform';
import { forces } from '../../../common/stores/forces';
import { contacts } from '../../../common/stores/contacts';
import { body } from '../../../common/stores/body';

export const Ball = r2d.prefab({
  name: 'Ball',
  stores: {
    bodyConfig: bodyConfig(),
    transform: transform(),
    forces: forces(),
    contacts: contacts(),
    body: body(),
    config: r2d.store('ballConfig', { speed: 12 })(),
    // useDemoMovement: r2d.store('blah', { ye: true })(),
  },
  ManualComponent: ({ stores }) => {
    return <span ref={useBodyRef(stores)} className="Ball" />;
  },
});
