import { renderer, Entity } from '0g';
import { RectangleBodyShape } from '@0g/box2d';
import { useBodyRef } from '@0g/box2d/web';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { stores } from './stores';

export const BallRenderer = renderer(
  'Ball',
  {
    all: [stores.ballConfig, stores.transform, stores.bodyConfig],
    none: [],
  },
  ({ entity }) => {
    return (
      <div
        key={entity.id}
        css={{
          borderRadius: '100%',
          backgroundColor: 'white',
        }}
        ref={useBodyRef(entity)}
      />
    );
  }
);

export const BlockRenderer = renderer(
  'Block',
  {
    all: [stores.blockInfo, stores.transform, stores.bodyConfig],
    none: [],
  },
  ({ entity }) => {
    const info = entity.get(stores.blockInfo);
    return (
      <div
        key={entity.id}
        css={{
          fontFamily: '"Major Mono Display", monospace',
          fontSize: info.fontSize,
        }}
        ref={useBodyRef(entity)}
      >
        {info.text}
      </div>
    );
  }
);

export const PaddleRenderer = renderer(
  'Paddle',
  {
    all: [stores.paddleConfig, stores.transform, stores.bodyConfig],
    none: [],
  },
  ({ entity, game }) => {
    const handleClick = useCallback(() => {
      if (game.isPaused) {
        game.resume();
      } else {
        game.pause();
      }
    }, [game]);

    return (
      <Button key={entity.id} onClick={handleClick} ref={useBodyRef(entity)}>
        {game.isPaused ? 'Start' : 'Pause'}
      </Button>
    );
  }
);

const Wall = ({ entity }: { entity: Entity }) => {
  const [showHit, setShowHit] = useState(false);

  const contacts = entity.get(stores.contacts);

  const hasContact = !!contacts.began.length;

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
      ref={useBodyRef(entity)}
      css={{
        transition: '0.6s ease all',
        backgroundColor: showHit ? 'white' : 'transparent',
      }}
    />
  );
};

export const WallRenderer = renderer(
  'Wall',
  {
    all: [stores.wallTag, stores.transform, stores.bodyConfig, stores.contacts],
    none: [],
  },
  ({ entity }) => {
    return <Wall key={entity.id} entity={entity} />;
  }
);

export const DebrisRenderer = renderer(
  'Debris',
  {
    all: [stores.debrisConfig, stores.bodyConfig, stores.transform],
    none: [],
  },
  ({ entity }) => {
    const bodyConfig = entity.get(stores.bodyConfig);
    const config = entity.get(stores.debrisConfig);
    const size = (bodyConfig.shape as RectangleBodyShape).width;
    return (
      <div
        key={entity.id}
        ref={useBodyRef(entity)}
        css={{ fontSize: size * 10 }}
      >
        {config.text}
      </div>
    );
  }
);
