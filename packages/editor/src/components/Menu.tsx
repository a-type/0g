import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { styled } from '../stitches.config';
import { Button } from './Button';

export const MenuRoot = styled(DropdownMenu.Root, {});

export const MenuTrigger = styled(DropdownMenu.Trigger, {});
MenuTrigger.defaultProps = {
  as: Button,
} as any;

export const MenuContent = styled(DropdownMenu.Content, {
  backgroundColor: '$white',
  color: '$black',
  padding: '$1',
  borderRadius: 4,
});

export const MenuLabel = styled(DropdownMenu.Label, {});

export const MenuItem = styled(DropdownMenu.Item, {});

export const MenuGroup = styled(DropdownMenu.Group, {});

export const MenuArrow = styled(DropdownMenu.Arrow, {
  fill: '$white',
});
