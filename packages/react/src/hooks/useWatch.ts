import { ComponentInstance } from '0g';
import { useFrame } from './useFrame';
import { useGame } from './useGame';

export function useWatch<C extends ComponentInstance<unknown>>(
  component: C,
  onChange: (current: C) => any,
) {
  const game = useGame();
  useFrame(() => {
    if (game.componentManager.wasChangedLastFrame(component.id)) {
      onChange(component);
    }
  });
}
