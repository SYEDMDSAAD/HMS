/**
 * Loading placeholders.
 *
 * These replace "Loading doctors…" text. The difference is not decorative: a
 * skeleton reserves the space the content will occupy, so the page does not
 * jump when it arrives, and it communicates *how much* is coming.
 *
 * The whole group is aria-hidden and paired with a single visually-hidden
 * "Loading…" line. Announcing eight grey rectangles individually is worse than
 * useless, and `animate-pulse` is already switched off for anyone who has asked
 * for reduced motion — packages/theme/base.css does that globally.
 */

export const Skeleton = ({ className = "" }) => (
  <span
    className={`block animate-pulse rounded-md bg-surface-muted ${className}`}
  />
);

/** A block of fake text lines; the last is short, as a real paragraph's is. */
export const SkeletonText = ({ lines = 3, className = "" }) => (
  <span className={`block space-y-2 ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton
        key={index}
        className={`h-3.5 ${index === lines - 1 ? "w-2/3" : "w-full"}`}
      />
    ))}
  </span>
);

/**
 * Wrap a skeleton layout in this so assistive tech hears one honest sentence
 * instead of nothing at all.
 */
export const SkeletonGroup = ({ label = "Loading…", className = "", children }) => (
  <div className={className}>
    <span className="sr-only" role="status">
      {label}
    </span>
    <div aria-hidden="true">{children}</div>
  </div>
);
