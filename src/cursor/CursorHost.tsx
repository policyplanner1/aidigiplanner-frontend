import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { CustomCursor } from "./CustomCursor";
import { moduleFromPath } from "./cursorConfig";
import { useCursor } from "./useCursor";

export function CursorHost() {
  const location = useLocation();
  const { setModule } = useCursor();

  useEffect(() => {
    setModule(moduleFromPath(location.pathname));
  }, [location.pathname, setModule]);

  return <CustomCursor />;
}
