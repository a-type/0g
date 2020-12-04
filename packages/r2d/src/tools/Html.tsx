import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { worldContext } from '../World';

export type HtmlProps = React.HTMLAttributes<HTMLDivElement> & {
  prepend?: boolean;
  portal?: React.MutableRefObject<HTMLElement>;
};

export const Html = React.forwardRef(
  ({ prepend, portal, ...rest }: HtmlProps, ref: React.Ref<HTMLDivElement>) => {
    const [el] = React.useState(() => document.createElement('div'));
    const target = portal?.current ?? document.body;

    React.useEffect(() => {
      if (target) {
        if (prepend) target.prepend(el);
        else target.appendChild(el);
      }
      return () => {
        if (target) target.removeChild(el);
        ReactDOM.unmountComponentAtNode(el);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);

    // bridge contexts we need
    const world = React.useContext(worldContext);

    React.useEffect(
      () =>
        void ReactDOM.render(
          <worldContext.Provider value={world}>
            <div ref={ref} {...rest} />
          </worldContext.Provider>,
          el
        )
    );

    return null;
  }
);
