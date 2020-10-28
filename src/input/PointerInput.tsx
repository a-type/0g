import { useFrame } from 'react-three-fiber';
import { pointer } from './pointer';

function useUpdatePointer() {
  useFrame(() => {
    pointer.frame();
  });
}

export function PointerInput() {
  useUpdatePointer();
  return null;
}
