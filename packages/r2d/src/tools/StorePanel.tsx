import * as React from 'react';
import { useProxy } from 'valtio';
import {  StoreData } from '../types';
import { StoreField } from './fields/StoreField';

export type StorePanelProps = {
  store: StoreData;
  entityId: string;
  title: string;
};

export function StorePanel({ store, title }: StorePanelProps) {
  const snapshot = useProxy(store);
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button
        className="button collapse-title"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
      </button>
      {open && (
        <div>
          {Object.keys(snapshot).map((name) => (
            <StoreField
              className="panel-field"
              key={name}
              name={name}
              store={store}
            />
          ))}
        </div>
      )}
    </div>
  );
}
