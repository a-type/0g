import { useEffect, useLayoutEffect, useRef } from 'react';
import { FrameCallback } from './types';

const frameData = { delta: 0 };

/**
 * A basic, no-frills RAF-powered game loop at ~60FPS
 */
export function useFrame(callback: FrameCallback) {
  const ref = useRef(callback);
  useLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    let frameHandle: number | null = null;
    const loop = (delta: number) => {
      frameHandle = requestAnimationFrame(loop);
      frameData.delta = delta;
      ref.current(frameData);
    };
    loop(0);

    return () => {
      frameHandle && cancelAnimationFrame(frameHandle);
    };
  }, []);
}

export type FrameHook = typeof useFrame;
