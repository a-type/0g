## Prefabs, Systems, and Stores

### Prefabs

Prefabs describe what it takes to create a type of Entity.
Prefabs declare a name, which is globally unique and used elsewhere to refer to it.
Prefabs declare Stores, which determine what kind of Entity it shall be.
Prefabs declare a Component, which defines how the Prefab shows up in the scene.

```tsx
// a Prefab module
export const Player = r2d.prefab({
  name: 'Player',
  stores: {
    transform,
    bodyConfig,
    contacts,
  },
  Component: ({ stores: { transform, sprite } }) => (
  <group position={transform.position.toArray()}>
    <Sprite {...sprite} />
  </group>
  ),
};
```

Prefab render is more versatile than it seems though.
As long as you have data to power it, you can render anything.

```tsx
Component: ({ stores: { transform, sprites } }) => (
  <group position={transform.position.toArray()}>
    {sprites.map((sprite) => (
      <Sprite {...sprite} key={sprite.id} />
    ))}
  </group>
);
```

### Entities

Prefabs become Entities when instantiated.
Entities have an ID which identifies them.
Entities store Store data corresponding to their Prefab's Stores.

### Systems

Systems declare their needed shared data by mounting `stores`.
Systems can define local state by defining `state`.
Local state can derive from store initial values by passing a function.

```tsx
export const rigidBody = (context) => ({
  stores: {
    transform: transformStore(),
    body: bodyStore()
  },
  state: (stores) => ({
    body: createBody(context.world, stores.body);
  }),
  run: (delta, stores, state) => {
    // copy values from simulated body to transform
    stores.transform.position.copy(state.body.position);
    stores.transform.rotation = state.body.rotation;
  },
});
```

Multiple systems can require the same `stores` and share data.

```tsx
export const gun = (context) => ({
  stores: {
    transform: transformStore(),
    input: inputStore(),
  },
  run: (delta, stores) => {
    if (stores.input.shoot.isDown) {
      context.instantiate('Bullet', {
        position: stores.transform.position,
        velocity: new Vector2(10, 0),
      });
    }
  },
});
```

### Stores

Stores are just shapes of data.

```tsx
export const transformStore = () =>
  store({
    position: new Vector2(),
    rotation: 0,
  });

export const bodyStore = () =>
  store({
    shape: 'circle',
    radius: 1,
    density: 1,
  });
```

When an Entity is created, all of its Systems' required stores are attached to it.

### Structure of abstractions

entity

- id
- prefab
  - systems
    - stores

## Saving and Loading

Stores are persisted as part of the save state.
Stores are restored with each entity on load.

Save files store entities and stores.

```js
[
  {
    id: 'a',
    prefab: 'Player',
    stores: {
      transform: {
        position: { x: 0, y: 0 },
        rotation: 0,
      },
      body: {
        shape: 'circle',
        radius: 1,
        density: 1,
      },
    },
  },
];
```

## Finding, Creating, Destroying

Each System has access to Context.
Context is game-global stuff, including the scene manifest (what's in the scene).
Get any other Entity by ID from the context.
Create new Entities from any System using a Prefab name, and an initial Stores state.
Destroy Entities by ID from any System.

```tsx
type Context = {
  get(id: string): Entity;
  create(prefabName: string, initialStores?: any): Entity;
  destroy(id: string): void;
  // more things come from plugins ?
};
```

## Entities

Entities can reference one another (via Systems).
Entities expose only certain things publicly.

```tsx
type Entity = {
  id: string;
  prefab: string;
  stores: {
    [alias: string]: any;
  };
};
```

## Editor

Scenes are really defined entirely by saved Entities and their Stores.
So to construct a scene we start with making our Prefabs.
Once we have Prefabs, we can open an Editor.
The Editor can create Entities from Prefabs and define their Store data.
The Editor renders the initial state of all Entities.
But the Editor isn't only for initial states.
We can bring up the Editor any time during gameplay to tweak.

## Plugins

Plugins can add behavior to the World.
Physics is a good plugin example.
Plugins have several hook points:

1. _Context_: plugins can provide values to Context.
2. _Providers_: plugins can wrap the World tree in Providers.

... more ? ...

## Scenes

A Scene is just a collection of entities.
Entities are structured in a flat map, keyed by ID.
Tree hierarchy is managed in a separate datastructure.
The tree defines parent-child relationships of entity IDs.
No other data is stored in the tree.

## Unsolved Questions

### I want to have systems write to the same "kind" of store without overlap

The practical case I ran into was a single Entity which renders several sprites. There are good reasons to do that.

Sketching some ideas for how to tackle it...

**"Common" (default) and "namespaced" stores**

```tsx
const sprite = r2d.system({
  stores: {},
  namespacedStores: {
    sprite,
  },
  run() {},
});

const Player = r2d.prefab({
  systems: {
    body: sprite,
    clothes: sprite,
  },
  Component({ namespacedStores }) {
    const bodyTex = useTexture(namespacedStores.body.source);
    const clothesTex = useTexture(namespacedStores.clothes.source);

    // the rest
  },
});
```

- Pros: Explicit, compatible
- Cons: Awkward, verbose

**Tweaked: "Local" (default) and "Shared" stores**

```tsx
const sprite = r2d.system({
  local: {
    sprite,
  },
  common: {
    // ..etc
  },
  run() {},
});
```

- Pros: Explicit, relatively succinct
- Cons: Still awkward, not compatible

**Higher-order systems**

```tsx
const sprite = (alias: string = 'sprite') =>
  r2d.system({
    stores: {
      [alias]: spriteData,
    },
    // ...
  });

const Player = r2d.prefab({
  systems: {
    body: sprite('bodySprite'),
    clothes: sprite('clothesSprite'),
  },
  run({ stores: { bodySprite, clothesSprite } }) {
    // etc
  },
});
```

- Pros: leverages flexibility / extensibility, very succinct
- Cons: complicates systems, hard to typescriptify?

**Store-mapping**

```tsx
const Player = r2d.prefab({
  systems: {
    body: alias(sprite, { sprite: 'bodySprite' }),
    clothes: alias(sprite, { sprite: 'clothesSprite' }),
  },
  run({ stores: { bodySprite, clothesSprite } }) {
    // etc
  },
});
```

- Pros: low-touch, semantic
- Cons: probably hard to typescriptify

**Invert store and system relationships**

Something more like ECS.

```tsx
const rigidBody = r2d.system({
  stores: {
    bodyConfig,
    transform,
    forces,
    collisions,
  },
  run() {}
});

const bodyConfig = r2d.store(...);

const Player = r2d.prefab({
  stores: {
    bodyConfig: bodyConfig({ ... }),
    transform: transform({ ... }),
    // etc
  },
  Component({ stores }) {
    // etc
  }
});

const World = () => {
  return <World prefabs={prefabs} systems={systems} />
}
```
