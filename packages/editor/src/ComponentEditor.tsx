import { Component, ComponentInstance } from '0g';
import * as React from 'react';
import { ComponentField } from './fields/ComponentField';

function extractProps(component: ComponentInstance) {
  return Object.entries(component).filter(
    (entry) => !Component.builtinKeys.includes(entry[0]),
  );
}

export type ComponentEditorProps = {
  component: ComponentInstance;
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
