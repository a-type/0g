import * as React from 'react';
import { r2d } from '../../../../..';
import { useBodyRef } from '../../../common/hooks/useBodyRef';
import { transform } from '../../../common/stores/transform';
import { bodyConfig } from '../../../common/stores/bodyConfig';
import { body } from '../../../common/stores/body';
import { forces } from '../../../common/stores/forces';

export const Paddle = r2d.prefab({
  name: 'Paddle',
  stores: {
    transform: transform(),
    bodyConfig: bodyConfig(),
    body: body(),
    forces: forces(),
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
