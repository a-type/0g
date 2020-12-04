import * as React from 'react';
import { subscribe } from 'valtio';
import { StoreData } from '../../types';

export type ObjectFieldProps = {
  store: StoreData;
  name: string;
};

export function ObjectField({ store, name }: ObjectFieldProps) {
  const [el, setEl] = React.useState<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (!el) return;

    function handleChange(ev: Event) {
      try {
        store[name] = JSON.parse((ev.target as HTMLTextAreaElement).value);
      } catch (err) {
        // nothing to do
      }
    }
    el.addEventListener('change', handleChange);

    function handleValue() {
      if (!el) return;
      el.value = JSON.stringify(store[name]);
    }
    handleValue();

    const unsub = subscribe(store, handleValue);

    return () => {
      el.removeEventListener('change', handleChange);
      unsub();
    };
  }, [el, store, name]);

  return <textarea ref={setEl} />;
}
