import { useLayoutEffect, useRef } from 'react';
import { stores as box2dStores } from '@0g/box2d';
import { autorun } from 'mobx';

export function useBodyRef<T extends HTMLElement>(
  stores: {
    transform: ReturnType<typeof box2dStores['transform']>;
    body: ReturnType<typeof box2dStores['body']>;
  },
  pixelScale = 10
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
