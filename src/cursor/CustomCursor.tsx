import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { CURSOR_ACCENT, isInteractiveTarget, isTextTarget } from "./cursorConfig";
import { useCursor } from "./useCursor";
import "./cursor.css";

export function CustomCursor() {
  const { module, action, enabled, reducedMotion, setAction } = useCursor();
  const rootRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const echoRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const echo = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const actionRef = useRef(action);
  actionRef.current = action;

  useEffect(() => {
    if (!enabled) {
      document.documentElement.removeAttribute("data-neural-cursor");
      return;
    }

    let frame = 0;
    const follow = reducedMotion ? 1 : 0.2;

    const tick = () => {
      echo.current.x += (mouse.current.x - echo.current.x) * follow;
      echo.current.y += (mouse.current.y - echo.current.y) * follow;
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0)`;
      }
      if (echoRef.current) {
        echoRef.current.style.transform = `translate3d(${echo.current.x}px, ${echo.current.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    const applyAction = (next: typeof action) => {
      if (next === actionRef.current) return;
      actionRef.current = next;
      setAction(next);
    };

    const onMove = (event: PointerEvent) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
      rootRef.current?.classList.remove("is-hidden");

      if (isTextTarget(event.target)) {
        applyAction("text");
        document.documentElement.setAttribute("data-neural-cursor", "text");
        rootRef.current?.classList.add("is-hidden");
        return;
      }

      document.documentElement.setAttribute("data-neural-cursor", "on");
      applyAction(isInteractiveTarget(event.target) ? "hover" : "default");
    };

    const onDown = () => {
      rootRef.current?.classList.add("is-click");
      window.setTimeout(() => rootRef.current?.classList.remove("is-click"), 280);
    };

    const onLeave = () => rootRef.current?.classList.add("is-hidden");

    document.documentElement.setAttribute("data-neural-cursor", "on");
    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeAttribute("data-neural-cursor");
    };
  }, [enabled, reducedMotion, setAction]);

  if (!enabled) return null;

  return createPortal(
    <div
      ref={rootRef}
      className={`neural-cursor is-hidden${reducedMotion ? " is-still" : ""}`}
      data-module={module}
      data-action={action === "text" ? "default" : action}
      style={{ ["--cursor-accent" as string]: CURSOR_ACCENT[module] }}
      aria-hidden
    >
      <div ref={echoRef} className="neural-cursor__layer">
        <span className="neural-cursor__halo" />
      </div>
      <div ref={coreRef} className="neural-cursor__layer">
        <span className="neural-cursor__bead" />
      </div>
    </div>,
    document.body,
  );
}
