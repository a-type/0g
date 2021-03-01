import * as React from 'react';

export function HomePage() {
  return (
    <article>
      <h1
        css={(theme) => ({
          fontFamily: theme.fonts.heading,
        })}
      >
        0G
      </h1>
      <section css={(theme) => ({ padding: theme.space[2] })}>
        <p>Stuff about library goes here</p>
      </section>
    </article>
  );
}
