import * as React from 'react';

export type ButtonProps = React.HTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <button {...props} ref={ref} />
});
