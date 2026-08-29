import { createContext, useContext } from "react";

import type { CursorAction, CursorModule, CursorStatus } from "./cursorConfig";

export type CursorContextValue = {
  module: CursorModule;
  action: CursorAction;
  status: CursorStatus;
  enabled: boolean;
  reducedMotion: boolean;
  setModule: (module: CursorModule) => void;
  setAction: (action: CursorAction) => void;
  setStatus: (status: CursorStatus) => void;
};

export const CursorContext = createContext<CursorContextValue | null>(null);

export function useCursor() {
  const value = useContext(CursorContext);
  if (!value) {
    throw new Error("useCursor must be used inside CursorProvider");
  }
  return value;
}
