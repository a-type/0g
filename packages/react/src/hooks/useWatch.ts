import { InstanceFor } from '0g';
import { useFrame } from './useFrame.js';
import { useGame } from './useGame.js';

export function useWatch<C extends InstanceFor<any>>(
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
