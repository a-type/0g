# `0G`

## Entities, Systems, and Stores

### Entities

Entities describe what it takes to create a type of Entity.
Entities declare a name, which is globally unique and used elsewhere to refer to it.
Entities declare Stores, which determine what kind of Entity it shall be.
Entities declare a Component, which defines how it shows up in the scene.
Entities have an ID which identifies them.

### Systems

Systems process logic on Entities each tick.
Systems can define local state by defining `state`.

```tsx
// TODO: update code example
```

Multiple systems can modify the same Stores on the same Entity and thereby interact.
Systems may only interact via data.
The data is the boundary.

```tsx
// TODO: update code example
```

### Stores

Stores are just shapes of data.

```tsx
export const transformStore = 0g.store('transform', {
  x: 0,
  y: 0,
  angle: 0,
});
```

When an Entity is rendered, its Store data is added to the World.
When an Entity is unmounted, it is removed from the World.

## Saving and Loading

Stores of rendered Entities are persisted as part of the save state.
Entities are restored from this snapshot on load.

Save files store entities and stores.

```js
// TODO: finalize snapshot shape
```

## Finding, Creating, Destroying

Each System has access to the World.
The World has a list of all Entities being rendered.
Get any other Entity by ID from the World.

```tsx
type World = {
  get(id: string): EntityData;
  // more things come from plugins ?
};
```

To "destroy" an Entity, its parent must stop rendering it.
Usually this involves interacting with that parent's Stores via a System.
For example, a Beehive Entity may have a list of bees it manages.
Use a System to remove one of the bees from the Beehive's bee list Store.
Then the bee will be unmounted and subsequently removed from the World.

## Entities

Entities can reference one another (via Systems).
Entities expose only certain things publicly.

```tsx
type EntityData = {
  id: string;
  storesData: {
    [alias: string]: any;
  };
};
```

## Editor (TODO)

Scenes are really defined entirely by saved Entities and their Stores.
So to construct a scene we start with making our Entities.
Each Scene begins with a single Scene entity, which has children.
Once we have a Scene, we can open the editor.
The Editor can create Entities and define their Store data by adding them to Scene or others.
The Editor renders the initial state of all Entities.
But the Editor isn't only for initial states.
We can bring up the Editor any time during gameplay to tweak.

## Plugins

Plugins can add behavior to the World.
Physics is a good plugin example.
Plugins have several things:

1. _API_: plugins can provide some arbitrary API in the World Context.
2. _Wrappers_: plugins can wrap the World tree in Providers or other things.
3. _Stores_: plugins can add Stores to the game's Stores list.
4. _Systems_: plugins can add their own Systems to manage game behaviors.
5. _Anything else_: a plugin user can import other useful stuff like Components or Hooks directly from the plugin.

### Packaging Stores & Systems as Plugins

TODO

## Known issues

- Stores is a bad name - maybe Aspects? But it's not AOP...

## Entity Lifecycle

There is no generic concept of "children."
However, different Entities may construct specialized Stores which manage some particular concept of hierarchy.
For example, the `Bricks` Entity in Brick Breaker might have a Store which controls its brick pattern.
It then renders child Entities using their Entity components.

```tsx
const Bricks = entity(
  'Bricks',
  {
    config: game.stores.brickConfig({
      rows: 2,
      columns: 5,
    }),
    transform: game.stores.transform(),
  },
  ({
    stores: {
      config: { rows, columns },
      transform: { x, y },
    },
  }) => {
    return (
      <>
        {new Array(columns).fill(null).map((_, h) =>
          new Array(rows).fill(null).map((_, v) => (
            <Brick
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
);
```

Entities can only control their children's initial configuration:

- Initial Stores
- ID

