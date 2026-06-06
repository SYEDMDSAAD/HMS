import { Field, useFieldIds } from "./Field.jsx";
import { controlClass } from "./field-styles.js";

export const Textarea = ({
  label,
  hint,
  error,
  optional,
  id,
  className,
  fieldClassName,
  rows = 4,
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
      <textarea
        id={ids.id}
        rows={rows}
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
