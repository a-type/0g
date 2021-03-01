import * as React from 'react';
import { useId } from '../hooks/useId';
import { Field, FieldLabel, FieldInput } from '../components/Field';
import { ComponentFieldProps } from './types';
import { useWatch } from '@0g/react';

export type StringFieldProps = ComponentFieldProps;

export function StringField({ store, name }: StringFieldProps) {
  const id = useId();
  const ref = React.useRef<HTMLInputElement>(null);
  const onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      (store as any)[name] = ev.target.value;
      store.updated = true;
    },
    [store, name],
  );

  useWatch(
    store,
    React.useCallback(() => {
      if (!ref.current) return;
      ref.current.value = (store as any)[name];
    }, [store, name, ref]),
  );

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      <FieldInput ref={ref} onBlur={onChange} id={id} />
    </Field>
  );
}
