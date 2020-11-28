import {
  InputGroup,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react';
import * as React from 'react';
import { subscribe } from 'valtio';
import { Store } from '../../types';

type VectorLike = { x: number; y: number };

export type VectorFieldProps = {
  store: Store;
  name: string;
};

export const VectorField = ({ store, name }: VectorFieldProps) => {
  const [xEl, setXEl] = React.useState<HTMLInputElement | null>(null);
  const [yEl, setYEl] = React.useState<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!xEl || !yEl) return;

    function changeHandler(axis: 'x' | 'y') {
      return function handleChange(ev: Event) {
        try {
          (store[name] as VectorLike)[axis] = parseFloat(
            (ev.target as HTMLInputElement).value
          );
        } catch (err) {
          console.debug(err);
        }
      };
    }
    const handleX = changeHandler('x');
    const handleY = changeHandler('y');
    xEl.addEventListener('change', handleX);
    yEl.addEventListener('change', handleY);

    function handleValue() {
      if (!xEl || !yEl) return;
      const vec = store[name] as VectorLike;
      xEl.value = vec.x.toString();
      yEl.value = vec.y.toString();
    }
    handleValue();

    const unsub = subscribe(store[name], handleValue);

    return () => {
      xEl.removeEventListener('change', handleX);
      yEl.removeEventListener('change', handleY);
      unsub();
    };
  }, [xEl, yEl, store, name]);

  return (
    <InputGroup>
      <NumberInput defaultValue={store[name] as number}>
        <NumberInputField ref={setXEl} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <NumberInput>
        <NumberInputField ref={setYEl} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </InputGroup>
  );
};
