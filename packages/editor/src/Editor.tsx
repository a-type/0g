import * as React from 'react';
import { Game } from '0g';
import { World } from '0g-react';
import { EntityList } from './EntityList';
import {
  Panel,
  PanelSurface,
  PanelToggle,
  PanelContent,
} from './components/Panel';
import { EntityDetails } from './EntityDetails';

export type EditorProps = {
  game: Game;
};

export function Editor({ game }: EditorProps) {
  return (
    <World game={game}>
      <PanelSurface>
        <Panel anchor="left">
          <PanelContent>
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
