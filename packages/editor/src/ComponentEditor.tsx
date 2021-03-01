import { ComponentInstance } from '0g';
import * as React from 'react';
import { ComponentField } from './fields/ComponentField';

function extractProps(component: ComponentInstance<unknown>) {
  return Object.entries(Object.getPrototypeOf(component).constructor.defaults);
}

export type ComponentEditorProps = {
  component: ComponentInstance<any>;
};

export function ComponentEditor({ component: store }: ComponentEditorProps) {
  return (
    <div>
      <h4>{Object.getPrototypeOf(store).constructor.name}</h4>
      {extractProps(store).map(([name]) => (
        <ComponentField key={name} store={store} name={name} />
      ))}
    </div>
  );
}
