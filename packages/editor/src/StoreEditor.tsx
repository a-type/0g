import { BaseStore, StoreInstance } from '0g';
import * as React from 'react';
import { StoreField } from './fields/StoreField';

function extractProps(store: StoreInstance) {
  return Object.entries(store).filter(
    (entry) => !BaseStore.builtinKeys.includes(entry[0]),
  );
}

export type StoreEditorProps = {
  store: StoreInstance;
};

export function StoreEditor({ store }: StoreEditorProps) {
  return (
    <div>
      <h4>{Object.getPrototypeOf(store).constructor.name}</h4>
      {extractProps(store).map(([name]) => (
        <StoreField key={name} store={store} name={name} />
      ))}
    </div>
  );
}
