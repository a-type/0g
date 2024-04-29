import * as React from 'react';
import { spaceGame, spaceGameRoot } from './spaceGame.js';

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
    <div className="gameRoot">
      <div ref={ref} />
    </div>
  );
}
