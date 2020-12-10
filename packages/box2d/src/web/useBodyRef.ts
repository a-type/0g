import { useLayoutEffect, useRef } from 'react';
import * as box2dStores from '../stores';
import { autorun } from 'mobx';

export function useBodyRef<T extends HTMLElement>(
  stores: {
    transform: ReturnType<typeof box2dStores['transform']>;
    body: ReturnType<typeof box2dStores['body']>;
  },
  {
    pixelScale = 10,
    cssPosition = 'absolute',
  }: {
    pixelScale?: number;
    cssPosition?: 'absolute' | 'relative' | 'fixed';
  } = {}
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    return autorun(() => {
      const width =
        stores.body.config.shape === 'circle'
          ? stores.body.config.radius * 2 * pixelScale
          : stores.body.config.width * pixelScale;
      const height =
        stores.body.config.shape === 'circle'
          ? stores.body.config.radius * 2 * pixelScale
          : stores.body.config.height * pixelScale;
      const { x, y, angle } = stores.transform;

      if (ref.current) {
        ref.current.style.position = cssPosition;
        ref.current.style.width = `${width}px`;
        ref.current.style.height = `${height}px`;
        ref.current.style.transform = `translate(${x * pixelScale}px, ${
          y * pixelScale
        }px) translate(-50%, -50%) rotate(${angle ?? 0}rad)`;
      }
    });
  }, [stores.transform, stores.body.config, ref]);

  return ref;
}
