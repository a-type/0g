import { AnyComponent, InstanceFor } from '0g';
import { useFrame } from './useFrame.js';
import { useGame } from './useGame.js';
import { useCallback, useState } from 'react';

export function useOnChange<C extends AnyComponent>(
  component: C,
  onChange: (current: C) => any,
  { phase = 'step' }: { phase?: string } = {},
) {
  const game = useGame();
  useFrame(() => {
    if (game.componentManager.wasChangedLastFrame(component.$.id)) {
      onChange(component);
    }
  }, phase);
}

export function useWatch<C extends AnyComponent>(
  component: C,
  { phase = 'step' }: { phase?: string } = {},
) {
  const [_, setVal] = useState(0);
  const forceUpdate = useCallback(() => setVal((val) => val + 1), []);
  useOnChange(component, forceUpdate, { phase });
}
