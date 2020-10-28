import { useFrame } from 'react-three-fiber';
import { keyboard } from './keyboard';

export function useKeyboard() {
  useFrame(() => {
    keyboard.cleanup();
  });
}

export function KeyboardInput() {
  useKeyboard();
  return null;
}
