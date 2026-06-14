import { Card } from "./Card.jsx";

/**
 * The "there is nothing here yet" panel.
 *
 * A good empty state says what would be here and how to make it appear — which
 * is why `action` exists and why `description` is not optional in practice.
 * "No doctors registered yet" alone leaves an admin guessing; the same message
 * with a route to the form does not.
 *
 * Deliberately not the same component as an error state. "Nothing booked yet"
 * and "we could not load your bookings" look similar and mean opposite things:
 * one is a normal, correct outcome, the other is a failure the user should be
 * able to react to. Use Alert with tone="danger" for the second.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => (
  <Card className={`px-6 py-12 text-center ${className}`} padded={false}>
    {Icon && (
      <Icon aria-hidden="true" className="mx-auto mb-4 text-3xl text-fg-subtle" />
    )}
    <p className="text-sm font-medium text-fg">{title}</p>
    {description && (
      <p className="mx-auto mt-1 max-w-md text-sm text-fg-subtle">
        {description}
      </p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </Card>
);
