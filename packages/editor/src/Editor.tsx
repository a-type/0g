import * as React from 'react';
import { Game } from '0g';
import { World } from '0g-react';
import { EntityList } from './EntityList';
import {
  Panel,
  PanelSurface,
  PanelToggle,
  PanelContent,
  PanelHeader,
} from './components/Panel';
import { EntityDetails } from './EntityDetails';
import { AddEntityButton } from './AddEntityButton';

export type EditorProps = {
  game: Game;
};

export function Editor({ game }: EditorProps) {
  return (
    <World game={game}>
      <PanelSurface>
        <Panel anchor="left">
          <PanelContent>
            <PanelHeader>
              <AddEntityButton />
            </PanelHeader>
            <EntityList />
          </PanelContent>
          <PanelToggle />
        </Panel>
        <Panel anchor="right">
          <PanelContent>
            <EntityDetails />
          </PanelContent>
          <PanelToggle />
        </Panel>
      </PanelSurface>
    </World>
  );
}
