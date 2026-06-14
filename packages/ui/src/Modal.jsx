import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";

/**
 * A modal dialog, built on the native <dialog> element.
 *
 * `showModal()` gives us, from the platform, the four things hand-rolled
 * modals almost always get wrong: focus moves into the dialog, focus is
 * trapped there, Escape closes it, and everything behind it becomes inert to
 * both pointer and screen reader. A div-with-a-backdrop has to reimplement all
 * of that, and usually reimplements two of them.
 *
 * What the platform does not do is lock background scroll, so that is here.
 *
 * No consumer yet — Parts 8 and 9 need it for confirming a rejection and for
 * the booking flow. It is exercised in the browser rather than assumed to work.
 */
export const Modal = ({
  open,
  onClose,
  title,
  description,
  footer,
  size = "md",
  children,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      // Fires for Escape as well as for close(); routing both through onClose
      // keeps React's `open` in step with the DOM's. Without this, Escape
      // closes the dialog while the parent still thinks it is open, and it
      // cannot be reopened.
      onClose={onClose}
      // A click whose target is the dialog itself landed on the backdrop —
      // the content sits in a child element.
      onClick={(event) => {
        if (event.target === ref.current) onClose?.();
      }}
      aria-labelledby={title ? "uc-modal-title" : undefined}
      className={`m-auto w-[calc(100vw-2rem)] rounded-2xl border border-line bg-surface
        p-0 text-fg shadow-e3 backdrop:bg-ink-950/50 ${
          size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg"
        }`}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div className="min-w-0">
          {title && (
            <h2
              id="uc-modal-title"
              className="text-lg font-semibold tracking-tight text-fg"
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-fg-muted">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Close dialog"
          className="-mr-2 -mt-1 shrink-0 rounded-lg p-2 text-fg-subtle transition
            hover:bg-surface-muted hover:text-fg focus:outline-none
            focus-visible:ring-2 focus-visible:ring-focus"
        >
          <MdClose aria-hidden="true" />
        </button>
      </div>

      {children && <div className="px-6 py-5">{children}</div>}

      {footer && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-line px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
};
