import { Field } from "./Field.jsx";
import { useFieldIds } from "./use-field-ids.js";
import { controlClass } from "./field-styles.js";

/**
 * A labelled select.
 *
 * `options` takes either strings or `{ value, label }` objects, since some
 * lists are plain words (departments, genders) and some carry an id (doctors).
 *
 * `placeholder` becomes the empty first option. It stays selectable-but-empty
 * rather than being a disabled dummy, so that a `required` select still fails
 * validation when nothing real is chosen — and it doubles as the slot for the
 * "select a department first" style messages the doctor picker needs.
 */
export const Select = ({
  label,
  hint,
  error,
  optional,
  id,
  className,
  fieldClassName,
  options = [],
  placeholder,
  onChange,
  onValueChange,
  children,
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
      <select
        id={ids.id}
        aria-invalid={ids.invalid || undefined}
        aria-describedby={ids.describedBy}
        className={controlClass({ invalid: ids.invalid, className })}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const text = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
        {children}
      </select>
    </Field>
  );
};
