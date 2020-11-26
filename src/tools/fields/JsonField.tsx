import * as React from 'react';

export type JsonFieldProps = {
  label: string;
  value?: any;
  onChange?: (val: any) => void;
  className?: string;
};

export const JsonField = React.forwardRef<HTMLTextAreaElement, JsonFieldProps>(
  ({ label, value, onChange, ...rest }, ref) => {
    const [intermediateVal, setIntermediateVal] = React.useState(
      JSON.stringify(value)
    );
    const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      setIntermediateVal(ev.target.value);
      try {
        const val = JSON.parse(ev.target.value);
        if (val) {
          onChange?.(val);
        }
      } catch (err) {
        return;
      }
    };
    React.useEffect(() => {
      setIntermediateVal(JSON.stringify(value));
    }, [value]);

    return (
      <label {...rest}>
        <div>{label}</div>
        <textarea
          ref={ref}
          style={{ whiteSpace: 'pre-wrap' }}
          value={intermediateVal}
          onChange={handleChange}
        />
      </label>
    );
  }
);
