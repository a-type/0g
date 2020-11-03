# r2d

Experimental 2d game tools for personal use.

This really isn't ready for anyone yet, but it might be nice to get feedback on the general direction, so here's some barebones docs:

## Input

The library exports a `keyboard` which stores active keys, so you can always just pull in `keyboard` and use its methods to get input. Nothing for mouse yet. It has types for the keys I care about, will need to flesh that out more.

```ts
// is the key down right now?
keyboard.getKey(' ');
// was the key pressed just this frame?
keyboard.getKeyDown(' ');
// was the key released just this frame?
keyboard.getKeyUp(' ');
```

In order to have this thing work you need to render the exported `<KeyboardInput />` component in your tree. It subscribes to `useFrame` to ensure the up/down values are accurate to the game loop.

## Physics

`planck-js` is a peer dependency. `r2d` uses a lot of it internally. Maybe it would be better to just bake it in? You'll end up importing a lot of stuff from `planck-js` yourself to pass into the library.

To get physics setup just render `<Physics>` wrapping the rest of your tree (maybe just below `Canvas`).

## Entities and behaviors

This library's primary function is to facilitate creating entities and applying behaviors to them.

- **Entities**: Stable object references which hold data for a particular "game object" - be it a player, wall, coin, etc.
- **Behaviors**: Logic applied to entities which modify their contained data. Behaviors are things you write, in the form of hooks.

This usage pattern is roughly inspired by Unity's ECS. Unlike Unity, Entities here contain data (you might consider Entities and Components merged here). Rather than unified singular Systems, we use Behaviors individually, attaching them to our components which represent game objects.

To create an Entity, call `useEntity`. You pass any data you want to include within the entity. There's only one special config value right now, `bodyConfig` - like classic Unity, each Entity has a physics body built-in. You just have to pass config values to set it up.

```tsx
import * as p from 'planck-js';
import { useEntity } from 'r2d';

export function Floor({ position, width = 10, height = 1, angle }) {
  const entity = useEntity({
    bodyConfig: {
      body: {
        type: 'static',
        userData: {
          tags: [Tag.Wall],
        },
      },
      fixture: p.Box(width / 2, height / 2),
      position,
      angle,
    },
  });

  const meshRef = useMeshRef(entity);

  return (
    <Box ref={meshRef} args={[width, height, 0]}>
      <meshBasicMaterial attach="material" />
    </Box>
  );
}
```

You should pass `position` and `angle` to your `useEntity`, not to your mesh. It'll get overwritten on the mesh.

You can also see `useMeshRef` used here. It takes an entity and returns a ref you can pass to the `mesh` (or equivalent from Drei, etc) which will synchronize it to your body.

### Handling collisions

This is a WIP, but you can use another hook to handle collisions with the body:

```ts
useContacts(entity);
```

Having a separate hook may seem like overkill, but it's actually really useful to have it separate at the moment, especially for performance reasons - computing contacts for a specific body isn't so fast right now...

## Creating behaviors

Behaviors are just hooks! This library doesn't actually include any specific code to manage creating them. But there's a pattern you should keep in mind.

The Entity represents the data (or state) required to power all the behaviors. TypeScript helps us out here - you should type your hooks to specify what kind of data they expect on the Entity they will be modifying.

Conventionally, a behavior takes an `entity` as its first argument. Generally the only argument - any configurable state or data should be on the Entity.

```tsx
import { Vec2 } from 'planck-js';
import { Entity } from 'r2d';
import { useInputStore } from '../store/useInputStore';

export function useJump(entity: Entity<{
  bodyBehavior: BodyBehavior;
  jumpPower?: number;
}>) {
  useFrame({
    if (keyboard.getKey(' ')) {
      entity.body.applyLinearImpulse(Vec2(0, jumpPower), {
        wake: true,
      });
    }
  });
}
```

To use your behavior you call it, passing in the entity.

```tsx
function Player() {
  const entity = useEntity({
    bodyConfig: {
      body: {
        type: 'dynamic',
        fixedRotation: false,
        angularDamping: 5,
      },
      fixture: {
        shape: p.Circle(1),
        density: 10,
        friction: 20,
      },
      position,
    },
  });

  // use our behavior!
  useJump(entity);

  const meshRef = useMeshRef(entity);

  return (
    <mesh ref={meshRef}>
      <meshBasicMaterial color="blue" />
    </mesh>
  );
}
```

### Rules of behaviors

- Don't destructure the `entity` in your hook args. The important part of the `entity` is that it's a stable reference which holds state. Destructuring risks an outdated reference if the value is reassigned later. Still working on how to make that... better.
