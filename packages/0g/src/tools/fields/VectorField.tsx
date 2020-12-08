import * as React from 'react';
import { subscribe } from 'valtio';
import { Store, StoreData } from '../../types';

type VectorLike = { x: number; y: number };

export type VectorFieldProps = {
  store: StoreData;
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
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <input type="number" ref={setXEl} />
      <input type="number" ref={setYEl} />
    </div>
  );
};
