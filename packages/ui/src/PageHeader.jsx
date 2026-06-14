/**
 * The title block at the top of a page or a form card.
 *
 * `level` exists because the heading rank is a document-structure decision, not
 * a styling one: a page gets one h1, a section inside it gets an h2, and screen
 * reader users navigate by that outline. The size is set by `size`, separately,
 * so a visually small heading can still be the h1 it ought to be.
 */

const SIZES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl sm:text-4xl",
};

export const PageHeader = ({
  level = 2,
  size = "md",
  title,
  description,
  eyebrow,
  actions,
  align = "left",
  className = "",
}) => {
  const Heading = `h${level}`;
  const centred = align === "center";

  return (
    <div
      className={[
        centred ? "text-center" : "sm:flex sm:items-end sm:justify-between sm:gap-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={centred ? "" : "min-w-0"}>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-text">
            {eyebrow}
          </p>
        )}
        <Heading
          className={`${SIZES[size] ?? SIZES.md} ${
            eyebrow ? "mt-3" : ""
          } font-semibold tracking-tight text-fg`}
        >
          {title}
        </Heading>
        {description && (
          <p
            className={`mt-2 text-fg-muted ${
              centred ? "mx-auto max-w-xl" : ""
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className={centred ? "mt-6" : "mt-4 shrink-0 sm:mt-0"}>{actions}</div>
      )}
    </div>
  );
};
