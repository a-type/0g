import { Plugins } from '../plugins';
import { bodyConfig } from '../stores/bodyConfig';
import { transform } from '../stores/transform';
import { r2d, WorldContext } from '../../../src';
import { World, Bodies, Body, IChamferableBodyDefinition } from 'matter-js';
import { forces } from '../stores/forces';

export const rigidBody = r2d.system({
  stores: {
    transform: transform,
    bodyConfig: bodyConfig,
    forces: forces,
  },
  state: (stores, ctx: WorldContext<Plugins>) => {
    const { x, y } = stores.transform;
    const {
      density,
      friction,
      frictionAir,
      isStatic,
      angle,
      restitution,
    } = stores.bodyConfig;
    const commonOptions: IChamferableBodyDefinition = {
      density,
      friction,
      frictionAir: frictionAir || Number.MIN_VALUE,
      isStatic,
      angle,
      restitution,
    };

    const body =
      stores.bodyConfig.shape === 'circle'
        ? Bodies.circle(x, y, stores.bodyConfig.radius, commonOptions)
        : Bodies.rectangle(
            x,
            y,
            stores.bodyConfig.width,
            stores.bodyConfig.height,
            commonOptions
          );

    World.add(ctx.plugins.matter.engine.world, [body]);
    return {
      body,
    };
  },
  preStep: ({ transform }, { body }: { body: Body }) => {
    Body.setPosition(body, transform);
  },
  run: ({ transform }, { body }: { body: Body }) => {
    transform.x = body.position.x;
    transform.y = body.position.y;
    transform.angle = body.angle;
  },
  postStep: ({ forces }, { body }) => {
    if (forces.velocity) {
      Body.setVelocity(body, forces.velocity);
    }
    forces.velocity = null;
  },
});
