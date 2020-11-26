import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useProxy } from 'valtio';
import { TreeNode } from '../types';
import { worldContext } from '../World';
import { EntityPane } from './EntityPane';
import { Html } from './Html';

const sceneTreeContext = React.createContext<{
  selected: string;
  setSelected: (id: string) => void;
}>({
  selected: 'scene',
  setSelected: () => {
    return;
  },
});

export function SceneTree() {
  const ctx = React.useContext(worldContext);
  if (!ctx) {
    throw new Error('Game tools must be used within the World');
  }

  const [selected, setSelected] = React.useState('scene');

  const tree = useProxy(ctx.store.tree);

  const selectedEntity = ctx.store.entities[selected];

  return (
    <Html>
      <sceneTreeContext.Provider value={{ selected, setSelected }}>
        <div className="panel fixed-left">
          <SceneTreeNode treeNode={ctx.store.tree} level={0} />
        </div>
        <div className="panel fixed-right">
          <EntityPane entity={selectedEntity} />
        </div>
      </sceneTreeContext.Provider>
      ,
    </Html>
  );
}

function SceneTreeNode({
  treeNode,
  level,
}: {
  level: number;
  treeNode: TreeNode;
}) {
  const { selected, setSelected } = React.useContext(sceneTreeContext);

  const { id, children } = useProxy(treeNode);

  return (
    <div style={{ marginLeft: level > 0 ? 8 : 0 }}>
      <button className="button" onClick={() => setSelected(id)}>
        {id}
        {selected === id && ' *'}
      </button>
      <div>
        {Object.keys(children).map((name) => (
          <SceneTreeNode
            level={level + 1}
            treeNode={treeNode.children[name]}
            key={name}
          />
        ))}
      </div>
    </div>
  );
}
