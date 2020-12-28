import { useGame } from '0g-react';
import * as React from 'react';
import { Button } from './components/Button';
import { useStore } from './useStore';

export function AddEntityButton() {
  const game = useGame();
  const select = useStore((s) => s.api.selectEntity);
  const addEntity = React.useCallback(() => {
    const e = game.create();
    select(e.id);
  }, [game, select]);

  return <Button onClick={addEntity}>Add Entity</Button>;
}
