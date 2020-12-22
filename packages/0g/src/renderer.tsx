import { observer } from 'mobx-react-lite';
import { Entity } from './entity';
import { Game } from './Game';
import { QueryDef, queryManager, Query, MapDefsToQueries } from './queries';

export type Renderer = {
  name: string;
  query: Query<any>;
  Component(props: { game: Game; entity: Entity }): JSX.Element;
};

export function renderer<Q extends QueryDef>(
  name: string,
  queryDef: Q,
  Component: (props: { game: Game; entity: Entity }) => JSX.Element,
): Renderer {
  const query = queryManager.create(queryDef);

  const rend = {
    name,
    query,
    Component: observer(Component),
  };

  return rend;
}
