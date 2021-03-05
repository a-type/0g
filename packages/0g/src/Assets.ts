import { ObjectPool } from './internal/objectPool';
import { ResourceHandle } from './ResourceHandle';

export type AssetLoader<T = any> = (key: string) => Promise<T>;
type InferAsset<Loader extends AssetLoader<any>> = Loader extends AssetLoader<
  infer T
>
  ? T
  : never;

export class Assets<Loaders extends Record<string, AssetLoader>> {
  private handlePool = new ObjectPool(() => new ResourceHandle());
  private handles = new Map<string, ResourceHandle>();

  constructor(private _loaders: Loaders) {}

  load = <LoaderName extends keyof Loaders>(
    loader: LoaderName,
    key: string,
  ) => {
    let handle = this.handles.get(this.getKey(loader, key));
    if (!handle) {
      handle = this.handlePool.acquire();
      this.handles.set(this.getKey(loader, key), handle);
      this._loaders[loader](key).then((value) => handle!.resolve(value));
    }
    return handle!.promise as Promise<InferAsset<Loaders[LoaderName]>>;
  };

  immediate = <LoaderName extends keyof Loaders>(
    loader: LoaderName,
    key: string,
  ) => {
    const handle = this.handles.get(this.getKey(loader, key));
    if (!handle) return null;
    return handle.value as InferAsset<Loaders[LoaderName]> | null;
  };

  private getKey = (loader: keyof Loaders, key: string) => `${loader}:${key}`;
}
