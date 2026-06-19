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

  // Escape is handled here rather than left to the platform.
  //
  // <dialog> closes itself on Escape, which sounds like a feature until you
  // pair it with React: the DOM closes, the `open` prop stays true, and the two
  // are now out of step. Observed symptoms, both reproduced in the browser
  // before this existed — the page stays permanently scroll-locked, and the
  // dialog can never be reopened, because `setOpen(true)` is a no-op when the
  // state is already true.
  //
  // The usual fix is to listen for the dialog's `close` event and mirror it
  // into state. That did not fire here, in this React 18 + Chrome combination,
  // via React's onClose prop or a native listener, so the reliable route is to
  // intercept the keystroke in the capture phase, cancel the platform's own
  // close, and let React drive: state flips, the effect above calls close(),
  // and the DOM follows the prop instead of racing it.
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose?.();
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
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
