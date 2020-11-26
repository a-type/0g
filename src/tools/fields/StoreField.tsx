import * as React from 'react';
import { Store } from '../../types';
import { useStoreField, StoreFieldKind } from './useStoreField';

export type StoreFieldProps = {
  name: string;
  store: Store;
  className?: string;
};

export function StoreField({ name, store, ...rest }: StoreFieldProps) {
  const [ref, { kind }] = useStoreField(store, name);

  const Element = kind === StoreFieldKind.Object ? 'textarea' : 'input';

  if (kind === StoreFieldKind.Unsupported) return <div>{name} unsupported</div>;

  return (
    <label {...rest}>
      <div>{name}</div>
      <Element ref={ref} data-field-kind={kind} />
    </label>
  );
}
