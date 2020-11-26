import { useEffect, useRef, useState } from 'react';
import { serialize } from 'v8';
import { subscribe } from 'valtio';
import { Store } from '../../types';

export enum StoreFieldKind {
  String,
  Number,
  Object,
  Unsupported,
}

class UnsupportedFieldConfigError extends Error {}

function getFieldKind(store: Store, key: string) {
  const value = store[key];

  if (typeof value === 'string') {
    return StoreFieldKind.String;
  }
  if (typeof value === 'number') {
    return StoreFieldKind.Number;
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

function parseField(
  kind: StoreFieldKind,
  value: string | number | boolean | null | undefined
) {
  switch (kind) {
    case StoreFieldKind.Number:
      if (typeof value === 'number') return value;
      else if (typeof value === 'string') return parseFloat(value);
      throw new UnsupportedFieldConfigError();
    case StoreFieldKind.String:
      return value?.toString();
    case StoreFieldKind.Object:
      if (typeof value === 'string') return JSON.parse(value);
      else if (typeof value === 'object') return value;
      else throw new UnsupportedFieldConfigError();
    case StoreFieldKind.Unsupported:
      return value;
  }
}

function serializeField(kind: StoreFieldKind, value: any) {
  return value?.toString();
}

export function useStoreField(store: Store, key: string) {
  const kind = getFieldKind(store, key);
  const [el, setEl] = useState<HTMLInputElement | HTMLTextAreaElement | null>(
    null
  );

  useEffect(() => {
    if (!el) return;

    function handleChange(ev: Event) {
      try {
        store[key] = parseField(kind, (ev.target as HTMLInputElement).value);
      } catch (err) {
        console.debug(err);
      }
    }
    el.addEventListener('change', handleChange);

    function handleValue() {
      if (!el) return;

      el.value = serializeField(kind, store[key]);
    }

    const unsub = subscribe(store, handleValue);

    handleValue();

    return () => {
      el.removeEventListener('change', handleChange);
      unsub();
    };
  }, [el, store, kind, key]);

  return [setEl, { kind }] as const;
}
