import { useFrame } from 'react-three-fiber';
import { keyboard } from './keyboard';

export function useKeyboard() {
  useFrame(() => {
    keyboard.cleanup();
  }, 0);
}

export function KeyboardInput() {
  useKeyboard();
  return null;
}
