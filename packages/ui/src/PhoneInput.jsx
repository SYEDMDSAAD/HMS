import { Field, useFieldIds } from "./Field.jsx";
import { controlClass } from "./field-styles.js";

/**
 * An Indian mobile number, with the dialling code as a fixed prefix.
 *
 * The prefix is a sibling `<span>`, not text inside the input, so the stored
 * value is ten digits and never "+91 98765 43210" — the backend and the
 * `[6-9][0-9]{9}` pattern both expect the bare number. It is aria-hidden
 * because "plus nine one" read before every phone field adds nothing: the label
 * already says what the field is, and the prefix is not editable.
 *
 * Digits-only filtering and the 10-digit cap live here rather than in each
 * form's `updateDigits` helper, which existed in five copies.
 */
export const PhoneInput = ({
  label = "Mobile number",
  hint,
  error,
  optional,
  id,
  className,
  fieldClassName,
  prefix = "+91",
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
      <div className="flex">
        <span
          aria-hidden="true"
          className="inline-flex select-none items-center rounded-l-lg border border-r-0
            border-line-control bg-surface-muted px-3 text-sm text-fg-muted"
        >
          {prefix}
        </span>
        <input
          id={ids.id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          pattern="[6-9][0-9]{9}"
          title="10-digit Indian mobile number starting with 6-9"
          aria-invalid={ids.invalid || undefined}
          aria-describedby={ids.describedBy}
          className={controlClass({
            invalid: ids.invalid,
            className: `rounded-l-none ${className || ""}`,
          })}
          onChange={(event) => {
            onChange?.(event);
            onValueChange?.(event.target.value.replace(/\D/g, "").slice(0, 10));
          }}
          {...rest}
        />
      </div>
    </Field>
  );
};
