import { useFrame } from 'react-three-fiber';
import { keyboard } from './keyboard';

function useUpdateKeyboard() {
  useFrame(() => {
    keyboard.frame();
  });
}

export function KeyboardInput() {
  useUpdateKeyboard();
  return null;
}
