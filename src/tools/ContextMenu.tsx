import * as React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Portal,
} from '@chakra-ui/react';

export type ContextMenuProps = {
  children: React.ReactNode;
  target: React.ReactNode;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
};

export function ContextMenu({
  children,
  target,
  title,
  isOpen,
  onClose,
}: ContextMenuProps) {
  return (
    <Popover
      returnFocusOnClose={false}
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      closeOnBlur
    >
      <PopoverTrigger>{target}</PopoverTrigger>
      <Portal>
        <PopoverContent>
          {title && (
            <PopoverHeader fontWeight="semibold">{title}</PopoverHeader>
          )}
          <PopoverBody>{children}</PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
