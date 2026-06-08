import { useFieldIds } from "./use-field-ids.js";

/**
 * A checkbox with its label beside it.
 *
 * Does not use Field: a checkbox reads as "[x] I have visited before", with the
 * label after the control and on the same line, so the stacked label-above-box
 * layout Field provides would be wrong here.
 *
 * The whole row is the label element, which makes the text itself a click
 * target — a 16px box is below the 24px minimum that touch guidance asks for,
 * and this is the cheapest way to fix that without making the box bigger than
 * the platform's native one.
 */
export const Checkbox = ({
  label,
  hint,
  id,
  className = "",
  checked,
  onChange,
  onCheckedChange,
  disabled,
  ...rest
}) => {
  const ids = useFieldIds(id, { hint });

  return (
    <div className={className}>
      <label
        htmlFor={ids.id}
        className={`flex items-center gap-3 text-sm text-fg ${
          disabled ? "cursor-not-allowed text-fg-subtle" : "cursor-pointer"
        }`}
      >
        <input
          id={ids.id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-describedby={ids.describedBy}
          className="h-4 w-4 shrink-0 rounded border-line-control text-accent-solid
            accent-accent-solid focus:outline-none focus-visible:ring-2
            focus-visible:ring-focus focus-visible:ring-offset-2
            focus-visible:ring-offset-canvas disabled:cursor-not-allowed"
          onChange={(event) => {
            onChange?.(event);
            onCheckedChange?.(event.target.checked);
          }}
          {...rest}
        />
        {label}
      </label>

      {hint && (
        <p id={ids.hintId} className="mt-1.5 ml-7 text-sm text-fg-subtle">
          {hint}
        </p>
      )}
    </div>
  );
};
