/**
 * A surface.
 *
 * `elevation` is the point of this component. Every card in the app was
 * `border + shadow-e1`, which is why the UI read as flat: when everything is
 * raised by the same amount, nothing is raised. The three steps from
 * packages/theme now mean something:
 *
 *   flat  a supporting panel — stat tiles, sidebars. Border only.
 *   e1    the default resting card.
 *   e2    something genuinely above the page. Rare.
 *
 * `interactive` is separate from elevation on purpose: it raises the card by
 * one step on hover, which is a signal that the whole card is clickable. Do not
 * set it on a card that is not.
 */

const ELEVATIONS = {
  flat: "",
  e1: "shadow-e1",
  e2: "shadow-e2",
};

export const Card = ({
  as: Component = "div",
  elevation = "e1",
  interactive = false,
  padded = true,
  className = "",
  children,
  ...rest
}) => (
  <Component
    className={[
      "rounded-2xl border border-line bg-surface",
      ELEVATIONS[elevation] ?? ELEVATIONS.e1,
      padded ? "p-6" : "",
      interactive ? "transition hover:shadow-e2" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {children}
  </Component>
);
