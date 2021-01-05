import * as React from 'react';
import { AutoField } from './AutoField';
import { ComponentFieldProps } from './types';

export function ComponentField({ store, name }: ComponentFieldProps) {
  // TODO: custom field specs
  return <AutoField store={store} name={name} />;
}
