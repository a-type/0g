# `0G`

The weightless game framework for TypeScript.

### TypeScript Focused

`0G` strikes a balance between flexibility and confidence, supporting seamless TypeScript typing for important data boundaries like Components and core engine features.

### ECS inspired

`0G` tries to take the core ides of Entity-Component-System game frameworks and extend them with greater flexibility and concrete use cases.

### React Compatible

`0G` has some goodies for React developers like me to integrate familiar patterns into game development use cases. You can utilize React to power your game's UI, or you can hook up [`react-three-fiber`](https://github.com/pmndrs/react-three-fiber) or [`react-pixi`](https://github.com/inlet/react-pixi) to power your whole game.

Of course, React adds additional overhead and can require a lot of imperative bailouts (i.e. `ref`s) to render realtime visualizations - but you get to decide where to draw the line for your game.

For more details, take a look at the [`@0g/react`](https://github.com/a-type/0g/tree/master/packages/react) package after you've read up on the basics of `0G`.

## Show me a Game

```tsx
class Transform extends Component {
  x = 0;
  y = 0;
  randomJump() {
    this.set({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    });
  }
}

class ButtonTag extends Component {}

class Button extends StateComponent {
  element: HTMLButtonElement | null = null;
  lastJump: number;
}

class Score extends Component {
  points = 0;
  increment() {
    this.set({ points: this.points + 1 });
  }
}

class ButtonMover extends System {
  // new buttons that don't have a Button store connected yet
  newButtons = this.query({
    all: [ButtonTag, Transform],
    none: [Button],
  });
  // buttons that have been initialized
  buttons = this.query({
    all: [ButtonTag, Button, Transform],
  });
  // reference the player to increment component
  players = this.query({
    all: [Score],
  });

  setup = this.frame(this.newButtons, (entity) => {
    const element = document.createElement('button');
    element.innerText = 'Click!';
    element.style.position = 'absolute';
    element.addEventListener('click', () => {
      this.players.forEach((playerEntity) => {
        playerEntity.get(Score).increment();
      });
      entity.get(Transform).randomJump();
      entity.get(Button).set({ lastJump: Date.now() });
    });
    document.bodyElement.appendChild(element);
    entity.add(Button, {
      element,
    });
  });

  run = this.frame(this.buttons, (entity) => {
    const buttonStore = entity.get(Button);
    if (Date.now() - buttonStore.lastJump > 3000) {
      buttonStore.lastJump = Date.now();
      entity.get(Transform).randomJump();
    }
    // update button positions
    const transform = entity.get(Transform);
    buttonStore.element.style.left = transform.x;
    buttonStore.element.style.top = transform.y;
  });
}

class ScoreRenderer extends System {
  players = this.query({
    all: [Score],
  });

  scoreElement = document.getElementById('scoreDisplay');

  update = this.watch(this.players, [Score], (entity) => {
    this.scoreElement.innerText = entity.get(Score).points;
  });
}

const game = new Game({
  components: { Transform, ButtonTag, Button, Score },
  systems: [ButtonMover],
});

game.create('player').add(Score);

game.create('button').add(Transform).add(ButtonTag);
```

## Docs

### ECS-based Architecture

#### Components

```tsx
class Transform extends Component {
  x = 0;
  y = 0;
  angle = 0;

  get position() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}
```

To start modeling your game behavior, you'll probably first begin defining Components.

"Components" replace ECS "Components" naming (disambiguating the term from React Components). Components are where your game state lives. The purpose of the rest of your code is either to group, change, or render Components.

Components come in two flavors:

- _Persistent_ : Serializeable and runtime-editable<sup>1</sup>, this data forms the loadable "scene."
  - Example: Store the configuration of a physics rigidbody for each character
- _State_: Store any data you want. Usually these stores are derived from persistent stores at initialization time.
  - Example: Store the runtime rigidbody created by the physics system at runtime

<sup><sup>1</sup> Runtime editing is not yet supported... except in the devtools console.</sup>

#### Entities

```tsx
const transform = entity.get(stores.Transform);
transform.x = 100;
```

As in classic ECS, Entities are identifiers for groupings of Components. Each Entity has an ID. In `0G`, an Entity object provides some convenience tools for retrieving, updating, and adding Components to itself.

#### Queries

```tsx
bodies = this.query({
  all: [stores.Body, stores.Transform],
  none: [stores.OmitPhysics],
});
```

It's important, as a game developer, to find Entities in the game and iterate over them. Generally you want to find Entities by certain criteria. In `0G` the primary criteria is which Components they have associated.

Queries are managed by the game, and they monitor changes to Entities and select which Entities match your criteria. For example, you could have a Query which selects all Entities that have a `Transform` and `Body` store to do physics calculations.

#### Systems

```tsx
class DemoMove extends System {
  movable = this.query({
    all: [stores.Transform],
  });

  run = this.frame(this.movable, (entity) => {
    const transform = entity.getWritable(stores.Transform);
    if (this.game.input.keyboard.getKeyPressed('ArrowLeft')) {
      transform.x -= 5;
    } else if (this.game.input.keyboard.getKeyPressed('ArrowRight')) {
      transform.x += 5;
    }
  });
}
```

Systems are where your game logic lives. They utilize Queries to access Entities in the game which meet certain constraints. Using those Queries, they can iterate over matching entities each frame, or monitor specific Components for changes.

##### Using Systems to Render

Systems are also how you render your game. `0G` supports flexible approaches to rendering.

For Vanilla JS, you might want to use State Components (non-persistent) to initialize and store a renderable object, like a Pixi `Sprite` or a ThreeJS `Mesh`. The System can update the renderable each frame like any other data.

If you want to use React to render a game, you can utilize the [`@0g/react`](https://github.com/a-type/0g/tree/master/packages/react) package to actually write Systems as React Components. The package provides the hooks you'll need to accomplish the same behavior as class-based Systems.
