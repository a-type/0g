import * as React from 'react';
import { subscribe } from 'valtio';
import { Store } from '../../types';
import { Input } from '@chakra-ui/react';

export type StringFieldProps = {
  store: Store;
  name: string;
};

export const StringField = ({ store, name }: StringFieldProps) => {
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

  return <Input ref={setEl} />;
};
