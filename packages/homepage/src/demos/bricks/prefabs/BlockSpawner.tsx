import * as React from 'react';
import * as r2d from 'r2d';
import { Entity } from 'r2d';
import { box2d } from '../../../common/plugins';

function getBlockX(x: number, h: number, w: number, t: number) {
  return x + h * w - (t * w) / 2;
}
function getBlockY(y: number, v: number, h: number, t: number) {
  return y + v * h - (t * h) / 2;
}

export const BlockSpawner = r2d.prefab({
  name: 'BlockSpawner',
  stores: {
    transform: box2d.stores.transform(),
    spawnerConfig: r2d.store('blockSpawnerConfig', {
      blocks: [
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
      ],
      blockWidth: 5,
      blockHeight: 2.5,
    })(),
  },
  Component: ({ stores, id }) => {
    const { transform, spawnerConfig } = r2d.useProxy(stores);
    return (
      <>
        {spawnerConfig.blocks.map((row, h) => {
          return row.map(
            (present, v) =>
              present && (
                <Entity
                  key={`${h}.${v}`}
                  id={`Block-${h}.${v}`}
                  prefab="Block"
                  initial={{
                    // TODO: strong types
                    transform: {
                      x: getBlockX(
                        transform.x,
                        h,
                        spawnerConfig.blockWidth,
                        row.length
                      ),
                      y: getBlockY(
                        transform.y,
                        v,
                        spawnerConfig.blockHeight,
                        spawnerConfig.blocks.length
                      ),
                    },
                    bodyConfig: {
                      shape: 'rectangle',
                      width: spawnerConfig.blockWidth,
                      height: spawnerConfig.blockHeight,
                    },
                    spawner: {
                      id,
                      x: h,
                      y: v,
                    },
                  }}
                />
              )
          );
        })}
      </>
    );
  },
});
