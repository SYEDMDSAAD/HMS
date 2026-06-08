import { useId } from "react";

/**
 * Derives the ids that bind a label, a control and its hint/error together.
 *
 * Lives apart from Field.jsx so that file exports only components — React Fast
 * Refresh cannot track a module that mixes the two, and would fall back to a
 * full reload on every edit.
 *
 * `id` is optional. React's useId is stable across renders and unique per
 * instance, so call sites only pass one when something outside the field has to
 * reference the control.
 */
export const useFieldIds = (id, { hint, error } = {}) => {
  const generated = useId();
  const base = id || generated;
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;

  return {
    id: base,
    hintId,
    errorId,
    invalid: Boolean(error),
    // Only one of the two is ever rendered (see Field), and pointing
    // aria-describedby at an id that is not in the document is worse than
    // pointing at nothing — the description is silently dropped.
    describedBy: errorId || hintId,
  };
};
