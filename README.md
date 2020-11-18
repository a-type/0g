## Prefabs, Systems, and Stores

### Prefabs

Prefabs describe what it takes to create a type of Entity.
Prefabs have a name, which is globally unique and used elsewhere to refer to it.
Prefabs have Systems, which define how they interact with the world and others.
Prefabs have a render, which defines how the Prefab shows up in the scene.

```tsx
// a Prefab module
export const name = 'Player';

export const systems = {
  body: rigidBody,
  movement: playerMovement,
};

export const render = ({ store: { transform, sprite } }) => (
  <group position={transform.position.toArray()}>
    <Sprite {...sprite} />
  </group>
);
```

Prefab render is more versatile than it seems though.
As long as you have data to power it, you can render anything.

```tsx
export const render = ({ store: { transform, sprites } }) => (
  <group position={transform.position.toArray()}>
    {sprites.map((sprite) => (
      <Sprite {...sprite} key={sprite.id} />
    ))}
  </group>
);
```

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
