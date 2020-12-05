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

## Packaging Stores & Systems as Reusable

TODO

## Known issues

- Since systems are defined as mutations on the game, it's really easy to forget to import their modules, and then you have no systems.
- Stores is a bad name - maybe Aspects?

## Entity Lifecycle

There is no generic concept of "children."
However, different Prefabs may construct specialized Stores which manage some particular concept of hierarchy.
For example, the `Bricks` Prefab in Brick Breaker might have a Store which controls its brick pattern.
It then renders child Entities using the `Entity` component.

```tsx
const Bricks = r2d.prefab({
  name: 'Bricks',
  stores: {
    config: r2d.store('brickConfig', {
      rows: 2,
      columns: 5,
    }),
    transform: r2d.store('transform', { x: 0, y: 0 }),
  },
  Component: ({
    stores: {
      config: { rows, columns },
      transform: { x, y },
    },
  }) => {
    return (
      <>
        {new Array(columns).fill(null).map((_, h) =>
          new Array(rows).fill(null).map((_, v) => (
            <Entity
              prefab="Brick"
              key={`${h}_${v}`}
              id={`${h}_${v}`}
              initial={{
                transform: { x: x + h * 10, y: y + v * 10 },
              }}
            />
          )),
        )}
      </>
    );
  },
});
```

Entities can only control their children's initial configuration:

- Prefab
- Initial Stores
- ID
  Otherwise the child is managed by Systems like the parent.
  When an Entity is mounted it is added to the scene with its initial Stores and Prefab.
  When an Entity is mounted it is assigned an ID if it was not given one.
  When an Entity is unmounted it is removed from the scene.
  If an Entity is mounted and it is already present in the World data, it connects to that data.
  Therefore, when a saved scene is loaded and Entities begin rendering their children, those children seamlessly recover their prior state.
  Orphaned Entities are cleaned up periodically.

Because of this approach we remove any imperative concepts of Entity management from World.
No `add` or `destroy`, etc.
World also no longer stores the Tree in its data.
The Tree is implicit and constructed in React by Entities.

The Scene is the only built-in Prefab.
The Scene has a special Store which is a generic children container.
Other Entities can use this Store, too, if they just want generic children.
It works like this:

```tsx
const newEntity = {
  id: 'player',
  prefab: 'Player',
  initial: {
    transform: { x: 0, y: 0 },
  },
};
const scene = world.get('scene');
scene.getStore('children')[newEntity.id] = newEntity;
```

Then the Scene will render the new Entity.
When rendered the Entity will be stored in World data.
To remove an Entity from Scene you do:

```ts
delete world.get('scene').getStore('children')[id];
```

This generic `children` Store is the least specialized concept of children.
It is therefore the most verbose.
For example, if an Entity only renders one kind of child, you could do:

```ts
const bricks = world.get('bricks');
bricks.getStore('brickPositions').push({ x: 10, y: 50 });
```

Supposing that `brickPositions` was a list of locations to place `Brick` Prefabs.

## Structure / Flow Ideas

Maybe we should start with Stores instead of Prefabs.
Define all the Stores, pass them to `create`, get a Game.
Then register Prefabs and Systems on Game.
Downside: no quick, anonymous inline Stores.
Upside: easier TypeScript workings, better uniqueness enforcement on Store Kind.
Prefabs could also shorthand stores by referencing Kind directly, maybe.

```ts
const Player = game.prefab({
  name: 'Player',
  stores: {
    // defaults
    transform: 'transform',
    // overrides
    body: ['body', { shape: 'capsule' }],
  },
});
```

Or maybe we expose `stores` on Game. They could have a more verbose API.

```ts
const Player = game.prefab({
  name: 'Player',
  stores: {
    transform: game.store.transform({ x: 0, y: 10 }),
  },
});
```

Systems could also utilize `game.store` instead of having to wrap Entities for store extraction.

```ts
const body = game.system({
  name: 'body',
  run: (e) => {
    const transform = game.store.transform.get(e);
    // or even...
    game.store.forces.applyImpulse(e, { x: 0, y: 10 });
  },
});
```

Then Stores can define APIs for users to streamline tasks.
But all logic remains pure, because Store APIs are pure.
It's not a bad idea...
