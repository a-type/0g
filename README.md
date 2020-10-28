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

## Using behaviors

This library's primary function is to facilitate using and creating behaviors. It currently exports one behavior: `useBody`.

To use the behavior you need to have a mesh reference. To do that just do a `useRef` and pass it to your `<mesh>` or equivalent.

`useBody` is a hook you call and pass in the mesh and some physics config:

```tsx
import * as p from 'planck-js';
import { useBody } from 'r2d';

export function Floor({ position, width = 10, height = 1, angle }) {
  const meshRef = React.useRef(null);
  useBody({
    mesh: meshRef.current,
    body: {
      type: 'static',
      userData: {
        tags: [Tag.Wall],
      },
    },
    fixture: p.Box(width / 2, height / 2),
    position,
    angle,
  });

  return (
    <Box ref={meshRef} args={[width, height, 0]}>
      <meshBasicMaterial attach="material" />
    </Box>
  );
}
```

You should pass `position` and `angle` to your `useBody`, not to your mesh. It'll get overwritten on the mesh.

### Handling collisions

This is a WIP, but you can use another hook to handle collisions with the body:

```ts
useCollisions(bodyBehavior, {
  onBeginContact: ({ other, contact }) => {
    const otherBody = other.getBody();
    // etc
  },
  onEndContact: ({ other, contact }) => {},
});
```

Having a separate hook may seem like overkill, but it's actually really useful to have it separate at the moment, especially because of how behaviors generally work together...

## Creating behaviors

Besides just `useBody`, the point is you can create your own behaviors. Right now `useBody` is actually so small you might just want to do it yourself?

Behaviors are roughly inspired by Unity. They include an update callback which is run each frame, they have a local state object you can use to store state, and they can expose a public API. They're also hooks.

The code below implements a simple jump behavior. I'm not totally happy with it yet (especially the awkwardness of referencing the `bodyBehavior` as a passed-in arg), but it's the general idea I'm going for.

```tsx
import { Vec2 } from 'planck-js';
import { useBehavior, BodyBehavior } from 'r2d';
import { useInputStore } from '../store/useInputStore';

export function useJump({
  bodyBehavior,
  jumpPower = 30,
}: {
  bodyBehavior: BodyBehavior;
  jumpPower?: number;
}) {
  return useBehavior({
    onUpdate: () => {
      if (keyboard.getKey(' ')) {
        bodyBehavior.applyLinearImpulse(Vec2(0, jumpPower), {
          wake: true,
        });
      }
    },
    initialState: {},
    // this is purely hypothetical, there's no real reason for
    // an API on this behavior - but just to demonstrate.
    makeApi: (state) => ({
      logFoo: () => console.log('foo!'),
    }),
  });
}
```

To use your behavior you call it, passing in any args you specified. Here's how you might use `useJump`:

```tsx
function Player() {
  const meshRef = useRef(null);
  const bodyBehavior = useBody({
    mesh: meshRef.current,
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
  });

  // use our behavior!
  const jumpBehavior = useJump({
    bodyBehavior,
    jumpPower = 10,
  });

  // invoke our API!
  useEffect(() => {
    jumpBehavior.logFoo();
  }, [jumpBehavior]);

  return (
    <mesh ref={meshRef}>
      <meshBasicMaterial color="blue" />
    </mesh>
  );
}
```

So, basically, this kind of composition / interaction is why it's nice to have small discrete hook behaviors right now. For example, having the collisions in a separate hook from `useBody` is nice because you'd want `useBody` early in your component (probably first thing), but then you may want to define some custom behaviors which would care about collisions - and then, you call `useCollisions` and invoke the APIs of your custom behaviors from the callbacks. Here's an example from the game I'm testing this library with:

```tsx
const meshRef = React.useRef(null);
const bodyBehavior = useBody({
  mesh: meshRef.current,
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
});

// behavior that makes the camera follow this object
useFollowCamera({ mesh: meshRef.current });

// behavior to handle player movement - perhaps we only want to allow
// jumping when they are in contact with a wall and the normal of that
// contact is upward - so we need to know about current collisions!
const controls = usePlayerControls({
  bodyBehavior,
});

useCollisions(bodyBehavior, {
  onBeginContact: ({ other, contact }) => {
    const otherBody = other.getBody();
    if (otherBody.getUserData().tags.includes(Tag.Wall)) {
      // our controls behavior exposes a way to add contacts
      // to a Set it stores in its internal state. It then uses
      // the contents of this Set each frame to see what objects
      // this player is in contact with, and what angle of contact,
      // etc.
      controls.addWallContact(contact);
    }
  },
  onEndContact: ({ other, contact }) => {
    const otherBody = other.getBody();
    if (otherBody.getUserData().tags.includes(Tag.Wall)) {
      controls.removeWallContact(contact);
    }
  },
});
```
