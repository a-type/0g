import React from 'react';
import { Panel, PanelSurface, PanelToggle } from './Panel';
import { Story } from '@storybook/react';
import { DoubleArrowRightIcon } from '@modulz/radix-icons';

export default {
  title: 'components/Panel',
  component: Panel,
};

const Template: Story<{ anchor: 'left' | 'right'; open: boolean }> = ({
  anchor,
  open,
}) => (
  <PanelSurface>
    <Panel anchor={anchor} open={open}>
      <PanelToggle>
        <DoubleArrowRightIcon />
      </PanelToggle>
      Panel content
    </Panel>
  </PanelSurface>
);

export const Left = Template.bind({});
Left.args = {
  anchor: 'left',
};

export const Right = Template.bind({});
Right.args = {
  anchor: 'right',
};
