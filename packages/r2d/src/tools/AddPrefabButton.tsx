import * as React from 'react';
import { worldContext } from '../World';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

export function AddPrefabButton({
  parentId = null,
}: {
  parentId?: string | null;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const world = React.useContext(worldContext);

  if (!world) throw new Error('No World context');

  const prefabNames = Object.keys(world.prefabs);
  const [prefab, setPrefab] = React.useState(prefabNames[0]);

  const addPrefab = React.useCallback(() => {
    world.add(prefab, undefined, parentId);
  }, [parentId, prefab, world]);

  return (
    <>
      <Button onClick={onOpen}>Add Prefab</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div>
          <h3>Add Prefab</h3>
          <div>
            <select
              value={prefab}
              onChange={(ev) => setPrefab(ev.target.value)}
            >
              {prefabNames.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Button onClick={onClose}>
              Close
            </Button>
            <Button onClick={addPrefab}>Add</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
