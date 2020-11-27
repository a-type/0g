import * as React from 'react';
import { useProxy } from 'valtio';
import { Store } from '../types';
import { StoreField } from './fields/StoreField';
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
} from '@chakra-ui/react';

export type StorePanelProps = {
  store: Store;
  entityId: string;
  title: string;
};

export function StorePanel({ store, title }: StorePanelProps) {
  const snapshot = useProxy(store);
  const [open, setOpen] = React.useState(false);

  return (
    <AccordionItem>
      <AccordionButton
        className="button collapse-title"
        onClick={() => setOpen((v) => !v)}
      >
        <Box flex="1" textAlign="left">
          {title}
        </Box>
      </AccordionButton>
      <AccordionPanel>
        {Object.keys(snapshot).map((name) => (
          <StoreField
            className="panel-field"
            key={name}
            name={name}
            store={store}
          />
        ))}
      </AccordionPanel>
    </AccordionItem>
  );
}
