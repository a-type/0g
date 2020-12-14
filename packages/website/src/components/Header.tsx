import * as React from 'react';

export function Header() {
  return (
    <header
      css={(theme) => ({
        padding: theme.space[2],
        alignItems: 'center',
      })}
    >
      <span
        css={(theme) => ({
          fontFamily: theme.fonts.heading,
          padding: theme.space[2],
        })}
      >
        0G
      </span>
    </header>
  );
}
