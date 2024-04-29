import * as React from 'react';
import { animated, useSpring } from '@react-spring/web';
import { SpaceGameRoot } from '../demos/space/SpaceGameRoot.js';

const SCROLL_THRESHOLD = 500;

export function HomePage() {
  const [{ scrollTop }, set] = useSpring(() => ({
    scrollTop: 0,
  }));

  React.useEffect(() => {
    const handleScroll = () => {
      set({ scrollTop: window.scrollY });
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [set]);

  return (
    <article>
      <animated.div
        className="hero"
        style={
          {
            opacity: scrollTop.to((v) =>
              Math.max(0.5, (SCROLL_THRESHOLD - v) / SCROLL_THRESHOLD),
            ),
          } as any
        }
      >
        <h1>0G</h1>
        <animated.section
          style={
            {
              opacity: scrollTop.to(
                (v) => (SCROLL_THRESHOLD - v) / SCROLL_THRESHOLD,
              ),
            } as any
          }
        >
          <p>The weightless game framework for TypeScript.</p>
        </animated.section>
      </animated.div>
      <SpaceGameRoot />
      <section>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </section>
    </article>
  );
}
