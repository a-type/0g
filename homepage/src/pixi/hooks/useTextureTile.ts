import { Texture, BaseTexture, Rectangle } from 'pixi.js';
import { useMemo } from 'react';
import { useAsset } from 'use-asset';

export function useTextureTile(
  source: string,
  tileData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
) {
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
        tileData.x,
        tileData.y,
        tileData.width,
        tileData.height
      );
      return s;
    }
    return sheet;
  }, [sheet, tileData]);
}
