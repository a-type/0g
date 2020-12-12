import * as React from 'react';
import { BricksGame } from '../demos/bricks/BricksGame';

export function HomePage() {
  return (
    <article>
      <div
        css={(theme) => ({
          flexDirection: 'column',
          alignItems: 'center',
          width: '100vw',
          height: '80vh',
        })}
      >
        <BricksGame />
      </div>
      <section css={(theme) => ({ padding: theme.space[2] })}>
        <p>Stuff about library goes here</p>
      </section>
    </article>
  );
}
