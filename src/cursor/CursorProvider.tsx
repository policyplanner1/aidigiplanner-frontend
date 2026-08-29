import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  prefersReducedMotion,
  shouldEnableCursor,
  type CursorAction,
  type CursorModule,
  type CursorStatus,
} from "./cursorConfig";
import { CursorContext } from "./useCursor";

type CursorProviderProps = {
  children: ReactNode;
};

export function CursorProvider({ children }: CursorProviderProps) {
  const [module, setModule] = useState<CursorModule>("dashboard");
  const [action, setAction] = useState<CursorAction>("default");
  const [status, setStatus] = useState<CursorStatus>("idle");
  const [enabled, setEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const sync = () => {
      setEnabled(shouldEnableCursor());
      setReducedMotion(prefersReducedMotion());
    };
    sync();
    const coarse = window.matchMedia("(pointer: coarse)");
    const hover = window.matchMedia("(hover: none)");
    const width = window.matchMedia("(max-width: 768px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    coarse.addEventListener("change", sync);
    hover.addEventListener("change", sync);
    width.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      coarse.removeEventListener("change", sync);
      hover.removeEventListener("change", sync);
      width.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  const value = useMemo(
    () => ({
      module,
      action,
      status,
      enabled,
      reducedMotion,
      setModule,
      setAction,
      setStatus,
    }),
    [action, enabled, module, reducedMotion, status],
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}
