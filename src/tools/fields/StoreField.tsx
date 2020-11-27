import * as React from 'react';
import { Store } from '../../types';
import { useStoreField, StoreFieldKind } from './useStoreField';
import {
  Input,
  NumberInput,
  Textarea,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';

export type StoreFieldProps = {
  name: string;
  store: Store;
  className?: string;
};

export function StoreField({ name, store, ...rest }: StoreFieldProps) {
  const [ref, { kind }] = useStoreField(store, name);

  return (
    <label {...rest}>
      <div>{name}</div>
      <StoreInput name={name} kind={kind} ref={ref} />
    </label>
  );
}

const StoreInput = React.forwardRef<
  any,
  {
    kind: StoreFieldKind;
    ref: any;
    name: string;
  }
>(({ kind, name }, ref) => {
  switch (kind) {
    case StoreFieldKind.Number:
      return (
        <NumberInput>
          <NumberInputField ref={ref} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      );
    case StoreFieldKind.String:
      return <Input ref={ref} />;
    case StoreFieldKind.Object:
      return <Textarea ref={ref} />;
    default:
      return <div>unsupported</div>;
  }
});
