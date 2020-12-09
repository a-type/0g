import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Entity } from '../Entity';
import { StoreData } from '../types';

export type ChildrenProps = {
  entities: Record<
    string,
    { id: string; prefab: string; initial: Record<string, StoreData> }
  >;
};

export const Children = observer(({ entities }: ChildrenProps) => {
  return (
    <>
      {Object.keys(entities).map((id) => {
        if (!entities[id]) return null;
        return <Entity key={id} {...entities[id]} />;
      })}
    </>
  );
});
