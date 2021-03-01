import { ComponentInstance } from '0g';
import * as React from 'react';
import { NumberField } from './NumberField';
import { StringField } from './StringField';

export type AutoFieldProps = {
  store: ComponentInstance<unknown>;
  name: string;
};

type SupportedTypes = 'string' | 'number';

function getType(
  store: ComponentInstance<unknown>,
  name: string,
): SupportedTypes | null {
  // get the constructor
  const Constructor = Object.getPrototypeOf(store).constructor;
  // default value of the field
  const defaultValue = Constructor.defaultValues[name];

  if (typeof defaultValue === 'object') {
    // differentiate array vs obj
  } else {
    switch (typeof defaultValue) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
    }
  }

  return null;
}

export function AutoField(props: AutoFieldProps) {
  // heuristic for deciding which field to render
  const type = getType(props.store, props.name);

  switch (type) {
    case 'string':
      return <StringField {...props} />;
    case 'number':
      return <NumberField {...props} />;
    default:
      return null;
  }
}
