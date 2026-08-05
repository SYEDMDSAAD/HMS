import { useState } from "react";

import { initialsFor } from "./initials.js";

/**
 * A person, as a photograph or as their initials.
 *
 * It replaced two stock images, and the reason is the same for both: this slot
 * is supposed to say *who someone is*, and a generic person cannot. The
 * dashboard greeted every admin with a cartoon doctor — a picture of a
 * profession the signed-in user does not have — and every doctor without a
 * photo appeared as the same faceless grey man, which is wrong for half of
 * them before you even get to it being stock art.
 *
 * Initials always identify the person, need no asset, and inherit the theme.
 *
 * One tint for everyone rather than a colour derived from the name: a set of
 * generated hues would scan slightly better in a long list, but it reads as
 * decoration in a clinical UI, and the name is directly beside it in every
 * place this is used.
 */

const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};


export const Avatar = ({ name, src, size = "md", className = "" }) => {
  // A stored URL can 404 — Cloudinary assets get deleted, and the record keeps
  // pointing at them. Falling back to initials keeps a broken-image icon off
  // the page without a second placeholder file to maintain.
  const [failed, setFailed] = useState(false);
  const initials = initialsFor(name);
  const dimensions = SIZES[size] ?? SIZES.md;

  if (src && !failed) {
    return (
      <img
        src={src}
        // Decorative: every use of this sits beside the person's name, so
        // announcing it again would just repeat them.
        alt=""
        onError={() => setFailed(true)}
        className={`${dimensions} shrink-0 rounded-full object-cover ring-1 ring-line ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${dimensions} flex shrink-0 select-none items-center justify-center
        rounded-full bg-accent-tint font-semibold text-accent-text ring-1
        ring-inset ring-accent-600/25 ${className}`}
    >
      {initials || "·"}
    </span>
  );
};
