/**
 * The progress indicator for the booking flow.
 *
 * An ordered list, not a row of divs, because that is what it is — and a screen
 * reader then announces "3 of 5" for free. The current step carries
 * aria-current="step", which is the property assistive tech looks for; the
 * colour and the filled circle are for everyone else.
 */
export const BookingSteps = ({ steps, current }) => (
  <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-3">
    {steps.map((label, index) => {
      const done = index < current;
      const active = index === current;

      return (
        <li key={label} className="flex items-center gap-2">
          <span
            aria-current={active ? "step" : undefined}
            className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition ${
              active
                ? "bg-accent-tint font-semibold text-accent-text"
                : done
                ? "text-fg-muted"
                : "text-fg-subtle"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                active
                  ? "bg-accent-solid text-accent-on-solid"
                  : done
                  ? "bg-success-600 text-white"
                  : "bg-surface-muted text-fg-subtle"
              }`}
            >
              {/* The tick is decorative — "Department" already reads as done
                  from its position before the current step. */}
              {done ? <span aria-hidden="true">✓</span> : index + 1}
            </span>
            {label}
          </span>

          {index < steps.length - 1 && (
            <span aria-hidden="true" className="text-fg-subtle">
              ›
            </span>
          )}
        </li>
      );
    })}
  </ol>
);
