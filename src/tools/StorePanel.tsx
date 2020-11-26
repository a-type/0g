import * as React from 'react';
import { useProxy } from 'valtio';
import { Store } from '../types';
import { StoreField } from './fields/StoreField';

export type StorePanelProps = {
  store: Store;
  entityId: string;
  title: string;
};

export function StorePanel({ store, title }: StorePanelProps) {
  const snapshot = useProxy(store);
  const [open, setOpen] = React.useState(true);

  return (
    <div>
      <button
        className="button collapse-title"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
      </button>
      {open &&
        Object.keys(snapshot).map((name) => (
          <StoreField
            className="panel-field"
            key={name}
            name={name}
            store={store}
          />
        ))}
    </div>
  );
}
