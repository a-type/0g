import * as React from 'react';

export type NumberFieldProps = {
  label: string;
  value?: number;
  onChange?: (val: number) => void;
  className?: string;
};

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ value, onChange, label, ...rest }, ref) => {
    return (
      <label {...rest}>
        <div>{label}</div>
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={(ev) => onChange?.(parseFloat(ev.target.value))}
        />
      </label>
    );
  }
);
