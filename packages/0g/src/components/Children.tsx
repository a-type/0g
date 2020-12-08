import * as React from 'react';
import { useProxy } from 'valtio';
import { Entity } from '../Entity';
import { StoreData } from '../types';

export type ChildrenProps = {
  entities: Record<
    string,
    { id: string; prefab: string; initial: Record<string, StoreData> }
  >;
};

export function Children({ entities }: ChildrenProps) {
  const snapshot = useProxy(entities);

  return (
    <>
      {Object.keys(snapshot).map((id) => {
        if (!entities[id]) return null;
        return <Entity key={id} {...entities[id]} />;
      })}
    </>
  );
}