Otherwise the child is managed by Systems like the parent.
When an Entity is mounted it is added to the scene with its initial Stores.
When an Entity is mounted it is assigned an ID if it was not given one.
When an Entity is unmounted it is removed from the scene.
If an Entity is mounted and it is already present in the World data, it connects to that data.
Therefore, when a saved scene is loaded and Entities begin rendering their children, those children seamlessly recover their prior state.
Orphaned Entities are cleaned up periodically. (TODO)
To reparent an Entity just render it from a different parent (TODO)
Somehow we enforce an Entity can't render twice (TODO)

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
// TODO: high-level store API for this
game.stores.children.get(scene)[newEntity.id] = newEntity;
```

Then the Scene will render the new Entity.
When rendered the Entity will be stored in World data.
To remove an Entity from Scene you do:

```ts
// TODO: high-level store API for this
delete game.stores.children.get(world.get('scene'))[id];
```

This generic `children` Store is the least specialized concept of children.
It is therefore the most verbose.
For example, if an Entity only renders one kind of child, you could do:

```ts
const bricks = world.get('bricks');
game.stores.brickPositions.get(bricks).push({ x: 10, y: 50 });
```

Supposing that `brickPositions` was a list of locations to place `Brick` Entities.

## The Flow

We start with Stores.
Define all the Stores, pass them to `create`, get a Game.
Then register Prefabs and Systems on Game.
We expose `stores` on Game.

```ts
const Player = entity(
  'Player',
  {
    transform: game.store.transform({ x: 0, y: 10 }),
  },
  () => {
    /* ... */
  },
);
```

Systems utilize `game.store` to reference an Entity's Stores by kind.

```ts
const body = game.system({
  name: 'body',
  run: (e) => {
    const transform = game.store.transform.get(e);
  },
});
```

## Store APIs

Stores can define higher-level APIs for users to streamline tasks.
But all logic remains pure, because Store APIs are pure.

```ts
game.stores.forces.applyImpulse(entity, { x: 5, y: 0 });
```

A high-level Store method like this can only modify its own Store instance on the Entity.

# New Ideas - ECS + React

Now that ECS is working, how about a React-focused ECS implementation?

```tsx
class PlayerHealth extends PersistentStore {
  // required? or constructor.name suffices?
  static key = 'PlayerHealth';

  // assign main data properties
  health = 100;

  // getters are allowed
  get isDead() {
    return this.health === 0;
  }

  // a static `set` method is available and can be composed
  // into new operations
  static takeDamage(p: Player, dmg: number) {
    Player.set(p, {
      health: Math.max(0, p.health - dmg),
    });
  }
}
// not shown: StateStore (not saved in savefile),
// TagStore (no values), and ValueStore (single value)

const stores = { ...box2d.stores, Player };

// game is analogous to, say, a Redux/Zustand store or a
// gql client. It allows external interaction to the main
// state and plugs seamlessly into React via provider
const game = new Game({ stores });

// systems are React components. They can optionally render
// JSX to control the visuals of the game.
const PlayerMovement = () => {
  // useQuery returns a static reference to a Query object
  // managed by the game which caches entities that match
  // the requirements.
  const players = useQuery({
    all: [stores.PlayerHealth, stores.Transform],
  });

  const game = useGame();

  // runs every frame and iterates over query items
  useFrame(players, (entity) => {
    const playerHealth = stores.PlayerHealth.get(entity);
    const transform = stores.Transform.get(entity);

    // dead folks don't move
    if (playerHealth.isDead) return;

    if (game.input.keyboard.getKey('ArrowLeft')) {
      stores.Transform.set(transform, {
        x: transform.x - 5,
      });
    } else if (game.input.keyboard.getKey('ArrowRight')) {
      stores.Transform.set(transform, {
        x: transform.x + 5,
      });
    }
  });

  // runs only when a watched store changes
  useWatch(players, [stores.Transform], (entity) => {
    // this is totally contrived, idk what you'd do here.
  });

  return null;
};

const PlayerSprite = React.memo(({ entity }) => {
  const ref = useRef();

  useWatch(entity, [stores.Transform], () => {
    if (!ref.current) return;

    const transform = stores.Transform.get(entity);

    ref.current.x = transform.x;
    ref.current.y = transform.y;
  });

  return <Sprite ref={ref} />;
});

const PlayerSprites = () => {
  const players = useQuery({
    all: [stores.PlayerHealth, stores.Transform],
  });

  return players.entities.map((entity) => <PlayerSprite entity={entity} />);
};

const Game = () => {
  return (
    <World game={game}>
      <PlayerMovement />
    </World>
  );
};
```
