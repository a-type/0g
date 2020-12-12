import React, { useEffect, useState } from 'react';
import { entity } from '0g';
import { stores } from './stores';
import { useBodyRef } from '@0g/box2d/web';
import { Button } from '../../components/Button';
import { autorun } from 'mobx';

export const Ball = entity(
  'Ball',
  {
    transform: stores.transform(),
    contacts: stores.contacts(),
    body: stores.body({
      config: {
        shape: 'circle',
        radius: 1,
        fixedRotation: true,
        friction: 0.25,
        restitution: 1,
        bullet: true,
      },
    }),
    config: stores.ballConfig(),
  },
  ({ stores }) => {
    return (
      <div
        css={{
          borderRadius: '100%',
          backgroundColor: 'white',
        }}
        ref={useBodyRef(stores)}
        className="Ball"
      />
    );
  }
);

export const Block = entity(
  'Block',
  {
    transform: stores.transform(),
    body: stores.body({
      config: {
        shape: 'rectangle',
        width: 5,
        height: 2.5,
      },
    }),
    contacts: stores.contacts(),
    info: stores.blockInfo(),
  },
  ({ stores }) => (
    <div
      css={{
        fontFamily: '"Major Mono Display", monospace',
      }}
      ref={useBodyRef(stores)}
      style={{ fontSize: stores.info.fontSize }}
    >
      {stores.info.text}
    </div>
  )
);

export const BlockSpawner = entity(
  'BlockSpawner',
  {
    transform: stores.transform(),
    config: stores.blocksConfig(),
  },
  ({
    stores: {
      transform: { x, y },
      config,
    },
    id,
  }) => {
    const totalWidth =
      config.blocks.reduce((max, row) => Math.max(max, row.length), 0) *
      config.blockWidth;
    const totalHeight = config.blocks.length * config.blockHeight;

    const hOffset = -totalWidth / 2;
    const vOffset = -totalHeight / 2;

    return (
      <>
        {config.blocks.map((row, h) => {
          return row.map((info, v) => {
            return (
              info && (
                <Block
                  key={info.key}
                  id={`Block-${info.key}`}
                  initial={{
                    transform: {
                      x: x + v * config.blockWidth + hOffset,
                      y: y + h * config.blockHeight + vOffset,
                    },
                    body: {
                      config: {
                        shape: 'rectangle',
                        width: config.blockWidth,
                        height: config.blockHeight,
                      },
                    },
                    info: {
                      spawnerId: id,
                      key: info.key,
                      fontSize: config.fontSize,
                      text: info.text,
                    },
                  }}
                />
              )
            );
          });
        })}
      </>
    );
  }
);

export const Paddle = entity(
  'Paddle',
  {
    transform: stores.transform(),
    body: stores.body({
      config: {
        shape: 'rectangle',
        density: 1,
        width: 20,
        height: 4,
        restitution: 1,
        angle: 0,
        friction: 0.25,
        fixedRotation: true,
      },
    }),
    config: stores.paddleConfig(),
  },
  ({ stores }) => {
    return <Button ref={useBodyRef(stores)}>Start</Button>;
  }
);

export const Wall = entity(
  'Wall',
  {
    transform: stores.transform(),
    body: stores.body({
      config: {
        shape: 'rectangle',
        width: 5,
        height: 50,
        restitution: 1,
        isStatic: true,
        friction: 0,
      },
    }),
    contacts: stores.contacts(),
  },
  ({ stores }) => {
    const [showHit, setShowHit] = useState(false);

    const hasContact = !!stores.contacts.began.length;

    useEffect(() => {
      if (hasContact) {
        setShowHit(true);
      } else {
        const t = setTimeout(() => setShowHit(false), 500);
        return () => clearTimeout(t);
      }
    }, [hasContact]);

    return (
      <div
        ref={useBodyRef(stores)}
        css={{
          transition: '0.6s ease all',
          backgroundColor: showHit ? 'white' : 'transparent',
        }}
      />
    );
  }
);
