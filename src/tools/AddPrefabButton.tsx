import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SelectField,
  useDisclosure,
} from '@chakra-ui/react';
import * as React from 'react';
import { worldContext } from '../World';

export function AddPrefabButton({
  parentId = null,
}: {
  parentId?: string | null;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Prefab</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SelectField
              value={prefab}
              onChange={(ev) => setPrefab(ev.target.value)}
            >
              {prefabNames.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </SelectField>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
            <Button onClick={addPrefab}>Add</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
