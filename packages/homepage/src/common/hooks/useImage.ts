import { useAsset } from 'use-asset';

function lazyLoad(path: string) {
  return import(path);
}

export function useImage(url: string) {
  return useAsset(lazyLoad, [url]);
}
