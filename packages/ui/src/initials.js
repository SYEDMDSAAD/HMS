/**
 * Initials from a person's name, for Avatar.
 *
 * Its own module so Avatar.jsx exports only components — React Fast Refresh
 * cannot track a file that mixes the two, and falls back to a full reload on
 * every edit.
 */

/** "Asha Menon" -> "AM"; "Asha" -> "A"; anything unusable -> "". */
export const initialsFor = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
