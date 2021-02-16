import { Component } from '0g';
import { useRef } from 'react';
import { useFrame } from './useFrame';

export function useWatch<C extends Component>(
  component: C,
  onChange: (current: C) => any,
) {
  const versionRef = useRef(component.__version);
  useFrame(() => {
    if (component.__version !== versionRef.current) {
      onChange(component);
    }
  });
}
