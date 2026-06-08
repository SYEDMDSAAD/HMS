import { Field } from "./Field.jsx";
import { useFieldIds } from "./use-field-ids.js";
import { controlClass } from "./field-styles.js";

/**
 * A labelled text input.
 *
 * `onValueChange` receives the value rather than the event, because every call
 * site in this app immediately did `e.target.value`. The raw `onChange` still
 * fires if you pass it, for the cases that need the event.
 */
export const Input = ({
  label,
  hint,
  error,
  optional,
  id,
  className,
  fieldClassName,
  onChange,
  onValueChange,
  ...rest
}) => {
  const ids = useFieldIds(id, { hint, error });

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      ids={ids}
      className={fieldClassName}
    >
      <input
        id={ids.id}
        aria-invalid={ids.invalid || undefined}
        aria-describedby={ids.describedBy}
        className={controlClass({ invalid: ids.invalid, className })}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...rest}
      />
    </Field>
  );
};

/**
 * A text input that will only ever hold digits — Aadhaar numbers, PIN codes.
 *
 * The stripping happens here rather than at each call site, where it lived as a
 * copy of the same `updateDigits` helper in five files. Note it is `type="text"`
 * with `inputMode="numeric"`, not `type="number"`: a number input drops leading
 * zeros, accepts `e` and `-`, and grows a spinner nobody wants on an ID number.
 */
export const NumericInput = ({ maxLength, onValueChange, ...rest }) => (
  <Input
    type="text"
    inputMode="numeric"
    onValueChange={(value) =>
      onValueChange?.(value.replace(/\D/g, "").slice(0, maxLength))
    }
    {...rest}
  />
);
