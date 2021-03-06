import * as React from 'react';
import { Editor } from '@0g/editor';
import { spaceGame, spaceGameRoot } from './spaceGame';

export function SpaceGameRoot() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.appendChild(spaceGameRoot);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      spaceGame.step(1000 / 60);
    };

    loop();

    return () => {
      el.removeChild(spaceGameRoot);
      cancelAnimationFrame(raf);
    };
  }, [ref]);

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div
        css={{
          width: '80vmin',
          height: '80vmin',
          margin: 'auto',
        }}
        ref={ref}
      />
      <Editor game={spaceGame} />
    </div>
  );
}
