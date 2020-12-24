import React, { memo, useEffect, useState } from 'react';
import { Entity } from '0g';
import { usePlayState, useQuery } from '0g-react';
import { RectangleBodyShape } from '0g-box2d';
import { useBodyRef } from '../../hooks/useBodyRef';
import { Button } from '../../components/Button';
import { stores } from './stores';

const Ball = memo(({ entity }: { entity: Entity }) => {
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
});

export const BallRenderer = () => {
  const balls = useQuery({
    all: [stores.BallConfig, stores.Transform, stores.BodyConfig],
    none: [],
  });

  return (
    <>
      {balls.entities.map((entity) => (
        <Ball key={entity.id} entity={entity} />
      ))}
    </>
  );
};

const Block = memo(({ entity }: { entity: Entity }) => {
  const info = entity.get(stores.BlockInfo);

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
});

export const BlockRenderer = () => {
  const blocks = useQuery({
    all: [stores.BlockInfo, stores.Transform, stores.BodyConfig],
    none: [],
  });

  return (
    <>
      {blocks.entities.map((entity) => (
        <Block key={entity.id} entity={entity} />
      ))}
    </>
  );
};

const Paddle = memo(({ entity }: { entity: Entity }) => {
  const [isPlaying, toggle] = usePlayState();

  return (
    <Button key={entity.id} onClick={() => toggle()} ref={useBodyRef(entity)}>
      {isPlaying ? 'Pause' : 'Start'}
    </Button>
  );
});

export const PaddleRenderer = () => {
  const paddles = useQuery({
    all: [stores.PaddleConfig, stores.Transform, stores.BodyConfig],
    none: [],
  });

  return (
    <>
      {paddles.entities.map((entity) => (
        <Paddle key={entity.id} entity={entity} />
      ))}
    </>
  );
};

const Wall = ({ entity }: { entity: Entity }) => {
  const [showHit, setShowHit] = useState(false);

  const contacts = entity.get(stores.Contacts);

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

export const WallRenderer = () => {
  const walls = useQuery({
    all: [stores.WallTag, stores.Transform, stores.BodyConfig, stores.Contacts],
    none: [],
  });

  return (
    <>
      {walls.entities.map((entity) => (
        <Wall key={entity.id} entity={entity} />
      ))}
    </>
  );
};

const Debris = memo(({ entity }: { entity: Entity }) => {
  const bodyConfig = entity.get(stores.BodyConfig);
  const config = entity.get(stores.DebrisConfig);
  const size = (bodyConfig.shape as RectangleBodyShape).width;
  return (
    <div key={entity.id} ref={useBodyRef(entity)} css={{ fontSize: size * 10 }}>
      {config.text}
    </div>
  );
});

export const DebrisRenderer = () => {
  const debris = useQuery({
    all: [stores.DebrisConfig, stores.BodyConfig, stores.Transform],
    none: [],
  });

  return (
    <>
      {debris.entities.map((entity) => (
        <Debris key={entity.id} entity={entity} />
      ))}
    </>
  );
};
