import { useMemo } from 'react';
import { Texture, BaseTexture, Rectangle } from 'pixi.js';
import { useAsset } from 'use-asset';
import { TileData } from './stores';

export const useSprite = (source: string, tileData?: TileData) => {
  const sheet = useAsset(
    (src: string) => {
      const baseTex = BaseTexture.from(src);
      return new Promise<Texture>((resolve, reject) => {
        baseTex.on('loaded', () => {
          resolve(new Texture(baseTex));
        });
        baseTex.on('error', reject);
      });
    },
    [source]
  );
  return useMemo(() => {
    if (tileData) {
      const s = sheet.clone();
      s.frame = new Rectangle(
        tileData.x * (tileData.width + (tileData.gap ?? 0)),
        tileData.y * (tileData.height + (tileData.gap ?? 0)),
        tileData.width,
        tileData.height
      );
      return s;
    }
    return sheet;
  }, [sheet, tileData]);
};
