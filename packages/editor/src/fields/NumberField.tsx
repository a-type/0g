import { useWatch } from '@0g/react';
import * as React from 'react';
import {
  Field,
  FieldInput,
  FieldLabel,
  FieldInputGroup,
  FieldCurrentValue,
} from '../components/Field';
import { useId } from '../hooks/useId';
import { ComponentFieldProps } from './types';

export type NumberFieldProps = ComponentFieldProps;

export function NumberField({ store, name }: NumberFieldProps) {
  const id = useId();
  const ref = React.useRef<HTMLSpanElement>(null);
  const onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      store.set({ [name]: ev.target.value });
    },
    [store, name],
  );

  useWatch(
    store,
    React.useCallback(() => {
      if (!ref.current) return;
      ref.current.innerText = (store as any)[name];
    }, [store, name, ref]),
  );

  return (
    <Field>
      <FieldLabel htmlFor={id}>{name}</FieldLabel>
      <FieldInputGroup>
        <FieldCurrentValue ref={ref} />
        <FieldInput onBlur={onChange} id={id} type="number" />
      </FieldInputGroup>
    </Field>
  );
}
