import { useLayoutEffect, useRef } from 'react';
import { subscribe } from 'valtio';
import { BodyConfigData } from '../stores/bodyConfig';

export function useBodyRef<T extends HTMLElement>(stores: {
  transform: { x: number; y: number; angle: number };
  bodyConfig: BodyConfigData;
}) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const updateBody = () => {
      if (!ref.current) return;

      const width =
        stores.bodyConfig.shape === 'circle'
          ? stores.bodyConfig.radius * 2
          : stores.bodyConfig.width;
      const height =
        stores.bodyConfig.shape === 'circle'
          ? stores.bodyConfig.radius * 2
          : stores.bodyConfig.height;

      ref.current.style.width = `${width}px`;
      ref.current.style.height = `${height}px`;
    };
    const updateTransform = () => {
      if (!ref.current) return;

      const { x, y, angle } = stores.transform;
      ref.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}rad)`;
    };

    const unsubTransform = subscribe(stores.transform, updateTransform);
    const unsubBody = subscribe(stores.bodyConfig, updateBody);

    updateBody();
    updateTransform();

    return () => {
      unsubTransform();
      unsubBody();
    };
  }, []);

  return ref;
}
