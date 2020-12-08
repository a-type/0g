import * as React from 'react';
import * as g from '0g';
import { Entity } from '0g';
import { game } from '../game';

function getBlockX(x: number, h: number, w: number, t: number) {
  return x + h * w - (t * w) / 2;
}
function getBlockY(y: number, v: number, h: number, t: number) {
  return y + v * h - (t * h) / 2;
}

export const BlockSpawner = game.prefab({
  name: 'BlockSpawner',
  stores: {
    transform: game.stores.transform(),
    spawnerConfig: game.stores.spawnerConfig(),
  },
  Component: ({ stores, id }) => {
    const { transform, spawnerConfig } = g.useProxy(stores);
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
