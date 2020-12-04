import * as React from 'react';
import { subscribe } from 'valtio';
import { StoreData } from '../../types';

export type NumberFieldProps = {
  store: StoreData;
  name: string;
};

export const NumberField = ({ store, name }: NumberFieldProps) => {
  const [el, setEl] = React.useState<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!el) return;

    function handleChange(ev: Event) {
      try {
        store[name] = parseFloat((ev.target as any)?.value);
      } catch (err) {
        console.debug(err);
      }
    }
    el.addEventListener('change', handleChange);

    function handleValue() {
      if (!el) return;
      el.value = (store[name] as number).toString();
    }
    handleValue();

    const unsub = subscribe(store, handleValue);

    return () => {
      el.removeEventListener('change', handleChange);
      unsub();
    };
  }, [el, store, name]);

  return <input type="number" ref={setEl} />;
};
