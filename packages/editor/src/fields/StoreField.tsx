import { StoreInstance } from '0g';
import * as React from 'react';
import { AutoField } from './AutoField';
import { StoreFieldProps } from './types';

export function StoreField({ store, name }: StoreFieldProps) {
  // TODO: custom field specs
  return <AutoField store={store} name={name} />;
}
