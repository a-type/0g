import * as React from 'react';
import { Store } from '../../types';
import { NumberField } from './NumberField';
import { StringField } from './StringField';
import { VectorField } from './VectorField';
import { ObjectField } from './ObjectField';

export type StoreFieldProps = {
  name: string;
  store: Store;
  className?: string;
};

export enum StoreFieldKind {
  String,
  Number,
  Object,
  Vector,
  Unsupported,
}

export function StoreField({ name, store, ...rest }: StoreFieldProps) {
  return (
    <label {...rest}>
      <div>{name}</div>
      <StoreInput name={name} store={store} />
    </label>
  );
}

function inferFieldKind(value: any) {
  if (typeof value === 'string') {
    return StoreFieldKind.String;
  }
  if (typeof value === 'number') {
    return StoreFieldKind.Number;
  }
  if (value?.x && value?.y) {
    return StoreFieldKind.Vector;
  }
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'object' && value!.constructor === Object)
  ) {
    return StoreFieldKind.Object;
  }
  return StoreFieldKind.Unsupported;
}

const StoreInput = (props: { store: Store; name: string }) => {
  const kind = inferFieldKind(props.store[props.name]);

  switch (kind) {
    case StoreFieldKind.Number:
      return <NumberField {...props} />;
    case StoreFieldKind.String:
      return <StringField {...props} />;
    case StoreFieldKind.Object:
      return <ObjectField {...props} />;
    case StoreFieldKind.Vector:
      return <VectorField {...props} />;
    default:
      return <div>unsupported</div>;
  }
};
