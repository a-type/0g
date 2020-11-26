import * as React from 'react';

export type StringFieldProps = {
  label: string;
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
};

export const StringField = React.forwardRef<HTMLInputElement, StringFieldProps>(
  ({ label, value, onChange, ...rest }, ref) => {
    return (
      <label {...rest}>
        <div>{label}</div>
        <input
          ref={ref}
          value={value}
          onChange={(ev) => onChange?.(ev.target.value)}
        />
      </label>
    );
  }
);
