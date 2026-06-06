import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

import { Field, useFieldIds } from "./Field.jsx";
import { controlClass } from "./field-styles.js";

/**
 * A password box with a show/hide toggle.
 *
 * The toggle was copy-pasted into three files and missing from a fourth — the
 * dashboard's "register a doctor" form, where an admin typed a password for
 * someone else with no way to check it. Now every password field has it.
 *
 * Three details the copies got right and are worth keeping deliberate:
 *
 *  - `type="button"`, or clicking the eye submits the form.
 *  - The aria-label flips with the state, so a screen reader user hears what
 *    the button will *do*, not what it currently shows.
 *  - The icon is aria-hidden and the button carries the name; announcing both
 *    would read the control twice.
 */
export const PasswordInput = ({
  label = "Password",
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
  const [visible, setVisible] = useState(false);
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
      <div className="relative">
        <input
          id={ids.id}
          type={visible ? "text" : "password"}
          aria-invalid={ids.invalid || undefined}
          aria-describedby={ids.describedBy}
          className={controlClass({
            invalid: ids.invalid,
            className: `pr-11 ${className || ""}`,
          })}
          onChange={(event) => {
            onChange?.(event);
            onValueChange?.(event.target.value);
          }}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3.5
            text-fg-subtle transition hover:text-fg focus:outline-none
            focus-visible:ring-2 focus-visible:ring-focus"
        >
          {visible ? (
            <FaEyeSlash aria-hidden="true" />
          ) : (
            <FaEye aria-hidden="true" />
          )}
        </button>
      </div>
    </Field>
  );
};
